import express from "express";

import {
  getResources,
} from "../controllers/learning.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
  learningRequestSchema,
} from "../validators/learning.validator.js";

const router = express.Router();

router.post(
  "/resources",
  authMiddleware,
  validate(learningRequestSchema),
  getResources
);

export default router;