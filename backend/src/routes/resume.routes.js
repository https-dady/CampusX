import express from "express";
import multer from "multer";

import authMiddleware from "../middleware/auth.middleware.js";
import { checkResume } from "../controllers/resume.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = new Set([
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);

    if (!allowedTypes.has(file.mimetype)) {
      return callback(
        new Error("Only PDF and DOCX resume files are allowed.")
      );
    }

    callback(null, true);
  },
});

router.post(
  "/check",
  authMiddleware,
  (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
      if (!error) {
        return next();
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Invalid resume upload.",
      });
    });
  },
  checkResume
);

export default router;