import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      default: "",
      trim: true,
    },

    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  { _id: true }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
    },

    questions: {
      type: [interviewQuestionSchema],
      default: [],
    },

    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    feedback: {
      type: mongoose.Schema.Types.Mixed,
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
    versionKey: false,
  }
);

export default mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);