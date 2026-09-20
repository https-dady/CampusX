import express from "express";

import { getMyPersonalizedRoadmap } from "../controllers/personalized-roadmap.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  getMyPersonalizedRoadmap
);

export default router;