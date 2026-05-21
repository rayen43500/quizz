import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { Question } from '../models/Question.js';
import { Response } from '../models/Response.js';
import { validateAnswer } from '../utils/validateAnswer.js';
import { computeSessionStatsForQuiz } from '../services/sessionStats.js';

export function setupSocket(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(payload.userId);
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] ${socket.user.email} connected`);

    socket.on('join_session', async ({ sessionId }) => {
      const session = await Session.findById(sessionId);
      if (!session) return socket.emit('error', { message: 'Session not found' });
      if (!['waiting', 'active', 'paused'].includes(session.status)) {
        return socket.emit('error', { message: 'Session ended' });
      }

      socket.join(`session:${sessionId}`);
      socket.sessionId = sessionId;

      if (socket.user.role === 'student') {
        const exists = session.participants.find(
          (p) => p.userId.toString() === socket.user._id.toString()
        );
        if (!exists) {
          session.participants.push({
            userId: socket.user._id,
            displayName: `${socket.user.firstName} ${socket.user.lastName}`,
            isActive: true,
          });
          await session.save();
        }
        io.to(`session:${sessionId}`).emit('participant:joined', {
          user: { id: socket.user._id, name: `${socket.user.firstName} ${socket.user.lastName}` },
          count: session.participants.filter((p) => p.isActive).length,
        });
      }

      if (session.currentQuestionId) {
        const q = await Question.findById(session.currentQuestionId);
        if (q) {
          socket.emit('question:show', {
            question: {
              id: q._id,
              type: q.type,
              text: q.text,
              image: q.image,
              video: q.video,
              options: q.options?.map(({ id, label }) => ({ id, label })),
              timerSec: q.timerSec || 30,
              index: session.currentQuestionIndex ?? 0,
            },
            timerSec: q.timerSec || 30,
            index: session.currentQuestionIndex ?? 0,
          });
        }
      }
    });

    socket.on('leave_session', ({ sessionId }) => {
      socket.leave(`session:${sessionId}`);
    });

    socket.on('answer:submit', async ({ questionId, answer, responseTimeMs }) => {
      if (socket.user.role !== 'student' || !socket.sessionId) return;

      try {
        const session = await Session.findById(socket.sessionId);
        const question = await Question.findById(questionId);
        if (!session || !question) return;

        const exists = await Response.findOne({
          sessionId: socket.sessionId,
          questionId,
          userId: socket.user._id,
        });
        if (exists) return socket.emit('error', { message: 'Already answered' });

        const { isCorrect, valid } = validateAnswer(question, answer);
        if (!valid) return;

        await Response.create({
          sessionId: socket.sessionId,
          questionId,
          userId: socket.user._id,
          answer,
          isCorrect,
          responseTimeMs: responseTimeMs || 0,
        });

        const stats = await computeSessionStatsForQuiz(session, session.quizId);
        session.liveMetrics = stats;
        await session.save();

        io.to(`session:${socket.sessionId}`).emit('answer:received', {
          userId: socket.user._id.toString(),
          isCorrect,
          questionId,
        });
        io.to(`session:${socket.sessionId}`).emit('stats:update', stats);
      } catch (err) {
        console.error('[Socket answer:submit]', err.message);
      }
    });

    socket.on('question:show', async ({ questionIndex }) => {
      if (socket.user.role !== 'teacher' || !socket.sessionId) return;
      const session = await Session.findById(socket.sessionId);
      if (!session) return;
      const questions = await Question.find({ quizId: session.quizId }).sort({ order: 1 });
      const index = questionIndex ?? session.currentQuestionIndex + 1;
      if (index >= questions.length) return;
      const q = questions[index];
      if (q.type === 'multiple_choice' || q.type === 'poll') {
        if (!q.options || q.options.length < 2) return;
      }
      if (q.type === 'true_false') {
        const normalized = String(q.correctAnswer || '').toLowerCase();
        if (!['true', 'false'].includes(normalized)) return;
      }
      if (q.type === 'short_answer') {
        if (!String(q.correctAnswer || '').trim()) return;
      }
      session.currentQuestionIndex = index;
      session.currentQuestionId = q._id;
      await session.save();

      io.to(`session:${socket.sessionId}`).emit('question:show', {
        question: {
          id: q._id,
          type: q.type,
          text: q.text,
          image: q.image,
          video: q.video,
          options: q.options?.map(({ id, label }) => ({ id, label })),
          timerSec: q.timerSec || 30,
          index,
        },
        timerSec: q.timerSec || 30,
        index,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] ${socket.user?.email} disconnected`);
    });
  });
}
