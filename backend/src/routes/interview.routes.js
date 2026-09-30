import express from "express";
import multer from "multer";

import {
  createSession,
  submitAnswer,
  endSession,
  generateQuestionAudio,
  submitVoiceAnswer,
  createLiveToken,
} from "../controllers/interview.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  validateInterviewId,
} from "../validators/interview.validator.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith("audio/")) {
      return callback(
        new Error("Only audio files are allowed.")
      );
    }

    callback(null, true);
  },
});

router.post(
  "/session",
  authMiddleware,
  createSession
);


router.post(
  "/live-token",
  authMiddleware,
  createLiveToken
);


router.post(
  "/:id/answer",
  authMiddleware,
  validateInterviewId,
  submitAnswer
);

router.post(
  "/:id/voice-answer",
  authMiddleware,
  validateInterviewId,
  upload.single("audio"),
  submitVoiceAnswer
);

router.post(
  "/:id/end",
  authMiddleware,
  validateInterviewId,
  endSession
);

router.post(
  "/voice/speak",
  authMiddleware,
  generateQuestionAudio
);

export default router;