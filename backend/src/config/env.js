import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,

  MONGO_URI: process.env.MONGO_URI,

  FRONTEND_URL: process.env.FRONTEND_URL,

  ML_SERVICE_URL:
    process.env.ML_SERVICE_URL || "http://localhost:8000",

  N8N_WEBHOOK_URL:
    process.env.N8N_WEBHOOK_URL,

  AI_ENABLED:
    process.env.AI_ENABLED === "true",

  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY,

  AI_PROVIDER:
    process.env.AI_PROVIDER || "none",

  JWT_SECRET:
    process.env.JWT_SECRET,

  BREVO_API_KEY:
    process.env.BREVO_API_KEY,

  BREVO_SENDER_EMAIL:
    process.env.BREVO_SENDER_EMAIL,

  BREVO_SENDER_NAME:
    process.env.BREVO_SENDER_NAME || "CampusX",

  GOOGLE_CLIENT_ID:
    process.env.GOOGLE_CLIENT_ID,
};

export default env;