import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  isCorrect: Boolean,
}, { _id: false });

const questionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    order: { type: Number, required: true },
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'poll', 'short_answer'],
      required: true,
    },
    text: { type: String, required: true },
    options: [optionSchema],
    correctAnswer: String,
    explanation: String,
    image: String,
    video: String,
    difficulty: { type: Number, default: 3, min: 1, max: 5 },
    timerSec: Number,
    points: { type: Number, default: 10 },
  },
  { timestamps: true }
);

questionSchema.index({ quizId: 1, order: 1 });

export const Question = mongoose.model('Question', questionSchema);
