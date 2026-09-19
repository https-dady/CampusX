import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mlRoutes from "./routes/ml.routes.js";

import n8nRoutes from "./routes/n8n.routes.js";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/n8n", n8nRoutes);

app.use(morgan("dev"));

app.use("/api/auth", authRoutes);


const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.use("/api/ml", mlRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Career Readiness API is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;