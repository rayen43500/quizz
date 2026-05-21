import { Report } from '../models/Report.js';
import { Session } from '../models/Session.js';
import { Response } from '../models/Response.js';
import { Question } from '../models/Question.js';
import { Quiz } from '../models/Quiz.js';
import { computeSessionStatsForQuiz } from '../services/sessionStats.js';
import { aiClient } from '../services/aiClient.js';

export async function generateReport(req, res, next) {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      teacherId: req.user._id,
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const quiz = await Quiz.findById(session.quizId);
    const questions = await Question.find({ quizId: session.quizId });
    const responses = await Response.find({ sessionId: session._id });
    const stats = await computeSessionStatsForQuiz(session, session.quizId);

    let reportData;
    try {
      reportData = await aiClient.generateReport({
        sessionId: session._id.toString(),
        topic: quiz?.title,
        subject: quiz?.topic,
        stats,
        questionCount: questions.length,
        participantCount: session.participants.length,
        responses: responses.map((r) => ({
          isCorrect: r.isCorrect,
          responseTimeMs: r.responseTimeMs,
        })),
      });
    } catch {
      reportData = {
        summary: `Session "${quiz?.title}" — ${stats.successRate}% success rate.`,
        weakConcepts: stats.successRate < 60 ? [quiz?.topic || 'General'] : [],
        recommendations: [
          'Review incorrect answers with the class',
          'Provide additional practice exercises',
        ],
        heatmap: [{ topic: quiz?.topic || 'General', masteryPercent: stats.comprehensionScore }],
        revisionPlan: [
          { day: 1, title: 'Basics', activities: ['Review core concepts', 'Watch summary video'] },
          { day: 2, title: 'Exercises', activities: ['Practice problems', 'Group discussion'] },
          { day: 3, title: 'Advanced', activities: ['Challenge questions', 'Self-assessment quiz'] },
        ],
        engagementChart: [{ timestamp: new Date(), value: stats.comprehensionScore }],
      };
    }

    const report = await Report.create({
      sessionId: session._id,
      teacherId: req.user._id,
      title: `Report — ${quiz?.title || 'Session'}`,
      summary: reportData.summary,
      weakConcepts: reportData.weakConcepts || [],
      recommendations: reportData.recommendations || [],
      engagementChart: reportData.engagementChart || [],
      heatmap: reportData.heatmap || [],
      revisionPlan: reportData.revisionPlan || [],
    });

    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
}

export async function listReports(req, res, next) {
  try {
    const reports = await Report.find({ teacherId: req.user._id }).sort({ generatedAt: -1 });
    res.json({ reports });
  } catch (err) {
    next(err);
  }
}

export async function getReport(req, res, next) {
  try {
    const report = await Report.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  } catch (err) {
    next(err);
  }
}
