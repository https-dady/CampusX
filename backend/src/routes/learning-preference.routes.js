import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
  createLearningPreferenceSchema,
} from "../validators/learning-preference.validator.js";

import {
  createLearningPreference,
  getLearningPreference,
} from "../controllers/learning-preference.controller.js";

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  getLearningPreference
);

router.post(
  "/",
  authMiddleware,
  validate(createLearningPreferenceSchema),
  createLearningPreference
);

export default router;