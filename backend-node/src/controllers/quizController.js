import { z } from 'zod';
import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';

const quizSchema = z.object({
  title: z.string().min(1),
  topic: z.string().min(1),
  difficulty: z.number().min(1).max(5).optional(),
  defaultTimerSec: z.number().positive().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export async function listQuizzes(req, res, next) {
  try {
    const quizzes = await Quiz.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    next(err);
  }
}

export async function createQuiz(req, res, next) {
  try {
    const data = quizSchema.parse(req.body);
    const quiz = await Quiz.create({ ...data, teacherId: req.user._id });
    res.status(201).json({ quiz });
  } catch (err) {
    next(err);
  }
}

export async function getQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, teacherId: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const questions = await Question.find({ quizId: quiz._id }).sort({ order: 1 });
    res.json({ quiz, questions });
  } catch (err) {
    next(err);
  }
}

export async function updateQuiz(req, res, next) {
  try {
    const data = quizSchema.partial().parse(req.body);
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user._id },
      data,
      { new: true }
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ quiz });
  } catch (err) {
    next(err);
  }
}

export async function deleteQuiz(req, res, next) {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, teacherId: req.user._id });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    await Question.deleteMany({ quizId: quiz._id });
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    next(err);
  }
}
