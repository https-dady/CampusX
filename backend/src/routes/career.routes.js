import express from "express";

import { predictCareer } from "../controllers/career.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/predict",
  authMiddleware,
  predictCareer
);

export default router;