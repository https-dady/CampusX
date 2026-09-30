import mongoose from "mongoose";

export const createInterviewSchema = {
  body: {
    targetRole: {
      required: true,
      type: "string",
      minLength: 2,
      maxLength: 100,
    },

    difficulty: {
      required: false,
      type: "string",
      enum: ["easy", "medium", "hard"],
    },
  },
};

export const validateInterviewId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid interview session ID.",
    });
  }

  next();
};