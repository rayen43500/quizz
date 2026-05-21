/**
 * Quisi — Seed complet
 * Génère : utilisateurs, quiz, questions, sessions, réponses, analytics, rapports
 *
 * Usage : npm run seed
 * Reset : npm run seed:reset (identique, vide puis remplit)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { Session } from '../models/Session.js';
import { Response } from '../models/Response.js';
import { Analytics } from '../models/Analytics.js';
import { Report } from '../models/Report.js';
import { generateSessionCode } from '../utils/generateCode.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config();

const PASSWORD_TEACHER = 'Teacher123!';
const PASSWORD_STUDENT = 'Student123!';

/** Avatar placeholder (DiceBear — léger, pas de base64) */
function avatarUrl(seed) {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0a0c10,1e2530`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

async function clearDatabase() {
  await Promise.all([
    User.deleteMany({}),
    Quiz.deleteMany({}),
    Question.deleteMany({}),
    Session.deleteMany({}),
    Response.deleteMany({}),
    Analytics.deleteMany({}),
    Report.deleteMany({}),
  ]);
  console.log('  ✓ Collections vidées');
}

async function seedUsers() {
  const teacherHash = await bcrypt.hash(PASSWORD_TEACHER, 12);
  const studentHash = await bcrypt.hash(PASSWORD_STUDENT, 12);

  const teachers = await User.insertMany([
    {
      email: 'teacher@quisi.edu',
      passwordHash: teacherHash,
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'teacher',
      institution: 'Lycée Quisi — Paris',
      avatar: avatarUrl('marie-dupont'),
    },
    {
      email: 'prof.martin@quisi.edu',
      passwordHash: teacherHash,
      firstName: 'Jean',
      lastName: 'Martin',
      role: 'teacher',
      institution: 'Université Quisi',
      avatar: avatarUrl('jean-martin'),
    },
  ]);

  const students = await User.insertMany([
    {
      email: 'student@quisi.edu',
      passwordHash: studentHash,
      firstName: 'Lucas',
      lastName: 'Bernard',
      role: 'student',
      institution: 'Lycée Quisi',
      avatar: avatarUrl('lucas-bernard'),
      topicsProgress: [
        { topic: 'Probability', masteryPercent: 35 },
        { topic: 'Algebra', masteryPercent: 88 },
        { topic: 'Functions', masteryPercent: 61 },
      ],
    },
    {
      email: 'emma.leroy@quisi.edu',
      passwordHash: studentHash,
      firstName: 'Emma',
      lastName: 'Leroy',
      role: 'student',
      institution: 'Lycée Quisi',
      avatar: avatarUrl('emma-leroy'),
      topicsProgress: [
        { topic: 'Probability', masteryPercent: 72 },
        { topic: 'Algebra', masteryPercent: 65 },
        { topic: 'Functions', masteryPercent: 54 },
      ],
    },
    {
      email: 'thomas.petit@quisi.edu',
      passwordHash: studentHash,
      firstName: 'Thomas',
      lastName: 'Petit',
      role: 'student',
      institution: 'Lycée Quisi',
      avatar: avatarUrl('thomas-petit'),
      topicsProgress: [
        { topic: 'Probability', masteryPercent: 48 },
        { topic: 'Algebra', masteryPercent: 91 },
        { topic: 'Functions', masteryPercent: 77 },
      ],
    },
    {
      email: 'sarah.dubois@quisi.edu',
      passwordHash: studentHash,
      firstName: 'Sarah',
      lastName: 'Dubois',
      role: 'student',
      institution: 'Lycée Quisi',
      avatar: avatarUrl('sarah-dubois'),
      topicsProgress: [
        { topic: 'Probability', masteryPercent: 58 },
        { topic: 'Algebra', masteryPercent: 42 },
        { topic: 'Functions', masteryPercent: 83 },
      ],
    },
    {
      email: 'alex.moreau@quisi.edu',
      passwordHash: studentHash,
      firstName: 'Alex',
      lastName: 'Moreau',
      role: 'student',
      institution: 'Lycée Quisi',
      avatar: avatarUrl('alex-moreau'),
      topicsProgress: [
        { topic: 'Probability', masteryPercent: 22 },
        { topic: 'Algebra', masteryPercent: 55 },
        { topic: 'Functions', masteryPercent: 40 },
      ],
    },
  ]);

  console.log(`  ✓ ${teachers.length} enseignants, ${students.length} étudiants`);
  return { teachers, students, mainTeacher: teachers[0] };
}

const QUIZ_TEMPLATES = [
  {
    title: 'Probabilités — Introduction',
    topic: 'Probability',
    difficulty: 3,
    questions: [
      {
        type: 'multiple_choice',
        text: 'P(A∩B) = P(A) × P(B) lorsque A et B sont :',
        options: [
          { id: 'a', label: 'Indépendants', isCorrect: true },
          { id: 'b', label: 'Mutuellement exclusifs', isCorrect: false },
          { id: 'c', label: 'Complémentaires', isCorrect: false },
        ],
        explanation: 'Pour des événements indépendants, P(A∩B) = P(A)×P(B).',
        timerSec: 30,
      },
      {
        type: 'true_false',
        text: 'La probabilité conditionnelle P(A|B) peut être supérieure à 1.',
        correctAnswer: 'false',
        explanation: 'Une probabilité est toujours comprise entre 0 et 1.',
        timerSec: 20,
      },
      {
        type: 'poll',
        text: 'Quel chapitre souhaitez-vous approfondir ?',
        options: [
          { id: 'a', label: 'Probabilité conditionnelle' },
          { id: 'b', label: 'Loi binomiale' },
          { id: 'c', label: 'Arbres de probabilité' },
        ],
        timerSec: 15,
        points: 0,
      },
      {
        type: 'short_answer',
        text: 'Donnez la formule de Bayes (symbole P suffit).',
        correctAnswer: 'P(A|B)=P(B|A)P(A)/P(B)',
        explanation: 'Formule des probabilités totales et de Bayes.',
        timerSec: 45,
      },
    ],
  },
  {
    title: 'Algèbre — Équations du second degré',
    topic: 'Algebra',
    difficulty: 4,
    questions: [
      {
        type: 'multiple_choice',
        text: 'Le discriminant Δ = b² - 4ac. Si Δ < 0, l\'équation admet :',
        options: [
          { id: 'a', label: 'Deux solutions réelles distinctes', isCorrect: false },
          { id: 'b', label: 'Aucune solution réelle', isCorrect: true },
          { id: 'c', label: 'Une solution double', isCorrect: false },
        ],
        explanation: 'Δ < 0 ⟹ pas de racines réelles.',
        timerSec: 25,
      },
      {
        type: 'multiple_choice',
        text: 'x² - 5x + 6 = 0. Les solutions sont :',
        options: [
          { id: 'a', label: 'x = 2 et x = 3', isCorrect: true },
          { id: 'b', label: 'x = 1 et x = 6', isCorrect: false },
          { id: 'c', label: 'x = -2 et x = -3', isCorrect: false },
        ],
        explanation: '(x-2)(x-3)=0.',
        timerSec: 30,
      },
      {
        type: 'true_false',
        text: 'Toute équation du second degré a exactement deux solutions complexes.',
        correctAnswer: 'true',
        explanation: 'Théorème fondamental de l\'algèbre.',
        timerSec: 20,
      },
    ],
  },
  {
    title: 'Fonctions — Limites et continuité',
    topic: 'Functions',
    difficulty: 3,
    questions: [
      {
        type: 'multiple_choice',
        text: 'f est continue en a si et seulement si :',
        options: [
          { id: 'a', label: 'lim f(x) = f(a) quand x→a', isCorrect: true },
          { id: 'b', label: 'f(a) = 0', isCorrect: false },
          { id: 'c', label: 'f est dérivable en a', isCorrect: false },
        ],
        explanation: 'Continuité = limite = valeur.',
        timerSec: 28,
      },
      {
        type: 'true_false',
        text: 'La fonction valeur absolue |x| est continue sur ℝ.',
        correctAnswer: 'true',
        explanation: 'Continue partout.',
        timerSec: 15,
      },
      {
        type: 'short_answer',
        text: 'lim (sin x)/x quand x→0 ?',
        correctAnswer: '1',
        explanation: 'Limite classique.',
        timerSec: 35,
      },
    ],
  },
];

async function seedQuizzes(teacherId) {
  const quizzes = [];
  const allQuestions = [];

  for (const template of QUIZ_TEMPLATES) {
    const quiz = await Quiz.create({
      teacherId,
      title: template.title,
      topic: template.topic,
      difficulty: template.difficulty,
      defaultTimerSec: 30,
      isPublished: true,
      questionCount: template.questions.length,
      description: `Quiz généré par seed — ${template.topic}`,
      tags: [template.topic, 'seed', 'demo'],
    });

    template.questions.forEach((q, order) => {
      allQuestions.push({
        quizId: quiz._id,
        order,
        type: q.type,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: template.difficulty,
        timerSec: q.timerSec ?? 30,
        points: q.points ?? 10,
      });
    });

    quizzes.push(quiz);
  }

  const questions = await Question.insertMany(allQuestions);
  console.log(`  ✓ ${quizzes.length} quiz, ${questions.length} questions`);
  return { quizzes, questions };
}

function buildParticipants(students) {
  return students.map((s) => ({
    userId: s._id,
    displayName: `${s.firstName} ${s.lastName}`,
    joinedAt: hoursAgo(2),
    isActive: true,
    individualDifficulty: 3,
    suspicionScore: s.firstName === 'Alex' ? 45 : 5,
    stats: { correct: 0, total: 0, avgResponseTimeMs: 0 },
  }));
}

async function seedSessions(teacher, quizzes, students) {
  const sessions = [];
  const usedCodes = new Set();

  const makeCode = () => {
    let code;
    do {
      code = generateSessionCode();
    } while (usedCodes.has(code));
    usedCodes.add(code);
    return code;
  };

  // Session ACTIVE (démo live)
  const activeQuiz = quizzes[0];
  const activeSession = await Session.create({
    quizId: activeQuiz._id,
    teacherId: teacher._id,
    code: makeCode(),
    status: 'active',
    currentQuestionIndex: 1,
    difficultyLevel: 3,
    participants: buildParticipants(students),
    settings: { adaptiveEnabled: true, showLeaderboard: true },
    liveMetrics: {
      responseRate: 68,
      successRate: 52,
      activeCount: students.length,
      comprehensionScore: 58,
    },
    startedAt: hoursAgo(1),
    createdAt: hoursAgo(2),
  });
  sessions.push({ session: activeSession, quiz: activeQuiz, status: 'active' });

  // Sessions TERMINÉES (historique + rapports)
  for (let i = 1; i < quizzes.length; i++) {
    const quiz = quizzes[i];
    const endedSession = await Session.create({
      quizId: quiz._id,
      teacherId: teacher._id,
      code: makeCode(),
      status: 'ended',
      currentQuestionIndex: 2,
      difficultyLevel: quiz.difficulty,
      participants: buildParticipants(students).map((p) => ({
        ...p,
        stats: {
          correct: Math.floor(Math.random() * 3) + 1,
          total: 3,
          avgResponseTimeMs: 3000 + Math.floor(Math.random() * 8000),
        },
      })),
      liveMetrics: {
        responseRate: 75 + i * 5,
        successRate: 45 + i * 12,
        activeCount: students.length,
        comprehensionScore: 50 + i * 10,
      },
      startedAt: daysAgo(3 + i),
      endedAt: daysAgo(3 + i - 1),
      createdAt: daysAgo(4 + i),
    });
    sessions.push({ session: endedSession, quiz, status: 'ended' });
  }

  // Session en attente
  const waitingSession = await Session.create({
    quizId: quizzes[0]._id,
    teacherId: teacher._id,
    code: makeCode(),
    status: 'waiting',
    participants: [],
    createdAt: new Date(),
  });
  sessions.push({ session: waitingSession, quiz: quizzes[0], status: 'waiting' });

  console.log(`  ✓ ${sessions.length} sessions (1 active, ${quizzes.length - 1} ended, 1 waiting)`);
  return sessions;
}

function getCorrectAnswer(question, answerId) {
  if (question.type === 'multiple_choice') {
    const opt = question.options?.find((o) => o.id === answerId);
    return opt?.isCorrect ?? false;
  }
  if (question.type === 'true_false' || question.type === 'short_answer') {
    return String(answerId).toLowerCase() === String(question.correctAnswer).toLowerCase();
  }
  return null;
}

function pickAnswer(question, shouldBeCorrect) {
  if (question.type === 'multiple_choice') {
    const correct = question.options?.find((o) => o.isCorrect);
    const wrong = question.options?.find((o) => !o.isCorrect);
    const chosen = shouldBeCorrect ? correct : wrong || question.options[0];
    return chosen?.id || 'a';
  }
  if (question.type === 'true_false') {
    return shouldBeCorrect ? question.correctAnswer : question.correctAnswer === 'true' ? 'false' : 'true';
  }
  if (question.type === 'poll') {
    return question.options?.[0]?.id || 'a';
  }
  if (question.type === 'short_answer') {
    return shouldBeCorrect ? question.correctAnswer : 'wrong';
  }
  return 'a';
}

async function seedResponses(sessionRecords, students) {
  const responseDocs = [];
  let count = 0;

  for (const { session, quiz, status } of sessionRecords) {
    if (status !== 'ended' && status !== 'active') continue;

    const questions = await Question.find({ quizId: quiz._id }).sort({ order: 1 });
    const gradableQuestions = questions.filter((q) => q.type !== 'poll');

    for (const student of students) {
      const profile = {
        lucas: [false, false, true, false],
        emma: [true, true, false, true],
        thomas: [true, false, true, false],
        sarah: [true, true, true, false],
        alex: [false, false, false, false],
      };
      const key = student.firstName.toLowerCase();
      const pattern = profile[key] || [true, false, true];

      gradableQuestions.forEach((question, qi) => {
        const shouldBeCorrect = pattern[qi % pattern.length] ?? Math.random() > 0.4;
        const answer = pickAnswer(question, shouldBeCorrect);
        const isCorrect = getCorrectAnswer(question, answer);
        const responseTimeMs = 1500 + Math.floor(Math.random() * 12000);

        responseDocs.push({
          sessionId: session._id,
          questionId: question._id,
          userId: student._id,
          answer,
          isCorrect,
          responseTimeMs,
          suspicionFlags: responseTimeMs < 600 ? ['fast_response'] : [],
          submittedAt: daysAgo(status === 'ended' ? 2 : 0),
        });
        count++;
      });

      // Poll pour session ended
      const pollQ = questions.find((q) => q.type === 'poll');
      if (pollQ && status === 'ended') {
        responseDocs.push({
          sessionId: session._id,
          questionId: pollQ._id,
          userId: student._id,
          answer: pollQ.options[Math.floor(Math.random() * pollQ.options.length)].id,
          isCorrect: null,
          responseTimeMs: 2000 + Math.floor(Math.random() * 3000),
          submittedAt: daysAgo(2),
        });
        count++;
      }
    }
  }

  // Dédupliquer par index unique (session, question, user) — garder dernier
  const seen = new Map();
  for (const r of responseDocs) {
    const key = `${r.sessionId}-${r.questionId}-${r.userId}`;
    seen.set(key, r);
  }
  const unique = [...seen.values()];

  await Response.insertMany(unique);
  console.log(`  ✓ ${unique.length} réponses`);
  return unique;
}

async function seedAnalyticsAndReports(teacher, sessionRecords, students) {
  const analyticsDocs = [];
  const reportDocs = [];

  for (const { session, quiz, status } of sessionRecords) {
    if (status !== 'ended') continue;

    const responses = await Response.find({ sessionId: session._id });
    const gradable = responses.filter((r) => r.isCorrect !== null && r.isCorrect !== undefined);
    const correct = gradable.filter((r) => r.isCorrect).length;
    const successRate = gradable.length ? Math.round((correct / gradable.length) * 100) : 0;
    const avgTime =
      responses.length > 0
        ? Math.round(responses.reduce((s, r) => s + r.responseTimeMs, 0) / responses.length / 1000)
        : 0;

    analyticsDocs.push({
      sessionId: session._id,
      quizId: quiz._id,
      type: 'session_end',
      metrics: {
        comprehensionScore: Math.round(successRate * 0.5 + 25),
        successRate,
        avgResponseTime: avgTime,
        participationRate: Math.round((students.length / Math.max(students.length, 1)) * 100),
        engagement: successRate > 70 ? 'high' : successRate > 45 ? 'medium' : 'low',
        dropRate: 5,
        performanceTrend: 'stable',
        topicMastery: [{ topic: quiz.topic, percent: successRate }],
      },
      aiInsights: {
        summary: `Session "${quiz.title}" : ${successRate}% de réussite. ${successRate < 50 ? 'Renforcer les exemples concrets.' : 'Bon niveau global.'}`,
        recommendations: [
          'Revoir les questions les plus échouées en classe',
          'Proposer un quiz de révision ciblé',
          'Utiliser le plan de révision IA pour les élèves en difficulté',
        ],
        misunderstoodConcepts: successRate < 60 ? [quiz.topic, 'Concepts fondamentaux'] : [],
        difficultySuggestion: successRate > 80 ? 'increase' : successRate < 50 ? 'decrease' : 'maintain',
      },
      calculatedAt: daysAgo(1),
    });

    reportDocs.push({
      sessionId: session._id,
      teacherId: teacher._id,
      title: `Rapport — ${quiz.title}`,
      summary: `Analyse de la session du ${session.endedAt?.toLocaleDateString('fr-FR') || 'N/A'}. Taux de succès : ${successRate}%. ${students.length} participants.`,
      weakConcepts: successRate < 55 ? [quiz.topic] : [],
      recommendations: [
        'Session de rattrapage recommandée pour les élèves < 50%',
        'Distribuer le plan de révision personnalisé',
        'Réutiliser les questions à faible taux de réussite',
      ],
      engagementChart: [
        { timestamp: session.startedAt || daysAgo(3), value: 40 },
        { timestamp: hoursAgo(5), value: 55 },
        { timestamp: session.endedAt || daysAgo(2), value: successRate },
      ],
      heatmap: [
        { topic: quiz.topic, masteryPercent: successRate },
        { topic: 'Algebra', masteryPercent: 72 },
        { topic: 'Functions', masteryPercent: 61 },
        { topic: 'Probability', masteryPercent: 48 },
      ],
      revisionPlan: [
        { day: 1, title: 'Bases', activities: ['Revoir le cours', 'Fiches synthèse', 'Vidéo explicative'] },
        { day: 2, title: 'Exercices', activities: ['QCM d\'entraînement', 'Travail en binôme', 'Correction collective'] },
        { day: 3, title: 'Évaluation', activities: ['Mini-quiz formatif', 'Auto-évaluation', 'Bilan oral'] },
      ],
      generatedAt: daysAgo(1),
    });
  }

  // Analytics live pour session active
  const active = sessionRecords.find((s) => s.status === 'active');
  if (active) {
    analyticsDocs.push({
      sessionId: active.session._id,
      quizId: active.quiz._id,
      type: 'live',
      metrics: {
        comprehensionScore: 58,
        successRate: 52,
        avgResponseTime: 4.2,
        participationRate: 85,
        engagement: 'medium',
      },
      calculatedAt: new Date(),
    });
  }

  // Predictive par étudiant faible
  const weakStudent = students.find((s) => s.firstName === 'Alex');
  if (weakStudent) {
    analyticsDocs.push({
      userId: weakStudent._id,
      type: 'predictive',
      metrics: {
        dropoutRisk: 68,
        suspicionScore: 45,
        performanceTrend: 'declining',
      },
      calculatedAt: new Date(),
    });
  }

  await Analytics.insertMany(analyticsDocs);
  await Report.insertMany(reportDocs);
  console.log(`  ✓ ${analyticsDocs.length} analytics, ${reportDocs.length} rapports`);
}

async function printSummary(sessionRecords) {
  const active = sessionRecords.find((s) => s.status === 'active');
  console.log('\n══════════════════════════════════════════════════');
  console.log('  QUISI — Seed terminé avec succès');
  console.log('══════════════════════════════════════════════════\n');
  console.log('  COMPTES (mot de passe identique pour chaque rôle)\n');
  console.log('  Enseignants (Teacher123!) :');
  console.log('    • teacher@quisi.edu      — Marie Dupont');
  console.log('    • prof.martin@quisi.edu  — Jean Martin\n');
  console.log('  Étudiants (Student123!) :');
  console.log('    • student@quisi.edu      — Lucas Bernard');
  console.log('    • emma.leroy@quisi.edu     — Emma Leroy');
  console.log('    • thomas.petit@quisi.edu   — Thomas Petit');
  console.log('    • sarah.dubois@quisi.edu   — Sarah Dubois');
  console.log('    • alex.moreau@quisi.edu    — Alex Moreau\n');
  if (active) {
    console.log('  SESSION LIVE (dashboard → Sessions → Ouvrir live)');
    console.log(`    Code : ${active.session.code}`);
    console.log(`    Quiz : ${active.quiz.title}\n`);
  }
  console.log('  Relancer : npm run seed');
  console.log('══════════════════════════════════════════════════\n');
}

async function seed() {
  console.log('\n🌱 Quisi — Génération des données de démonstration\n');
  console.log(`   MongoDB : ${config.mongodbUri}\n`);

  await mongoose.connect(config.mongodbUri);
  await clearDatabase();

  const { mainTeacher, students } = await seedUsers();
  const { quizzes } = await seedQuizzes(mainTeacher._id);
  const sessionRecords = await seedSessions(mainTeacher, quizzes, students);
  await seedResponses(sessionRecords, students);
  await seedAnalyticsAndReports(mainTeacher, sessionRecords, students);

  await printSummary(sessionRecords);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err);
  process.exit(1);
});
