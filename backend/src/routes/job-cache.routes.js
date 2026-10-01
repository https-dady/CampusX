import express from "express";

import {
  saveJobCache,
  getJobCache,
} from "../controllers/job-cache.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import internalCacheMiddleware from "../middleware/internal-cache.middleware.js";

const router = express.Router();

router.post(
  "/",
  internalCacheMiddleware,
  saveJobCache
);

router.get(
  "/:cacheKey",
  authMiddleware,
  getJobCache
);

export default router;