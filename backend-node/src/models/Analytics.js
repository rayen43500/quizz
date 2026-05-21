import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    type: {
      type: String,
      enum: ['live', 'session_end', 'predictive', 'heatmap'],
      required: true,
    },
    metrics: {
      comprehensionScore: Number,
      successRate: Number,
      avgResponseTime: Number,
      participationRate: Number,
      engagement: { type: String, enum: ['low', 'medium', 'high'] },
      dropRate: Number,
      performanceTrend: { type: String, enum: ['improving', 'stable', 'declining'] },
      suspicionScore: Number,
      dropoutRisk: Number,
      topicMastery: [{ topic: String, percent: Number }],
    },
    aiInsights: {
      summary: String,
      recommendations: [String],
      misunderstoodConcepts: [String],
      difficultySuggestion: String,
    },
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

analyticsSchema.index({ sessionId: 1, type: 1, calculatedAt: -1 });

export const Analytics = mongoose.model('Analytics', analyticsSchema);
