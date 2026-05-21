import mongoose from 'mongoose';

const topicProgressSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  masteryPercent: { type: Number, default: 0, min: 0, max: 100 },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['teacher', 'student'], required: true },
    avatar: String,
    institution: String,
    topicsProgress: [topicProgressSchema],
  },
  { timestamps: true }
);

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    avatar: this.avatar,
    institution: this.institution,
    topicsProgress: this.topicsProgress,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model('User', userSchema);
