import express from "express";

import {
  createCareerRoadmapController,
  getCareerRoadmapController,
  getActiveCareerRoadmapsController,
  updateCareerRoadmapController,
} from "../controllers/career-roadmap.controller.js";

import {
  careerRoadmapSchema,
  updateCareerRoadmapSchema,
} from "../validators/career-roadmap.validator.js";

import validate from "../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  validate(careerRoadmapSchema),
  createCareerRoadmapController
);

router.get(
  "/",
  getActiveCareerRoadmapsController
);

router.get(
  "/:career/:domain",
  getCareerRoadmapController
);

router.patch(
  "/:id",
  validate(updateCareerRoadmapSchema),
  updateCareerRoadmapController
);

export default router;