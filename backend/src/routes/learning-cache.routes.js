import express from "express";

import {
  saveLearningCache,
  getLearningCache,
} from "../controllers/learning-cache.controller.js";

import internalCacheMiddleware from "../middleware/internal-cache.middleware.js";

const router = express.Router();

router.post(
  "/",
  internalCacheMiddleware,
  saveLearningCache
);

router.get(
  "/:cacheKey",
  internalCacheMiddleware,
  getLearningCache
);

export default router;