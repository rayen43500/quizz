import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answer: { type: String, required: true },
    isCorrect: Boolean,
    responseTimeMs: { type: Number, required: true },
    suspicionFlags: [String],
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

responseSchema.index({ sessionId: 1, questionId: 1, userId: 1 }, { unique: true });

export const Response = mongoose.model('Response', responseSchema);
