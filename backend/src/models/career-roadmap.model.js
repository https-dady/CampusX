import mongoose from "mongoose";

const roadmapStepSchema = new mongoose.Schema(
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

    skills: {
      type: [String],
      default: [],
    },

    resources: {
      type: [
        {
          title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
          },

          url: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500,
          },

          type: {
            type: String,
            trim: true,
            maxlength: 50,
          },
        },
      ],
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

const careerRoadmapSchema = new mongoose.Schema(
  {
    career: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    domain: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    steps: {
      type: [roadmapStepSchema],
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

careerRoadmapSchema.index(
  { career: 1, domain: 1 },
  { unique: true }
);

const CareerRoadmap = mongoose.model(
  "CareerRoadmap",
  careerRoadmapSchema
);

export default CareerRoadmap;