import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    concept: {
      type: String,
      required: true,
      trim: true,
    },

    correct: {
      type: Boolean,
      required: true,
    },

    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  },
);

const questAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    skillName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 80,
    },

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },

    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },

    scorePercent: {
      type: Number,
      default: null,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.QuestAttempt ||
  mongoose.model("QuestAttempt", questAttemptSchema);
