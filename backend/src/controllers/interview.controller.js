import {
  createInterviewSession,
  createLiveInterviewSession,
  submitInterviewAnswer,
  recordLiveInterviewTurn,
  endInterviewSession,
} from "../services/interview/interview.service.js";

import {
  textToSpeech,
  speechToText,
} from "../services/interview/voice.service.js";

import {
  createGeminiLiveToken,
} from "../services/ai/gemini-live.provider.js";

/*
=========================================================
CREATE NORMAL INTERVIEW SESSION
=========================================================
*/

export const createSession =
  async (req, res) => {
    try {
      const {
        targetRole,
        difficulty,
      } = req.body;

      const session =
        await createInterviewSession({
          userId: req.user.userId,
          targetRole,
          difficulty,
        });

      return res.status(201).json({
        success: true,
        message:
          "Interview session created successfully.",
        data: {
          sessionId: session._id,
          targetRole:
            session.targetRole,
          difficulty:
            session.difficulty,
          status:
            session.status,
          question:
            session.questions[0].question,
          startedAt:
            session.startedAt,
        },
      });
    } catch (error) {
      console.error(
        "Create interview session error:",
        error
      );

      return res
        .status(error?.statusCode || 500)
        .json({
          success: false,
          message:
            error?.message ||
            "Unable to create interview session.",
        });
    }
  };

/*
=========================================================
CREATE GEMINI LIVE INTERVIEW SESSION
=========================================================
*/

export const createLiveSession =
  async (req, res) => {
    try {
      const {
        targetRole,
        difficulty = "medium",
      } = req.body;

      const session =
        await createLiveInterviewSession({
          userId: req.user.userId,
          targetRole,
          difficulty,
        });

      return res.status(201).json({
        success: true,
        message:
          "Live interview session created successfully.",
        data: {
          sessionId: session._id,
          targetRole:
            session.targetRole,
          difficulty:
            session.difficulty,
          status:
            session.status,
          startedAt:
            session.startedAt,
        },
      });
    } catch (error) {
      console.error(
        "Create live interview session error:",
        error
      );

      return res
        .status(error?.statusCode || 500)
        .json({
          success: false,
          message:
            error?.message ||
            "Unable to create live interview session.",
        });
    }
  };

/*
=========================================================
SUBMIT NORMAL INTERVIEW ANSWER
=========================================================
*/

export const submitAnswer =
  async (req, res) => {
    try {
      const result =
        await submitInterviewAnswer({
          userId: req.user.userId,
          sessionId: req.params.id,
          answer: req.body.answer,
        });

      return res.status(200).json({
        success: true,
        message:
          "Answer evaluated successfully.",
        data: result,
      });
    } catch (error) {
      console.error(
        "Submit interview answer error:",
        error
      );

      return res
        .status(error?.statusCode || 500)
        .json({
          success: false,
          message:
            error?.message ||
            "Unable to evaluate interview answer.",
        });
    }
  };

/*
=========================================================
SUBMIT GEMINI LIVE INTERVIEW TURN
=========================================================

Flow:

AI Question
     ↓
User Answer
     ↓
Frontend sends question + answer
     ↓
recordLiveInterviewTurn()
     ↓
Save/evaluate answer
     ↓
Return next question/count
=========================================================
*/

export const submitLiveTurn =
  async (req, res) => {
    try {
      const {
        question,
        answer,
        nextQuestion,
      } = req.body;

      const result =
        await recordLiveInterviewTurn({
          userId:
            req.user.userId,

          sessionId:
            req.params.id,

          question,

          answer,

          nextQuestion,
        });

      return res.status(200).json({
        success: true,
        message:
          "Live interview answer recorded successfully.",
        data: result,
      });
    } catch (error) {
      /*
       * Detailed logging is intentional here.
       *
       * The previous implementation returned only:
       * "Unable to record live interview answer."
       *
       * That hid the actual backend exception.
       */

      console.error(
        "\n========================================"
      );

      console.error(
        "LIVE INTERVIEW TURN ERROR"
      );

      console.error(
        "========================================"
      );

      console.error(
        "Session ID:",
        req.params?.id
      );

      console.error(
        "User ID:",
        req.user?.userId
      );

      console.error(
        "Question:",
        req.body?.question
      );

      console.error(
        "Answer length:",
        typeof req.body?.answer ===
          "string"
          ? req.body.answer.length
          : 0
      );

      console.error(
        "Next question:",
        req.body?.nextQuestion
      );

      console.error(
        "Error message:",
        error?.message
      );

      console.error(
        "Error status:",
        error?.statusCode
      );

      console.error(
        "Error name:",
        error?.name
      );

      console.error(
        "Error stack:",
        error?.stack
      );

      console.error(
        "========================================\n"
      );

      /*
       * During debugging, return the actual
       * service error instead of hiding it.
       *
       * This will allow the browser Network
       * tab to show the exact reason for 500.
       */

      return res
        .status(error?.statusCode || 500)
        .json({
          success: false,
          message:
            error?.message ||
            "Unable to record live interview answer.",
        });
    }
  };

/*
=========================================================
END INTERVIEW SESSION
=========================================================
*/

export const endSession =
  async (req, res) => {
    try {
      const result =
        await endInterviewSession({
          userId: req.user.userId,
          sessionId: req.params.id,
        });

      return res.status(200).json({
        success: true,
        message:
          "Interview completed successfully.",
        data: result,
      });
    } catch (error) {
      console.error(
        "End interview session error:",
        error
      );

      return res
        .status(error?.statusCode || 500)
        .json({
          success: false,
          message:
            error?.message ||
            "Unable to complete interview.",
        });
    }
  };

/*
=========================================================
GENERATE INTERVIEW QUESTION AUDIO
=========================================================
*/

export const generateQuestionAudio =
  async (req, res) => {
    try {
      const {
        text,
      } = req.body;

      const audio =
        await textToSpeech(text);

      res.set({
        "Content-Type":
          "audio/mpeg",

        "Content-Length":
          audio.length,

        "Cache-Control":
          "no-store",
      });

      return res
        .status(200)
        .send(audio);
    } catch (error) {
      console.error(
        "Generate interview audio error:",
        error
      );

      return res
        .status(error?.statusCode || 500)
        .json({
          success: false,
          message:
            error?.message ||
            "Unable to generate interview audio.",
        });
    }
  };

/*
=========================================================
SUBMIT VOICE ANSWER
=========================================================
*/

export const submitVoiceAnswer =
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Audio file is required.",
        });
      }

      const transcription =
        await speechToText({
          buffer:
            req.file.buffer,

          mimetype:
            req.file.mimetype,

          originalname:
            req.file.originalname,
        });

      if (!transcription.text) {
        return res.status(422).json({
          success: false,
          message:
            "No speech could be detected in the audio.",
        });
      }

      const result =
        await submitInterviewAnswer({
          userId:
            req.user.userId,

          sessionId:
            req.params.id,

          answer:
            transcription.text,
        });

      let audio = null;

      if (result.nextQuestion) {
        audio =
          await textToSpeech(
            result.nextQuestion
          );
      }

      return res.status(200).json({
        success: true,
        message:
          "Voice answer processed successfully.",
        data: {
          transcription: {
            text:
              transcription.text,

            languageCode:
              transcription.languageCode,

            languageProbability:
              transcription.languageProbability,
          },

          interview:
            result,

          audio:
            audio
              ? audio.toString("base64")
              : null,
        },
      });
    } catch (error) {
      console.error(
        "Submit voice answer error:",
        error
      );

      return res
        .status(error?.statusCode || 500)
        .json({
          success: false,
          message:
            error?.message ||
            "Unable to process voice answer.",
        });
    }
  };

/*
=========================================================
CREATE GEMINI LIVE TOKEN
=========================================================
*/

export const createLiveToken =
  async (req, res) => {
    try {
      const {
        targetRole,
        difficulty = "medium",
      } = req.body;

      const result =
        await createGeminiLiveToken({
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

      return res
        .status(error?.statusCode || 500)
        .json({
          success: false,
          message:
            error?.message ||
            "Unable to create Gemini Live token.",
        });
    }
  };