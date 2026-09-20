import mongoose from "mongoose";

const careerGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    targetCareer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    targetDomain: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    targetLevel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    targetTimeline: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    additionalGoals: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const CareerGoal = mongoose.model(
  "CareerGoal",
  careerGoalSchema
);

export default CareerGoal;