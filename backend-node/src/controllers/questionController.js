import { z } from 'zod';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';

const questionSchema = z.object({
  type: z.enum(['multiple_choice', 'true_false', 'poll', 'short_answer']),
  text: z.string().min(1),
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        isCorrect: z.boolean().optional(),
      })
    )
    .optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  image: z.string().optional(),
  video: z.string().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  timerSec: z.number().positive().optional(),
  points: z.number().positive().optional(),
  order: z.number().optional(),
}).superRefine((val, ctx) => {
  const maxImageBytes = 3 * 1024 * 1024;
  const maxVideoBytes = 15 * 1024 * 1024;
  if (val.image) {
    if (!val.image.startsWith('data:image/')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'image must be data:image/* base64' });
    } else if (Buffer.byteLength(val.image, 'utf8') > maxImageBytes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'image too large (max 3MB)' });
    }
  }
  if (val.video) {
    if (!val.video.startsWith('data:video/')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'video must be data:video/* base64' });
    } else if (Buffer.byteLength(val.video, 'utf8') > maxVideoBytes) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'video too large (max 15MB)' });
    }
  }

  if (val.type === 'multiple_choice') {
    if (!val.options || val.options.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'options required for multiple_choice' });
    } else {
      const hasCorrect = val.options.some((o) => o.isCorrect);
      if (!hasCorrect && val.correctAnswer) {
        const matches = val.options.some((o) => o.id === val.correctAnswer);
        if (!matches) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'correctAnswer must match an option id' });
        }
      } else if (!hasCorrect) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'multiple_choice requires a correct option' });
      }
    }
  }

  if (val.type === 'poll') {
    if (!val.options || val.options.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'options required for poll' });
    }
  }

  if (val.type === 'true_false') {
    const normalized = String(val.correctAnswer ?? '').toLowerCase();
    if (!['true', 'false'].includes(normalized)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'correctAnswer must be true or false' });
    }
  }

  if (val.type === 'short_answer') {
    const normalized = String(val.correctAnswer ?? '').trim();
    if (!normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'correctAnswer required for short_answer' });
    }
  }
});

function normalizeQuestionInput(data) {
  if (data.type !== 'multiple_choice' || !Array.isArray(data.options)) return data;
  const hasCorrect = data.options.some((o) => o.isCorrect);
  if (!hasCorrect && data.correctAnswer) {
    return {
      ...data,
      options: data.options.map((o) => ({ ...o, isCorrect: o.id === data.correctAnswer })),
    };
  }
  return data;
}

async function verifyQuizOwnership(quizId, teacherId) {
  return Quiz.findOne({ _id: quizId, teacherId });
}

export async function listQuestions(req, res, next) {
  try {
    const quiz = await verifyQuizOwnership(req.params.quizId, req.user._id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const questions = await Question.find({ quizId: quiz._id }).sort({ order: 1 });
    res.json({ questions });
  } catch (err) {
    next(err);
  }
}

export async function createQuestion(req, res, next) {
  try {
    const quiz = await verifyQuizOwnership(req.params.quizId, req.user._id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const data = normalizeQuestionInput(questionSchema.parse(req.body));
    const count = await Question.countDocuments({ quizId: quiz._id });
    const question = await Question.create({
      ...data,
      quizId: quiz._id,
      order: data.order ?? count,
    });
    await Quiz.findByIdAndUpdate(quiz._id, { questionCount: count + 1 });
    res.status(201).json({ question });
  } catch (err) {
    next(err);
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    const quiz = await verifyQuizOwnership(question.quizId, req.user._id);
    if (!quiz) return res.status(403).json({ error: 'Access denied' });
    const data = questionSchema.partial().parse(req.body);
    const merged = normalizeQuestionInput({
      type: data.type ?? question.type,
      text: data.text ?? question.text,
      options: data.options ?? question.options,
      correctAnswer: data.correctAnswer ?? question.correctAnswer,
      explanation: data.explanation ?? question.explanation,
      image: data.image ?? question.image,
      video: data.video ?? question.video,
      difficulty: data.difficulty ?? question.difficulty,
      timerSec: data.timerSec ?? question.timerSec,
      points: data.points ?? question.points,
      order: data.order ?? question.order,
    });
    questionSchema.parse(merged);
    Object.assign(question, data, {
      options: merged.options,
      correctAnswer: merged.correctAnswer,
    });
    await question.save();
    res.json({ question });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuestion(req, res, next) {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    const quiz = await verifyQuizOwnership(question.quizId, req.user._id);
    if (!quiz) return res.status(403).json({ error: 'Access denied' });
    await question.deleteOne();
    const count = await Question.countDocuments({ quizId: quiz._id });
    await Quiz.findByIdAndUpdate(quiz._id, { questionCount: count });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    next(err);
  }
}

export async function reorderQuestions(req, res, next) {
  try {
    const quiz = await verifyQuizOwnership(req.params.quizId, req.user._id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order array required' });
    await Promise.all(
      order.map((questionId, index) =>
        Question.findByIdAndUpdate(questionId, { order: index })
      )
    );
    const questions = await Question.find({ quizId: quiz._id }).sort({ order: 1 });
    res.json({ questions });
  } catch (err) {
    next(err);
  }
}
