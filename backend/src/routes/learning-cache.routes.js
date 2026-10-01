import express from "express";

import {
  saveLearningCache,
  getLearningCache,
} from "../controllers/learning-cache.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import internalCacheMiddleware from "../middleware/internal-cache.middleware.js";

const router = express.Router();

/*
 * Internal backend/workflow access only.
 * The internal key must never be exposed to the frontend.
 */
router.post(
  "/",
  internalCacheMiddleware,
  saveLearningCache
);

/*
 * Authenticated CampusX students can read
 * their learning cache through the normal JWT.
 */
router.get(
  "/:cacheKey",
  authMiddleware,
  getLearningCache
);

export default router;