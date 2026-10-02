import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import validate from "../middleware/validation.middleware.js";

import {
  createLearningGoalSchema,
} from "../validators/learning-goal.validator.js";

import {
  createLearningGoal,
  getLearningGoal,
} from "../controllers/learning-goal.controller.js";

const router =
  express.Router();

router.get(
  "/me",
  authMiddleware,
  getLearningGoal
);

router.post(
  "/",
  authMiddleware,
  validate(
    createLearningGoalSchema
  ),
  createLearningGoal
);

export default router;