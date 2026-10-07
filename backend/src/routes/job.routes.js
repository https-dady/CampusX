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

router.post(
  "/search",
  authMiddleware,
  validate(
    jobSearchSchema
  ),
  searchJobsController
);

/*
 * Profile-based job search.
 *
 * No targetRole is accepted from the frontend.
 * The backend derives the role from the user's
 * existing profile through the existing ML pipeline.
 */
router.get(
  "/profile",
  authMiddleware,
  searchProfileJobsController
);

export default router;