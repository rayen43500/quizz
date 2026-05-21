import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: String,
    topic: { type: String, required: true, trim: true },
    difficulty: { type: Number, default: 3, min: 1, max: 5 },
    defaultTimerSec: { type: Number, default: 30 },
    isPublished: { type: Boolean, default: false },
    questionCount: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

quizSchema.index({ teacherId: 1, createdAt: -1 });

export const Quiz = mongoose.model('Quiz', quizSchema);
