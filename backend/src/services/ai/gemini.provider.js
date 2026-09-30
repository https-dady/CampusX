import { GoogleGenAI } from "@google/genai";
import env from "../../config/env.js";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.6-flash";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const generateText = async (prompt) => {
  if (!env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }

  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      const status = error?.status;

      const retryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      if (!retryable || attempt === maxAttempts) {
        throw error;
      }

      const delay = 1000 * 2 ** (attempt - 1);

      console.log(
        `Gemini temporary error (${status}). Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }
};