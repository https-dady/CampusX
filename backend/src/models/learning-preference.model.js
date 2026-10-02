import mongoose from "mongoose";

const learningPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    preferredLanguage: {
      type: String,
      enum: ["english", "hindi"],
      required: true,
      default: "english",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model(
  "LearningPreference",
  learningPreferenceSchema
);