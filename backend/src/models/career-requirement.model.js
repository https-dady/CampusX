import mongoose from "mongoose";

const careerRequirementSchema = new mongoose.Schema(
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

    requiredSkills: {
      type: [String],
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

careerRequirementSchema.index(
  { career: 1, domain: 1 },
  { unique: true }
);

const CareerRequirement =
  mongoose.model(
    "CareerRequirement",
    careerRequirementSchema
  );

export default CareerRequirement;