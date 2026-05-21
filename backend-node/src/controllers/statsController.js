import { Quiz } from '../models/Quiz.js';
import { Session } from '../models/Session.js';
import { Response } from '../models/Response.js';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { Question } from '../models/Question.js';

export async function getOverview(req, res, next) {
  try {
    const teacherId = req.user._id;
    const [quizzes, sessions, reports, students] = await Promise.all([
      Quiz.countDocuments({ teacherId }),
      Session.countDocuments({ teacherId }),
      Report.countDocuments({ teacherId }),
      User.countDocuments({ role: 'student' }),
    ]);

    const activeSessions = await Session.countDocuments({ teacherId, status: 'active' });
    const sessionIds = await Session.find({ teacherId }).distinct('_id');
    const responses = await Response.find({ sessionId: { $in: sessionIds } });
    const gradable = responses.filter((r) => r.isCorrect !== null && r.isCorrect !== undefined);
    const successRate =
      gradable.length > 0 ? Math.round((gradable.filter((r) => r.isCorrect).length / gradable.length) * 1000) / 10 : 0;

    const recentSessions = await Session.find({ teacherId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('quizId', 'title topic');

    res.json({
      quizzes,
      sessions,
      activeSessions,
      reports,
      students,
      totalResponses: responses.length,
      successRate,
      recentSessions,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMyStats(req, res, next) {
  try {
    const userId = req.user._id;
    const responses = await Response.find({ userId })
      .populate('questionId', 'text type')
      .sort({ submittedAt: -1 })
      .limit(200);

    const total = responses.length;
    const correct = responses.filter((r) => r.isCorrect).length;
    const successRate = total > 0 ? Math.round((correct / total) * 1000) / 10 : 0;
    const avgTime =
      total > 0 ? Math.round(responses.reduce((s, r) => s + r.responseTimeMs, 0) / total) : 0;

    const byTopic = {};
    for (const r of responses) {
      const session = await Session.findById(r.sessionId).populate('quizId', 'topic');
      const topic = session?.quizId?.topic || 'General';
      if (!byTopic[topic]) byTopic[topic] = { total: 0, correct: 0 };
      byTopic[topic].total += 1;
      if (r.isCorrect) byTopic[topic].correct += 1;
    }

    const topicStats = Object.entries(byTopic).map(([topic, v]) => ({
      topic,
      total: v.total,
      successRate: Math.round((v.correct / v.total) * 100),
      masteryPercent: Math.round((v.correct / v.total) * 100),
    }));

    if (topicStats.length && req.user.role === 'student') {
      req.user.topicsProgress = topicStats.map((t) => ({
        topic: t.topic,
        masteryPercent: t.masteryPercent,
      }));
      await req.user.save();
    }

    res.json({
      totalResponses: total,
      correctCount: correct,
      successRate,
      avgResponseTimeMs: avgTime,
      topicsProgress: req.user.topicsProgress,
      topicStats,
      recentActivity: responses.slice(0, 10).map((r) => ({
        questionText: r.questionId?.text,
        isCorrect: r.isCorrect,
        submittedAt: r.submittedAt,
        responseTimeMs: r.responseTimeMs,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function listStudents(req, res, next) {
  try {
    const students = await User.find({ role: 'student' })
      .select('firstName lastName email avatar institution topicsProgress createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    const enriched = await Promise.all(
      students.map(async (s) => {
        const responses = await Response.find({ userId: s._id });
        const correct = responses.filter((r) => r.isCorrect).length;
        return {
          ...s.toPublicJSON(),
          totalResponses: responses.length,
          successRate: responses.length ? Math.round((correct / responses.length) * 100) : 0,
        };
      })
    );

    res.json({ students: enriched });
  } catch (err) {
    next(err);
  }
}
