import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.js';
import * as auth from '../controllers/authController.js';
import * as quiz from '../controllers/quizController.js';
import * as question from '../controllers/questionController.js';
import * as session from '../controllers/sessionController.js';
import * as response from '../controllers/responseController.js';
import * as analytics from '../controllers/analyticsController.js';
import * as report from '../controllers/reportController.js';
import * as ai from '../controllers/aiController.js';
import * as stats from '../controllers/statsController.js';

const router = Router();

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticate, auth.me);
router.patch('/auth/profile', authenticate, auth.updateProfile);
router.post('/auth/avatar', authenticate, auth.uploadAvatar);
router.delete('/auth/avatar', authenticate, auth.removeAvatar);
router.patch('/auth/password', authenticate, auth.changePassword);

// Stats
router.get('/stats/overview', authenticate, requireRole('teacher'), stats.getOverview);
router.get('/stats/me', authenticate, stats.getMyStats);
router.get('/users/students', authenticate, requireRole('teacher'), stats.listStudents);

// Quizzes (teacher)
router.get('/quizzes', authenticate, requireRole('teacher'), quiz.listQuizzes);
router.post('/quizzes', authenticate, requireRole('teacher'), quiz.createQuiz);
router.get('/quizzes/:id', authenticate, requireRole('teacher'), quiz.getQuiz);
router.patch('/quizzes/:id', authenticate, requireRole('teacher'), quiz.updateQuiz);
router.delete('/quizzes/:id', authenticate, requireRole('teacher'), quiz.deleteQuiz);

// Questions (teacher)
router.get('/quizzes/:quizId/questions', authenticate, requireRole('teacher'), question.listQuestions);
router.post('/quizzes/:quizId/questions', authenticate, requireRole('teacher'), question.createQuestion);
router.patch('/questions/:id', authenticate, requireRole('teacher'), question.updateQuestion);
router.delete('/questions/:id', authenticate, requireRole('teacher'), question.deleteQuestion);
router.post('/quizzes/:quizId/questions/reorder', authenticate, requireRole('teacher'), question.reorderQuestions);

// Sessions
router.get('/sessions', authenticate, requireRole('teacher'), session.listSessions);
router.post('/sessions', authenticate, requireRole('teacher'), session.createSession);
router.post('/sessions/:id/launch', authenticate, requireRole('teacher'), session.launchSession);
router.post('/sessions/:id/end', authenticate, requireRole('teacher'), session.endSession);
router.get('/sessions/:id', authenticate, session.getSession);
router.get('/sessions/code/:code', authenticate, session.getSessionByCode);
router.post('/sessions/join', authenticate, requireRole('student'), session.joinSession);
router.post('/sessions/:id/next-question', authenticate, requireRole('teacher'), session.nextQuestion);
router.get('/sessions/:id/participants', authenticate, requireRole('teacher'), session.getParticipants);
router.get('/sessions/:id/live-stats', authenticate, requireRole('teacher'), session.getLiveStats);

// Responses
router.post('/responses', authenticate, requireRole('student'), response.submitResponse);
router.get('/responses/session/:sessionId', authenticate, requireRole('teacher'), response.getSessionResponses);
router.get('/responses/me/progress', authenticate, requireRole('student'), response.getMyProgress);

// Analytics
router.get('/analytics/session/:sessionId', authenticate, requireRole('teacher'), analytics.getSessionAnalytics);
router.get('/analytics/student/:userId', authenticate, analytics.getStudentAnalytics);
router.get('/analytics/heatmap', authenticate, analytics.getHeatmap);
router.post('/analytics/predict', authenticate, requireRole('teacher'), analytics.predictAnalytics);

// Reports
router.post('/reports/session/:sessionId', authenticate, requireRole('teacher'), report.generateReport);
router.get('/reports', authenticate, requireRole('teacher'), report.listReports);
router.get('/reports/:id', authenticate, requireRole('teacher'), report.getReport);

// AI
router.post('/ai/generate-quiz', authenticate, requireRole('teacher'), ai.generateQuiz);
router.post('/ai/live-assistant', authenticate, requireRole('teacher'), ai.liveAssistant);
router.post('/ai/chat', authenticate, ai.chat);
router.post('/ai/revision-plan', authenticate, ai.revisionPlan);
router.post('/ai/explain-answer', authenticate, ai.explainAnswer);

export default router;
