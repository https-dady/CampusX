import express from "express";

import {
  createRoadmap,
  getRoadmap,
  getAllRoadmaps,
  updateRoadmap,
  deleteRoadmap,
} from "../controllers/learning-roadmap.controller.js";

import validate from "../middleware/validation.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";

import {
  createLearningRoadmapSchema,
  updateLearningRoadmapSchema,
} from "../validators/learning-roadmap.validator.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validate(createLearningRoadmapSchema),
  createRoadmap
);

router.post(
  "/find",
  authMiddleware,
  validate(
    createLearningRoadmapSchema.pick({
      domain: true,
      techStack: true,
    })
  ),
  getRoadmap
);

router.get(
  "/",
  authMiddleware,
  getAllRoadmaps
);

router.patch(
  "/:roadmapId",
  authMiddleware,
  validate(updateLearningRoadmapSchema),
  updateRoadmap
);

router.delete(
  "/:roadmapId",
  authMiddleware,
  deleteRoadmap
);

export default router;