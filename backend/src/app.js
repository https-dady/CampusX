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

app.use(morgan("dev"));

/*
 * Global API rate limiter
 * Must be registered before API routes.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

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