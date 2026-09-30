import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 5000,

  MONGO_URI: process.env.MONGO_URI,

  FRONTEND_URL: process.env.FRONTEND_URL,

  ML_SERVICE_URL:
    process.env.ML_SERVICE_URL || "http://localhost:8000",

  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,

  AI_ENABLED: process.env.AI_ENABLED === "true",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  AI_PROVIDER: process.env.AI_PROVIDER || "none",

  JWT_SECRET: process.env.JWT_SECRET,

  BREVO_API_KEY: process.env.BREVO_API_KEY,

  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,

  BREVO_SENDER_NAME:
    process.env.BREVO_SENDER_NAME || "CampusX",

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,

  LEARNING_CACHE_INTERNAL_KEY:
    process.env.LEARNING_CACHE_INTERNAL_KEY,

  ELEVENLABS_API_KEY:
    process.env.ELEVENLABS_API_KEY,

  ELEVENLABS_VOICE_ID:
    process.env.ELEVENLABS_VOICE_ID,

  ELEVENLABS_TTS_MODEL:
    process.env.ELEVENLABS_TTS_MODEL ||
    "eleven_flash_v2_5",

  ELEVENLABS_STT_MODEL:
    process.env.ELEVENLABS_STT_MODEL ||
    "scribe_v2",
};

export default env;