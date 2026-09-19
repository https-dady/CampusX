import express from "express";
import { checkMLService } from "../services/ml/ml.service.js";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    const data = await checkMLService();

    res.status(200).json({
      success: true,
      mlService: data,
    });
  } catch (error) {
    console.error("ML service connection error:", error.message);

    res.status(503).json({
      success: false,
      message: "ML service is currently unavailable",
    });
  }
});

export default router;