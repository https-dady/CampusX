import express from "express";

import {
  getMyPersonalizedRoadmap,
  getMyPersonalizedLearningRoadmap,
} from "../controllers/personalized-roadmap.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  getMyPersonalizedRoadmap
);

router.get(
  "/learning/me",
  authMiddleware,
  getMyPersonalizedLearningRoadmap
);

export default router;