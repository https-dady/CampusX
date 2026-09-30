import {
  createInterviewSession,
  submitInterviewAnswer,
  endInterviewSession,
} from "../services/interview/interview.service.js";

import {
  textToSpeech,
  speechToText,
} from "../services/interview/voice.service.js";


import {
  createGeminiLiveToken,
} from "../services/ai/gemini-live.provider.js";


export const createSession = async (req, res) => {
  try {
    const { targetRole, difficulty } = req.body;

    const session = await createInterviewSession({
      userId: req.user.userId,
      targetRole,
      difficulty,
    });

    return res.status(201).json({
      success: true,
      message: "Interview session created successfully.",
      data: {
        sessionId: session._id,
        targetRole: session.targetRole,
        difficulty: session.difficulty,
        status: session.status,
        question: session.questions[0].question,
        startedAt: session.startedAt,
      },
    });
  } catch (error) {
    console.error(
      "Create interview session error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode === 404
          ? error.message
          : "Unable to create interview session.",
    });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const result = await submitInterviewAnswer({
      userId: req.user.userId,
      sessionId: req.params.id,
      answer: req.body.answer,
    });

    return res.status(200).json({
      success: true,
      message: result.completed
        ? "Interview completed successfully."
        : "Answer evaluated successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Submit interview answer error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to evaluate interview answer.",
    });
  }
};

export const endSession = async (req, res) => {
  try {
    const result = await endInterviewSession({
      userId: req.user.userId,
      sessionId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Interview completed successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "End interview session error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to complete interview.",
    });
  }
};

export const generateQuestionAudio = async (
  req,
  res
) => {
  try {
    const { text } = req.body;

    const audio = await textToSpeech(text);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.length,
      "Cache-Control": "no-store",
    });

    return res.status(200).send(audio);
  } catch (error) {
    console.error(
      "Generate interview audio error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to generate interview audio.",
    });
  }
};

export const submitVoiceAnswer = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Audio file is required.",
      });
    }

    const transcription = await speechToText({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });

    if (!transcription.text) {
      return res.status(422).json({
        success: false,
        message:
          "No speech could be detected in the audio.",
      });
    }

    const result = await submitInterviewAnswer({
      userId: req.user.userId,
      sessionId: req.params.id,
      answer: transcription.text,
    });

    let audio = null;

    if (
      !result.completed &&
      result.nextQuestion
    ) {
      audio = await textToSpeech(
        result.nextQuestion
      );
    }

    return res.status(200).json({
      success: true,

      message: result.completed
        ? "Voice answer processed and interview completed."
        : "Voice answer processed successfully.",

      data: {
        transcription: {
          text: transcription.text,
          languageCode:
            transcription.languageCode,
          languageProbability:
            transcription.languageProbability,
        },

        interview: result,

        audio: audio
          ? audio.toString("base64")
          : null,
      },
    });
  } catch (error) {
    console.error(
      "Submit voice answer error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to process voice answer.",
    });
  }
};

export const createLiveToken = async (req, res) => {
  try {
    const {
      targetRole,
      difficulty = "medium",
    } = req.body;

    const result = await createGeminiLiveToken({
      targetRole,
      difficulty,
    });

    return res.status(200).json({
      success: true,
      message:
        "Gemini Live token created successfully.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Create Gemini Live token error:",
      error
    );

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode
          ? error.message
          : "Unable to create Gemini Live token.",
    });
  }
};