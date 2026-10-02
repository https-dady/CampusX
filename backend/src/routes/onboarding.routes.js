import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  analyzeResumeForOnboarding,
  completeProfileForOnboarding,
  getOnboarding,
  selectJourneyForOnboarding,
} from "../controllers/onboarding.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    const allowedTypes = new Set([
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);

    if (!allowedTypes.has(file.mimetype)) {
      return callback(
        new Error(
          "Only PDF and DOCX resumes are supported."
        )
      );
    }

    return callback(null, true);
  },
});

router.get(
  "/me",
  authMiddleware,
  getOnboarding
);

router.post(
  "/resume",
  authMiddleware,
  upload.single("file"),
  analyzeResumeForOnboarding
);

router.post(
  "/profile/complete",
  authMiddleware,
  completeProfileForOnboarding
);

router.post(
  "/journey",
  authMiddleware,
  selectJourneyForOnboarding
);

export default router;