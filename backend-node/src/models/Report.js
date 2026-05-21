import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    summary: String,
    weakConcepts: [String],
    recommendations: [String],
    engagementChart: [{ timestamp: Date, value: Number }],
    heatmap: [{ topic: String, masteryPercent: Number }],
    revisionPlan: [{
      day: Number,
      title: String,
      activities: [String],
    }],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
