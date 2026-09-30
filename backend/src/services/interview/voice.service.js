import env from "../../config/env.js";

const ELEVENLABS_BASE_URL =
  "https://api.elevenlabs.io/v1";

const ensureConfiguration = () => {
  if (!env.ELEVENLABS_API_KEY) {
    const error = new Error(
      "ElevenLabs API key is not configured."
    );

    error.statusCode = 500;

    throw error;
  }

  if (!env.ELEVENLABS_VOICE_ID) {
    const error = new Error(
      "ElevenLabs voice ID is not configured."
    );

    error.statusCode = 500;

    throw error;
  }
};

const parseElevenLabsError = async (response) => {
  try {
    const data = await response.json();

    return (
      data?.detail?.message ||
      data?.detail ||
      data?.message ||
      `ElevenLabs request failed with status ${response.status}.`
    );
  } catch {
    return `ElevenLabs request failed with status ${response.status}.`;
  }
};

export const textToSpeech = async (text) => {
  ensureConfiguration();

  const cleanText = String(text || "").trim();

  if (!cleanText) {
    const error = new Error(
      "Text for speech generation cannot be empty."
    );

    error.statusCode = 400;

    throw error;
  }

  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/text-to-speech/${env.ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",

      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        text: cleanText,
        model_id: env.ELEVENLABS_TTS_MODEL,
      }),
    }
  );

  if (!response.ok) {
    const message = await parseElevenLabsError(response);

    const error = new Error(message);
    error.statusCode = response.status;

    throw error;
  }

  const audioBuffer = Buffer.from(
    await response.arrayBuffer()
  );

  return audioBuffer;
};

export const speechToText = async ({
  buffer,
  mimetype,
  originalname,
}) => {
  ensureConfiguration();

  if (!buffer || !buffer.length) {
    const error = new Error(
      "Audio file is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const formData = new FormData();

  const audioBlob = new Blob([buffer], {
    type: mimetype || "audio/webm",
  });

  formData.append(
    "file",
    audioBlob,
    originalname || "interview-answer.webm"
  );

  formData.append(
    "model_id",
    env.ELEVENLABS_STT_MODEL
  );

  formData.append(
    "tag_audio_events",
    "false"
  );

  const response = await fetch(
    `${ELEVENLABS_BASE_URL}/speech-to-text`,
    {
      method: "POST",

      headers: {
        "xi-api-key": env.ELEVENLABS_API_KEY,
      },

      body: formData,
    }
  );

  if (!response.ok) {
    const message = await parseElevenLabsError(response);

    const error = new Error(message);
    error.statusCode = response.status;

    throw error;
  }

  const data = await response.json();

  return {
    text: String(data.text || "").trim(),
    languageCode: data.language_code || null,
    languageProbability:
      data.language_probability ?? null,
  };
};