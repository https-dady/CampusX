import mongoose from "mongoose";

const learningGoalSchema =
  new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
      },

      domain: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      targetSkills: {
        type: [String],
        required: true,
        default: [],
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
  "LearningGoal",
  learningGoalSchema
);