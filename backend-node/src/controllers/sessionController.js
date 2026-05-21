import { z } from 'zod';
import { Session } from '../models/Session.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { generateSessionCode } from '../utils/generateCode.js';
import { computeSessionStatsForQuiz } from '../services/sessionStats.js';
import { aiClient } from '../services/aiClient.js';

export async function listSessions(req, res, next) {
  try {
    const sessions = await Session.find({ teacherId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('quizId', 'title topic');
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
}

export async function createSession(req, res, next) {
  try {
    const { quizId } = req.body;
    const quiz = await Quiz.findOne({ _id: quizId, teacherId: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let code;
    let exists = true;
    while (exists) {
      code = generateSessionCode();
      exists = await Session.exists({ code });
    }

    const session = await Session.create({
      quizId: quiz._id,
      teacherId: req.user._id,
      code,
      status: 'waiting',
    });
    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
}

export async function launchSession(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    session.status = 'active';
    session.startedAt = new Date();
    session.currentQuestionIndex = -1;
    await session.save();

    const io = req.app.get('io');
    io?.to(`session:${session._id}`).emit('session:started', {
      sessionId: session._id.toString(),
      code: session.code,
      status: session.status,
    });

    res.json({ session });
  } catch (err) {
    next(err);
  }
}

export async function endSession(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    session.status = 'ended';
    session.endedAt = new Date();
    await session.save();

    const io = req.app.get('io');
    io?.to(`session:${session._id}`).emit('session:ended', {
      sessionId: session._id.toString(),
    });

    res.json({ session });
  } catch (err) {
    next(err);
  }
}

export async function getSession(req, res, next) {
  try {
    const session = await Session.findById(req.params.id).populate('quizId', 'title topic');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (
      req.user.role === 'teacher' &&
      session.teacherId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ session });
  } catch (err) {
    next(err);
  }
}

export async function getSessionByCode(req, res, next) {
  try {
    const session = await Session.findOne({
      code: req.params.code.toUpperCase(),
      status: { $in: ['waiting', 'active', 'paused'] },
    }).populate('quizId', 'title topic');
    if (!session) return res.status(404).json({ error: 'Session not found or ended' });
    res.json({
      session: {
        id: session._id,
        code: session.code,
        status: session.status,
        quiz: session.quizId,
        participantCount: session.participants.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function joinSession(req, res, next) {
  try {
    const { code } = z.object({ code: z.string().length(6) }).parse(req.body);
    const session = await Session.findOne({
      code: code.toUpperCase(),
      status: { $in: ['waiting', 'active', 'paused'] },
    });
    if (!session) return res.status(404).json({ error: 'Invalid or ended session code' });

    const existing = session.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (!existing) {
      session.participants.push({
        userId: req.user._id,
        displayName: `${req.user.firstName} ${req.user.lastName}`,
        joinedAt: new Date(),
        isActive: true,
        individualDifficulty: session.difficultyLevel,
      });
      await session.save();
    }

    res.json({
      session: {
        id: session._id,
        code: session.code,
        status: session.status,
        quizId: session.quizId,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function nextQuestion(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!['active', 'paused'].includes(session.status)) {
      return res.status(400).json({ error: 'Session not active' });
    }

    const questions = await Question.find({ quizId: session.quizId }).sort({ order: 1 });
    const index = req.body.questionIndex ?? session.currentQuestionIndex + 1;
    if (index >= questions.length) {
      return res.status(400).json({ error: 'No more questions' });
    }

    const question = questions[index];
    if (!question) return res.status(404).json({ error: 'Question not found' });

    if (question.type === 'multiple_choice' || question.type === 'poll') {
      if (!question.options || question.options.length < 2) {
        return res.status(400).json({ error: 'Question options missing' });
      }
    }

    if (question.type === 'true_false') {
      const normalized = String(question.correctAnswer || '').toLowerCase();
      if (!['true', 'false'].includes(normalized)) {
        return res.status(400).json({ error: 'Question correct answer missing' });
      }
    }

    if (question.type === 'short_answer') {
      if (!String(question.correctAnswer || '').trim()) {
        return res.status(400).json({ error: 'Question correct answer missing' });
      }
    }
    session.currentQuestionIndex = index;
    session.currentQuestionId = question._id;
    await session.save();

    const publicQuestion = {
      id: question._id,
      type: question.type,
      text: question.text,
      image: question.image,
      video: question.video,
      options: question.options?.map(({ id, label }) => ({ id, label })),
      timerSec: question.timerSec || 30,
      index,
      difficulty: session.difficultyLevel,
    };

    const io = req.app.get('io');
    io?.to(`session:${session._id}`).emit('question:show', {
      question: publicQuestion,
      timerSec: publicQuestion.timerSec,
      index,
    });

    res.json({ question: publicQuestion, session });
  } catch (err) {
    next(err);
  }
}

export async function getParticipants(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({
      participants: session.participants,
      activeCount: session.participants.filter((p) => p.isActive).length,
    });
  } catch (err) {
    next(err);
  }
}

export async function getLiveStats(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      teacherId: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const stats = await computeSessionStatsForQuiz(session, session.quizId);
    session.liveMetrics = stats;
    await session.save();

    const quiz = await Quiz.findById(session.quizId);
    let recommendation = null;
    if (stats.successRate < 50 && stats.totalResponses > 2) {
      try {
        const aiResult = await aiClient.liveAssistant({
          topic: quiz?.topic || 'General',
          successRate: stats.successRate,
          avgResponseTime: stats.avgResponseTime,
          engagement: stats.engagement,
          comprehensionScore: stats.comprehensionScore,
          activeParticipants: stats.activeCount,
        });
        recommendation = aiResult;
        const io = req.app.get('io');
        io?.to(`session:${session._id}`).emit('assistant:recommendation', aiResult);
      } catch (e) {
        recommendation = {
          message: `${Math.round(100 - stats.successRate)}% des réponses sont incorrectes. Envisagez des exemples plus simples.`,
          priority: 'high',
        };
      }
    }

    if (session.settings.adaptiveEnabled) {
      let newDifficulty = session.difficultyLevel;
      let reason = null;
      if (stats.successRate > 80) {
        newDifficulty = Math.min(5, session.difficultyLevel + 1);
        reason = 'High success rate — increasing difficulty';
      } else if (stats.successRate < 50) {
        newDifficulty = Math.max(1, session.difficultyLevel - 1);
        reason = 'Low success rate — decreasing difficulty';
      }
      if (newDifficulty !== session.difficultyLevel) {
        session.difficultyLevel = newDifficulty;
        await session.save();
        const io = req.app.get('io');
        io?.to(`session:${session._id}`).emit('difficulty:adjusted', {
          level: newDifficulty,
          reason,
        });
      }
    }

    res.json({ stats, recommendation });
  } catch (err) {
    next(err);
  }
}
