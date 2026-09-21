import mongoose from "mongoose";

const learningRoadmapStepSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    technologies: {
      type: [String],
      default: [],
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    _id: true,
  }
);

const learningRoadmapSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    techStack: {
      type: [String],
      required: true,
      default: [],
    },

    steps: {
      type: [learningRoadmapStepSchema],
      required: true,
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

learningRoadmapSchema.index(
  { domain: 1, techStack: 1 },
  { unique: true }
);

const LearningRoadmap = mongoose.model(
  "LearningRoadmap",
  learningRoadmapSchema
);

export default LearningRoadmap;