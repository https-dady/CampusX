import express from "express";

import {
  createCareerRequirementController,
  getCareerRequirementController,
  getActiveCareerRequirementsController,
  updateCareerRequirementController,
} from "../controllers/career-requirement.controller.js";

import {
  careerRequirementSchema,
  updateCareerRequirementSchema,
} from "../validators/career-requirement.validator.js";

import validate from "../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/",
  validate(careerRequirementSchema),
  createCareerRequirementController
);

router.get(
  "/",
  getActiveCareerRequirementsController
);

router.get(
  "/:career/:domain",
  getCareerRequirementController
);

router.patch(
  "/:id",
  validate(updateCareerRequirementSchema),
  updateCareerRequirementController
);

export default router;