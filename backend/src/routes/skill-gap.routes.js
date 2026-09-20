import express from "express";

import { getMySkillGap } from "../controllers/skill-gap.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/me",
  authMiddleware,
  getMySkillGap
);

export default router;