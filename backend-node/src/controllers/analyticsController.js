import { Analytics } from '../models/Analytics.js';
import { Session } from '../models/Session.js';
import { Response } from '../models/Response.js';
import { Quiz } from '../models/Quiz.js';
import { User } from '../models/User.js';
import { computeSessionStatsForQuiz } from '../services/sessionStats.js';
import { aiClient } from '../services/aiClient.js';

export async function getSessionAnalytics(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      teacherId: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const stats = await computeSessionStatsForQuiz(session, session.quizId);
    const quiz = await Quiz.findById(session.quizId);

    let aiInsights = null;
    try {
      aiInsights = await aiClient.generateInsights({
        topic: quiz?.topic,
        successRate: stats.successRate,
        avgResponseTime: stats.avgResponseTime,
        engagement: stats.engagement,
        comprehensionScore: stats.comprehensionScore,
      });
    } catch {
      aiInsights = { recommendations: [], summary: 'AI service unavailable' };
    }

    const analytics = await Analytics.create({
      sessionId: session._id,
      quizId: session.quizId,
      type: 'live',
      metrics: { ...stats, engagement: stats.engagement },
      aiInsights,
    });

    res.json({ stats, aiInsights, analytics });
  } catch (err) {
    next(err);
  }
}

export async function getStudentAnalytics(req, res, next) {
  try {
    const userId = req.params.userId === 'me' ? req.user._id : req.params.userId;
    if (
      req.user.role === 'student' &&
      userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const responses = await Response.find({ userId });
    const total = responses.length;
    const correct = responses.filter((r) => r.isCorrect).length;

    res.json({
      userId: user._id,
      topicsProgress: user.topicsProgress,
      totalResponses: total,
      successRate: total > 0 ? Math.round((correct / total) * 1000) / 10 : 0,
    });
  } catch (err) {
    next(err);
  }
}

export async function getHeatmap(req, res, next) {
  try {
    const user = req.user;
    const heatmap =
      user.topicsProgress?.length > 0
        ? user.topicsProgress.map((t) => ({
            topic: t.topic,
            masteryPercent: t.masteryPercent,
          }))
        : [
            { topic: 'Probability', masteryPercent: 35 },
            { topic: 'Algebra', masteryPercent: 88 },
            { topic: 'Functions', masteryPercent: 61 },
          ];

    if (user.role === 'teacher') {
      const students = await User.find({ role: 'student' }).limit(50);
      const aggregate = {};
      students.forEach((s) => {
        s.topicsProgress?.forEach((t) => {
          if (!aggregate[t.topic]) aggregate[t.topic] = [];
          aggregate[t.topic].push(t.masteryPercent);
        });
      });
      const classHeatmap = Object.entries(aggregate).map(([topic, values]) => ({
        topic,
        masteryPercent: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      }));
      return res.json({ heatmap: classHeatmap.length ? classHeatmap : heatmap });
    }

    res.json({ heatmap });
  } catch (err) {
    next(err);
  }
}

export async function predictAnalytics(req, res, next) {
  try {
    const { sessionId, userId } = req.body;
    const responses = await Response.find(
      userId ? { userId, sessionId } : { sessionId }
    );

    const result = await aiClient.predict({
      sessionId,
      userId,
      responseCount: responses.length,
      successRate:
        responses.length > 0
          ? (responses.filter((r) => r.isCorrect).length / responses.length) * 100
          : 0,
      avgResponseTime:
        responses.length > 0
          ? responses.reduce((s, r) => s + r.responseTimeMs, 0) / responses.length
          : 0,
    });

    await Analytics.create({
      sessionId,
      userId,
      type: 'predictive',
      metrics: result,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}
