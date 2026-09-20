import express from "express";

import {
  getCareerGoal,
  createCareerGoalController,
  updateCareerGoalController,
} from "../controllers/career-goal.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  careerGoalSchema,
  updateCareerGoalSchema,
} from "../validators/career-goal.validator.js";

import  validate  from "../middleware/validation.middleware.js";

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  getCareerGoal
);

router.post(
  "/",
  authMiddleware,
  validate(careerGoalSchema),
  createCareerGoalController
);

router.patch(
  "/me",
  authMiddleware,
  validate(updateCareerGoalSchema),
  updateCareerGoalController
);

export default router;