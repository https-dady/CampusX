import express from "express";
import { testAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.get("/test", testAI);

export default router;