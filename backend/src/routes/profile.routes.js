import express from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/profile.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

import {
  updateProfileSchema,
} from "../validators/profile.validator.js";

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  getProfile
);

router.patch(
  "/me",
  authMiddleware,
  validate(updateProfileSchema),
  updateProfile
);

export default router;