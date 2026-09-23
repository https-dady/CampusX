import express from "express";

import { searchJobsController } from "../controllers/job.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import validate from "../middleware/validation.middleware.js";

import { jobSearchSchema } from "../validators/job.validator.js";

const router = express.Router();

router.post(
  "/search",
  authMiddleware,
  validate(jobSearchSchema),
  searchJobsController
);

export default router;