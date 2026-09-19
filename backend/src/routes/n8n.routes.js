import express from "express";
import {
  triggerFoundationWorkflow,
} from "../services/n8n/n8n.service.js";

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const data = await triggerFoundationWorkflow({
      test: true,
      source: "career-readiness-platform",
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      n8n: data,
    });
  } catch (error) {
    console.error("n8n connection error:", error.message);

    res.status(503).json({
      success: false,
      message: "n8n workflow is currently unavailable",
    });
  }
});

export default router;