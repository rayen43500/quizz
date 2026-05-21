import { Response } from '../models/Response.js';
import { Question } from '../models/Question.js';

export async function computeSessionStats(sessionId, participantCount) {
  const responses = await Response.find({ sessionId });
  const questions = await Question.find({
    quizId: (await import('../models/Session.js')).Session.findById(sessionId).then((s) => s?.quizId),
  });

  const totalPossible = participantCount * Math.max(questions.length, 1);
  const responseRate = totalPossible > 0 ? (responses.length / totalPossible) * 100 : 0;

  const gradable = responses.filter((r) => r.isCorrect !== null && r.isCorrect !== undefined);
  const correct = gradable.filter((r) => r.isCorrect).length;
  const successRate = gradable.length > 0 ? (correct / gradable.length) * 100 : 0;

  const avgResponseTime =
    responses.length > 0
      ? responses.reduce((s, r) => s + r.responseTimeMs, 0) / responses.length / 1000
      : 0;

  const participationRate =
    participantCount > 0 ? (new Set(responses.map((r) => r.userId.toString())).size / participantCount) * 100 : 0;

  const correctness = successRate / 100;
  const participation = participationRate / 100;
  const speedScore = avgResponseTime > 0 ? Math.max(0, 1 - avgResponseTime / 30) : 0.5;
  const comprehensionScore = Math.round(
    (0.5 * correctness + 0.3 * participation + 0.2 * speedScore) * 100
  );

  let engagement = 'medium';
  if (comprehensionScore < 40 || participationRate < 50) engagement = 'low';
  else if (comprehensionScore > 70 && participationRate > 75) engagement = 'high';

  return {
    responseRate: Math.round(responseRate * 10) / 10,
    successRate: Math.round(successRate * 10) / 10,
    avgResponseTime: Math.round(avgResponseTime * 10) / 10,
    participationRate: Math.round(participationRate * 10) / 10,
    comprehensionScore,
    engagement,
    totalResponses: responses.length,
    correctCount: correct,
  };
}

export async function computeSessionStatsForQuiz(session, quizId) {
  const responses = await Response.find({ sessionId: session._id });
  const questions = await Question.find({ quizId });
  const participantCount = session.participants.filter((p) => p.isActive).length || 1;
  const totalPossible = participantCount * Math.max(questions.length, 1);
  const responseRate = totalPossible > 0 ? (responses.length / totalPossible) * 100 : 0;
  const gradable = responses.filter((r) => r.isCorrect !== null && r.isCorrect !== undefined);
  const correct = gradable.filter((r) => r.isCorrect).length;
  const successRate = gradable.length > 0 ? (correct / gradable.length) * 100 : 0;
  const avgResponseTime =
    responses.length > 0
      ? responses.reduce((s, r) => s + r.responseTimeMs, 0) / responses.length / 1000
      : 0;
  const participationRate =
    participantCount > 0
      ? (new Set(responses.map((r) => r.userId.toString())).size / participantCount) * 100
      : 0;
  const correctness = successRate / 100;
  const participation = participationRate / 100;
  const speedScore = avgResponseTime > 0 ? Math.max(0, 1 - avgResponseTime / 30) : 0.5;
  const comprehensionScore = Math.round(
    (0.5 * correctness + 0.3 * participation + 0.2 * speedScore) * 100
  );
  let engagement = 'medium';
  if (comprehensionScore < 40 || participationRate < 50) engagement = 'low';
  else if (comprehensionScore > 70 && participationRate > 75) engagement = 'high';

  return {
    responseRate: Math.round(responseRate * 10) / 10,
    successRate: Math.round(successRate * 10) / 10,
    avgResponseTime: Math.round(avgResponseTime * 10) / 10,
    participationRate: Math.round(participationRate * 10) / 10,
    comprehensionScore,
    engagement,
    activeCount: participantCount,
  };
}
