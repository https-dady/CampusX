import express from "express";

import {
  searchJobsController,
  searchProfileJobsController,
} from "../controllers/job.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import validate from "../middleware/validation.middleware.js";

import {
  jobSearchSchema,
} from "../validators/job.validator.js";

const router =
  express.Router();

/*
 * Normal / Dream Job job search
 *
 * POST /api/jobs/search
 *
 * Dream Job passes the selected target role.
 */
router.post(
  "/search",
  authMiddleware,
  validate(
    jobSearchSchema
  ),
  searchJobsController
);

/*
 * Jobs based on current profile
 *
 * GET /api/jobs/profile
 *
 * No targetRole comes from frontend.
 *
 * Backend derives:
 *
 * Profile
 *   ↓
 * Existing ML Career Prediction
 *   ↓
 * Primary Career
 *   ↓
 * Existing searchJobs()
 *   ↓
 * n8n + TinyFish
 */
router.get(
  "/profile",
  authMiddleware,
  searchProfileJobsController
);

export default router;