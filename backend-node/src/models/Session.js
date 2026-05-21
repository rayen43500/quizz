import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  displayName: String,
  joinedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  individualDifficulty: { type: Number, default: 3, min: 1, max: 5 },
  suspicionScore: { type: Number, default: 0 },
  stats: {
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    avgResponseTimeMs: { type: Number, default: 0 },
  },
}, { _id: false });

const sessionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    status: {
      type: String,
      enum: ['waiting', 'active', 'paused', 'ended'],
      default: 'waiting',
    },
    currentQuestionIndex: { type: Number, default: -1 },
    currentQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    difficultyLevel: { type: Number, default: 3, min: 1, max: 5 },
    participants: [participantSchema],
    settings: {
      adaptiveEnabled: { type: Boolean, default: true },
      showLeaderboard: { type: Boolean, default: true },
      anonymousMode: { type: Boolean, default: false },
    },
    liveMetrics: {
      responseRate: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      activeCount: { type: Number, default: 0 },
      comprehensionScore: { type: Number, default: 0 },
    },
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

sessionSchema.index({ code: 1 }, { unique: true });

export const Session = mongoose.model('Session', sessionSchema);
