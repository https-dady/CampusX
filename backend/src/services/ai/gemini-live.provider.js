import { GoogleGenAI } from "@google/genai";
import env from "../../config/env.js";

const MODEL =
  "gemini-2.5-flash-native-audio-preview-12-2025";

const createClient = () => {
  if (!env.GEMINI_API_KEY) {
    const error = new Error(
      "Gemini API key is not configured."
    );

    error.statusCode = 500;

    throw error;
  }

  return new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
    httpOptions: {
      apiVersion: "v1beta",
    },
  });
};

export const createGeminiLiveToken = async ({
  targetRole,
  difficulty = "medium",
}) => {
  const role = String(targetRole || "").trim();

  if (!role) {
    const error = new Error(
      "Target role is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const client = createClient();

  const expireTime = new Date(
    Date.now() + 30 * 60 * 1000
  ).toISOString();

  const newSessionExpireTime = new Date(
    Date.now() + 60 * 1000
  ).toISOString();

  const systemInstruction = `
You are a professional technical interviewer conducting
a realistic technical interview.

Target role: ${role}
Difficulty: ${difficulty}

Interview rules:

- Ask exactly one question at a time.
- Keep every question relevant to the target role.
- Focus on practical technical knowledge.
- Ask follow-up questions based on the candidate's answer.
- Do not repeat questions.
- Gradually increase difficulty when appropriate.
- If the candidate gives an incomplete answer, probe the missing concept.
- If the candidate gives a strong answer, ask a deeper related question.
- Do not give the candidate the answer.
- Keep the conversation professional and concise.
- Speak naturally like a real interviewer.
- Start the interview by asking the first technical question.
`;

  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime,
      newSessionExpireTime,

      liveConnectConstraints: {
        model: MODEL,

        config: {
          responseModalities: ["AUDIO"],

          inputAudioTranscription: {},

          outputAudioTranscription: {},

          sessionResumption: {},

          systemInstruction: {
            parts: [
              {
                text: systemInstruction,
              },
            ],
          },
        },
      },
    },
  });

  return {
    token: token.name,
    model: MODEL,
    expiresAt: expireTime,
    newSessionExpiresAt: newSessionExpireTime,
  };
};