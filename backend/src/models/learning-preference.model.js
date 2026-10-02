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

    language: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      default: "English",
    },

    preferredSources: {
      type: [String],
      required: true,
      default: [],
      enum: [
        "government",
        "official_documentation",
        "courses",
      ],
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

const LearningPreference = mongoose.model(
  "LearningPreference",
  learningPreferenceSchema
);

export default LearningPreference;