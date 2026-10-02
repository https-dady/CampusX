import express from "express";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
  upsertLearningPreferenceSchema,
} from "../validators/learning-preference.validator.js";

import {
  upsertLearningPreference,
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
  validate(upsertLearningPreferenceSchema),
  upsertLearningPreference
);

export default router;