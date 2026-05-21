import { z } from 'zod';
import { Response } from '../models/Response.js';
import { Session } from '../models/Session.js';
import { Question } from '../models/Question.js';
import { Quiz } from '../models/Quiz.js';
import { User } from '../models/User.js';
import { validateAnswer } from '../utils/validateAnswer.js';
import { computeSessionStatsForQuiz } from '../services/sessionStats.js';
import { aiClient } from '../services/aiClient.js';

async function updateStudentTopicProgress(userId, quizId, isCorrect) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz?.topic) return;
  const user = await User.findById(userId);
  if (!user || user.role !== 'student') return;

  const idx = user.topicsProgress?.findIndex((t) => t.topic === quiz.topic) ?? -1;
  const responses = await Response.find({ userId });
  const topicResponses = [];
  for (const r of responses) {
    const s = await Session.findById(r.sessionId);
    if (!s) continue;
    const q = await Quiz.findById(s.quizId);
    if (q?.topic === quiz.topic) topicResponses.push(r);
  }
  topicResponses.push({ isCorrect });
  const total = topicResponses.length;
  const correct = topicResponses.filter((r) => r.isCorrect).length;
  const mastery = total > 0 ? Math.round((correct / total) * 100) : 0;

  if (idx >= 0) {
    user.topicsProgress[idx].masteryPercent = mastery;
  } else {
    user.topicsProgress = user.topicsProgress || [];
    user.topicsProgress.push({ topic: quiz.topic, masteryPercent: mastery });
  }
  await user.save();
}

const submitSchema = z.object({
  sessionId: z.string(),
  questionId: z.string(),
  answer: z.string(),
  responseTimeMs: z.number().nonnegative(),
});

export async function submitResponse(req, res, next) {
  try {
    const data = submitSchema.parse(req.body);
    const session = await Session.findById(data.sessionId);
    if (!session || !['active', 'paused'].includes(session.status)) {
      return res.status(400).json({ error: 'Session not active' });
    }

    const isParticipant = session.participants.some(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (!isParticipant) return res.status(403).json({ error: 'Not a session participant' });

    const existing = await Response.findOne({
      sessionId: data.sessionId,
      questionId: data.questionId,
      userId: req.user._id,
    });
    if (existing) return res.status(409).json({ error: 'Already answered this question' });

    const question = await Question.findById(data.questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const { isCorrect, valid } = validateAnswer(question, data.answer);
    if (!valid) return res.status(400).json({ error: 'Invalid answer format' });

    const suspicionFlags = [];
    if (data.responseTimeMs < 500) suspicionFlags.push('fast_response');

    const response = await Response.create({
      sessionId: data.sessionId,
      questionId: data.questionId,
      userId: req.user._id,
      answer: data.answer,
      isCorrect,
      responseTimeMs: data.responseTimeMs,
      suspicionFlags,
    });

    const participant = session.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (participant) {
      participant.stats.total += 1;
      if (isCorrect) participant.stats.correct += 1;
      const n = participant.stats.total;
      participant.stats.avgResponseTimeMs =
        (participant.stats.avgResponseTimeMs * (n - 1) + data.responseTimeMs) / n;

      if (suspicionFlags.length > 0) {
        try {
          const suspicion = await aiClient.detectSuspicion({
            userId: req.user._id.toString(),
            responseTimeMs: data.responseTimeMs,
            flags: suspicionFlags,
            recentAnswers: [data.answer],
            score: participant.stats.correct / Math.max(participant.stats.total, 1),
          });
          participant.suspicionScore = suspicion.suspicionScore || 0;
          if (suspicion.alert) {
            const io = req.app.get('io');
            io?.to(`session:${session._id}`).emit('suspicion:alert', {
              userId: req.user._id.toString(),
              displayName: participant.displayName,
              score: suspicion.suspicionScore,
              flags: suspicion.flags,
            });
          }
        } catch {
          participant.suspicionScore = Math.min(100, participant.suspicionScore + 15);
        }
      }
      await session.save();
    }

    await updateStudentTopicProgress(req.user._id, session.quizId, isCorrect);

    const stats = await computeSessionStatsForQuiz(session, session.quizId);
    session.liveMetrics = stats;
    await session.save();

    const io = req.app.get('io');
    io?.to(`session:${session._id}`).emit('answer:received', {
      userId: req.user._id.toString(),
      displayName: participant?.displayName,
      isCorrect,
      questionId: data.questionId,
    });
    io?.to(`session:${session._id}`).emit('stats:update', stats);

    res.status(201).json({ response, stats, isCorrect });
  } catch (err) {
    next(err);
  }
}

export async function getSessionResponses(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      teacherId: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const responses = await Response.find({ sessionId: session._id })
      .populate('userId', 'firstName lastName')
      .populate('questionId', 'text type');
    res.json({ responses });
  } catch (err) {
    next(err);
  }
}

export async function getMyProgress(req, res, next) {
  try {
    const responses = await Response.find({ userId: req.user._id })
      .populate('questionId', 'text type')
      .sort({ submittedAt: -1 })
      .limit(100);
    const total = responses.length;
    const correct = responses.filter((r) => r.isCorrect).length;
    const successRate = total > 0 ? (correct / total) * 100 : 0;
    res.json({
      totalResponses: total,
      correctCount: correct,
      successRate: Math.round(successRate * 10) / 10,
      topicsProgress: req.user.topicsProgress,
      history: responses.slice(0, 20).map((r) => ({
        id: r._id,
        questionText: r.questionId?.text,
        isCorrect: r.isCorrect,
        responseTimeMs: r.responseTimeMs,
        submittedAt: r.submittedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}
