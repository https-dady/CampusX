import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import env from "./config/env.js";

import mlRoutes from "./routes/ml.routes.js";
import n8nRoutes from "./routes/n8n.routes.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";

import careerRoutes from "./routes/career.routes.js";

import careerGoalRoutes from "./routes/career-goal.routes.js";

import careerRequirementRoutes from "./routes/career-requirement.routes.js";

import skillGapRoutes from "./routes/skill-gap.routes.js";

import careerRoadmapRoutes from "./routes/career-roadmap.routes.js";

import personalizedRoadmapRoutes from "./routes/personalized-roadmap.routes.js";
import learningRoutes from "./routes/learning.routes.js";
import learningCacheRoutes from "./routes/learning-cache.routes.js";
import learningRoadmapRoutes from "./routes/learning-roadmap.routes.js";

import jobRoutes from "./routes/job.routes.js";
import jobCacheRoutes from "./routes/job-cache.routes.js";

import aiRoutes from "./routes/ai.routes.js";
import interviewRoutes from "./routes/interview.routes.js";

import communityRoutes from "./routes/community.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import onboardingRoutes from "./routes/onboarding.routes.js";

import learningGoalRoutes from "./routes/learning-goal.routes.js";
import learningPreferenceRoutes from "./routes/learning-preference.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin:
      env.FRONTEND_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  "/api/skill-gap",
  skillGapRoutes
);

app.use(
  "/api/communities",
  communityRoutes
);

app.use(morgan("dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  "/api",
  apiLimiter
);

/*
 * API Routes
 */

app.use(
  "/api/n8n",
  n8nRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

/*
 * Resume Checker
 */
app.use(
  "/api/resume",
  resumeRoutes
);

app.use(
  "/api/onboarding",
  onboardingRoutes
);

app.use(
  "/api/ml",
  mlRoutes
);

app.use(
  "/api/career",
  careerRoutes
);

app.use(
  "/api/career-goal",
  careerGoalRoutes
);

app.use(
  "/api/career-requirement",
  careerRequirementRoutes
);

app.use(
  "/api/career-roadmap",
  careerRoadmapRoutes
);

app.use(
  "/api/personalized-roadmap",
  personalizedRoadmapRoutes
);

app.use(
  "/api/learning",
  learningRoutes
);

app.use(
  "/api/learning/cache",
  learningCacheRoutes
);

app.use(
  "/api/learning-roadmap",
  learningRoadmapRoutes
);

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/jobs/cache",
  jobCacheRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);

app.use(
  "/api/interview",
  interviewRoutes
);

app.use(
  "/api/learning-goal",
  learningGoalRoutes
);

app.use(
  "/api/learning-preference",
  learningPreferenceRoutes
);

/*
 * Health Check
 */
app.get(
  "/api/health",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message:
        "Career Readiness API is running",
      timestamp:
        new Date().toISOString(),
    });
  }
);

export default app;