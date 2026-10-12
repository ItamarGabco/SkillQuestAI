import mongoose from "mongoose";

const objectiveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100,
  },

  description: {
    type: String,
    trim: true,
    maxLength: 250,
    default: "",
  },

  status: {
    type: String,
    enum: ["not_started", "in_progress", "mastered"],
    default: "not_started",
  },

  masteryScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },

  bestScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },

  attempts: {
    type: Number,
    default: 0,
    min: 0,
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

  lastPracticedAt: {
    type: Date,
    default: null,
  },

  masteredAt: {
    type: Date,
    default: null,
  },
});

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 80,
    },

    category: {
      type: String,
      trim: true,
      maxLength: 50,
      default: "כללי",
    },

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    masteryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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

    totalQuests: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedQuests: {
      type: Number,
      default: 0,
      min: 0,
    },

    objectives: {
      type: [objectiveSchema],
      default: [],
    },

    firstPracticedAt: {
      type: Date,
      default: null,
    },

    lastPracticedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

skillSchema.index(
  {
    userId: 1,
    name: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.models.Skill || mongoose.model("Skill", skillSchema);
