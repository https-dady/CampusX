import { generateText } from "./gemini.provider.js";
import env from "../../config/env.js";

export const generateAIText = async (prompt) => {
  if (!env.AI_ENABLED) {
    throw new Error("AI service is disabled.");
  }

  if (env.AI_PROVIDER !== "gemini") {
    throw new Error(`Unsupported AI provider: ${env.AI_PROVIDER}`);
  }

  return generateText(prompt);
};