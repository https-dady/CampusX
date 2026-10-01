import { analyzeResume } from "../services/resume/resume.service.js";

export const checkResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required.",
      });
    }

    const result = await analyzeResume({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Resume check error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode && error.statusCode < 500
          ? error.message
          : "Unable to analyze resume right now.",
    });
  }
};