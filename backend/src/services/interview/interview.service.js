import InterviewSession from "../../models/interview-session.model.js";
import User from "../../models/user.model.js";

import {
  generateFirstQuestion,
  generateNextQuestion,
} from "./interview-question.service.js";

import {
  evaluateAnswer,
} from "./interview-evaluation.service.js";

import {
  generateFinalFeedback,
} from "./interview-feedback.service.js";

const LIVE_PENDING_QUESTION =
  "__LIVE_PENDING_FIRST_QUESTION__";

const calculateOverallScore = (
  questions
) => {
  const scores =
    questions
      .filter(
        (question) =>
          question.answer &&
          Number.isFinite(
            Number(
              question.score
            )
          )
      )
      .map((question) =>
        Number(
          question.score
        )
      );

  if (!scores.length) {
    return null;
  }

  const total =
    scores.reduce(
      (sum, score) =>
        sum + score,
      0
    );

  return Math.round(
    total / scores.length
  );
};

/*
 * Final report preparation.
 *
 * Live interview answers are saved immediately
 * without waiting for AI evaluation.
 *
 * Evaluation is performed only when the user
 * explicitly ends the interview.
 */
const completeInterviewSession =
  async (session) => {
    const answeredQuestions =
      session.questions.filter(
        (question) =>
          question.answer &&
          String(
            question.answer
          ).trim()
      );

    if (
      !answeredQuestions.length
    ) {
      const error =
        new Error(
          "At least one answered question is required."
        );

      error.statusCode = 400;

      throw error;
    }

    /*
     * Evaluate only questions which do not
     * already have a valid evaluation.
     *
     * This keeps the system compatible with
     * normal interview sessions as well.
     */
    const questionsNeedingEvaluation =
      answeredQuestions.filter(
        (question) =>
          !question.evaluation ||
          !Number.isFinite(
            Number(
              question.score
            )
          )
      );

    for (
      const question of
      questionsNeedingEvaluation
    ) {
      const evaluation =
        await evaluateAnswer({
          targetRole:
            session.targetRole,

          difficulty:
            session.difficulty,

          question:
            question.question,

          answer:
            question.answer,
        });

      question.evaluation =
        evaluation;

      question.score =
        Number(
          evaluation?.score
        );
    }

    /*
     * Persist evaluations before creating
     * the final AI report.
     */
    await session.save();

    const calculatedScore =
      calculateOverallScore(
        answeredQuestions
      );

    const feedback =
      await generateFinalFeedback({
        targetRole:
          session.targetRole,

        difficulty:
          session.difficulty,

        questions:
          answeredQuestions,
      });

    const reportScore =
      Number(
        feedback?.overallScore
      );

    session.overallScore =
      calculatedScore !== null
        ? calculatedScore
        : Number.isFinite(
              reportScore
            )
          ? Math.min(
              100,
              Math.max(
                0,
                reportScore
              )
            )
          : 0;

    session.feedback =
      feedback;

    session.status =
      "completed";

    session.completedAt =
      new Date();

    await session.save();

    return {
      sessionId:
        session._id,

      status:
        session.status,

      overallScore:
        session.overallScore,

      feedback:
        session.feedback,

      questionsAnswered:
        answeredQuestions.length,

      completedAt:
        session.completedAt,
    };
  };

export const createInterviewSession =
  async ({
    userId,
    targetRole,
    difficulty = "medium",
  }) => {
    const user =
      await User.findById(
        userId
      ).select("profile");

    if (!user) {
      const error =
        new Error(
          "User not found."
        );

      error.statusCode = 404;

      throw error;
    }

    const question =
      await generateFirstQuestion({
        targetRole,
        difficulty,
        profile:
          user.profile,
      });

    const session =
      await InterviewSession.create({
        user: userId,

        targetRole,

        difficulty,

        questions: [
          {
            question,
          },
        ],
      });

    return session;
  };

export const createLiveInterviewSession =
  async ({
    userId,
    targetRole,
    difficulty = "medium",
  }) => {
    const role =
      String(
        targetRole || ""
      ).trim();

    if (!role) {
      const error =
        new Error(
          "Target role is required."
        );

      error.statusCode = 400;

      throw error;
    }

    const user =
      await User.findById(
        userId
      ).select("_id");

    if (!user) {
      const error =
        new Error(
          "User not found."
        );

      error.statusCode = 404;

      throw error;
    }

    /*
     * Gemini Live generates the
     * first question.
     *
     * MongoDB temporarily stores
     * a marker which is replaced
     * by the actual first question
     * when the first answer is saved.
     */
    const session =
      await InterviewSession.create({
        user: userId,

        targetRole: role,

        difficulty,

        questions: [
          {
            question:
              LIVE_PENDING_QUESTION,
          },
        ],
      });

    return session;
  };

export const submitInterviewAnswer =
  async ({
    userId,
    sessionId,
    answer,
  }) => {
    const session =
      await InterviewSession.findOne({
        _id: sessionId,
        user: userId,
      });

    if (!session) {
      const error =
        new Error(
          "Interview session not found."
        );

      error.statusCode = 404;

      throw error;
    }

    if (
      session.status !==
      "active"
    ) {
      const error =
        new Error(
          "Interview session is not active."
        );

      error.statusCode = 400;

      throw error;
    }

    if (
      !answer ||
      typeof answer !==
        "string" ||
      !answer.trim()
    ) {
      const error =
        new Error(
          "Answer cannot be empty."
        );

      error.statusCode = 400;

      throw error;
    }

    const currentQuestion =
      session.questions[
        session.questions.length - 1
      ];

    if (!currentQuestion) {
      const error =
        new Error(
          "No active interview question."
        );

      error.statusCode = 400;

      throw error;
    }

    const cleanAnswer =
      answer.trim();

    currentQuestion.answer =
      cleanAnswer;

    const evaluation =
      await evaluateAnswer({
        targetRole:
          session.targetRole,

        difficulty:
          session.difficulty,

        question:
          currentQuestion.question,

        answer:
          cleanAnswer,
      });

    currentQuestion.evaluation =
      evaluation;

    currentQuestion.score =
      evaluation.score;

    const user =
      await User.findById(
        userId
      ).select("profile");

    if (!user) {
      const error =
        new Error(
          "User not found."
        );

      error.statusCode = 404;

      throw error;
    }

    const previousQuestions =
      session.questions.map(
        (question) =>
          question.question
      );

    let nextQuestion = "";

    let questionType =
      "next";

    if (
      evaluation.needsFollowUp &&
      evaluation.followUpQuestion
    ) {
      nextQuestion =
        evaluation.followUpQuestion;

      questionType =
        "follow_up";
    }

    if (!nextQuestion) {
      nextQuestion =
        await generateNextQuestion({
          targetRole:
            session.targetRole,

          difficulty:
            session.difficulty,

          previousQuestion:
            currentQuestion.question,

          previousAnswer:
            cleanAnswer,

          evaluation,

          previousQuestions,

          profile:
            user.profile,
        });
    }

    session.questions.push({
      question:
        nextQuestion,
    });

    await session.save();

    return {
      completed: false,

      evaluation,

      nextQuestion,

      questionType,

      questionsAnswered:
        session.questions.filter(
          (question) =>
            question.answer
        ).length,

      questionsRemaining:
        null,
    };
  };

/*
 * IMPORTANT LIVE INTERVIEW PATH
 *
 * This endpoint intentionally performs
 * ONLY validation + MongoDB persistence.
 *
 * It does NOT:
 * - evaluate the answer
 * - generate a follow-up question
 * - generate another question
 *
 * Gemini Live is responsible for continuing
 * the live conversation. This keeps Stop Answer
 * fast and prevents a second AI generation
 * pipeline from blocking the UI.
 */
export const recordLiveInterviewTurn =
  async ({
    userId,
    sessionId,
    question,
    answer,
  }) => {
    const session =
      await InterviewSession.findOne({
        _id: sessionId,
        user: userId,
      });

    if (!session) {
      const error =
        new Error(
          "Interview session not found."
        );

      error.statusCode = 404;

      throw error;
    }

    if (
      session.status !==
      "active"
    ) {
      const error =
        new Error(
          "Interview session is not active."
        );

      error.statusCode = 400;

      throw error;
    }

    const cleanQuestion =
      String(
        question || ""
      ).trim();

    const cleanAnswer =
      String(
        answer || ""
      ).trim();

    if (!cleanQuestion) {
      const error =
        new Error(
          "Interview question is required."
        );

      error.statusCode = 400;

      throw error;
    }

    if (!cleanAnswer) {
      const error =
        new Error(
          "Answer transcript cannot be empty."
        );

      error.statusCode = 400;

      throw error;
    }

    const currentQuestion =
      session.questions[
        session.questions.length - 1
      ];

    if (!currentQuestion) {
      const error =
        new Error(
          "No active interview question."
        );

      error.statusCode = 400;

      throw error;
    }

    if (currentQuestion.answer) {
      const error =
        new Error(
          "This interview answer has already been recorded."
        );

      error.statusCode = 409;

      throw error;
    }

    /*
     * First Live turn:
     * replace the temporary marker
     * with the actual AI question.
     */
    if (
      currentQuestion.question ===
      LIVE_PENDING_QUESTION
    ) {
      currentQuestion.question =
        cleanQuestion;
    } else if (
      currentQuestion.question !==
      cleanQuestion
    ) {
      const error =
        new Error(
          "Interview question does not match the active session turn."
        );

      error.statusCode = 409;

      throw error;
    }

    currentQuestion.answer =
      cleanAnswer;

    /*
     * Do NOT evaluate the answer here.
     *
     * The live interview must stay fast.
     *
     * Evaluation happens when the user
     * explicitly clicks End Interview.
     */
    await session.save();

    const answeredQuestionCount =
      session.questions.filter(
        (item) =>
          item.answer &&
          String(
            item.answer
          ).trim()
      ).length;

    return {
      completed: false,

      questionsAnswered:
        answeredQuestionCount,

      questionsRemaining:
        null,
    };
  };

export const endInterviewSession =
  async ({
    userId,
    sessionId,
  }) => {
    const session =
      await InterviewSession.findOne({
        _id: sessionId,
        user: userId,
      });

    if (!session) {
      const error =
        new Error(
          "Interview session not found."
        );

      error.statusCode = 404;

      throw error;
    }

    if (
      session.status ===
      "completed"
    ) {
      return {
        sessionId:
          session._id,

        status:
          session.status,

        overallScore:
          session.overallScore,

        feedback:
          session.feedback,

        questionsAnswered:
          session.questions.filter(
            (question) =>
              question.answer &&
              String(
                question.answer
              ).trim()
          ).length,

        completedAt:
          session.completedAt,
      };
    }

    if (
      session.status !==
      "active"
    ) {
      const error =
        new Error(
          "Interview session cannot be ended."
        );

      error.statusCode = 400;

      throw error;
    }

    /*
     * Only answered questions are
     * included in the final report.
     */
    const answeredQuestions =
      session.questions.filter(
        (question) =>
          question.answer &&
          String(
            question.answer
          ).trim()
      );

    if (
      !answeredQuestions.length
    ) {
      const error =
        new Error(
          "Please answer at least one question before ending the interview."
        );

      error.statusCode = 400;

      throw error;
    }

    return completeInterviewSession(
      session
    );
  };