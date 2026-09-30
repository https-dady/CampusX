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

const MAX_QUESTIONS = 10;

const calculateOverallScore = (questions) => {
  const scores = questions
    .filter(
      (question) =>
        question.answer &&
        Number.isFinite(Number(question.score))
    )
    .map((question) => Number(question.score));

  if (!scores.length) {
    return 0;
  }

  const total = scores.reduce(
    (sum, score) => sum + score,
    0
  );

  return Math.round(total / scores.length);
};

const completeInterviewSession = async (session) => {
  const answeredQuestions = session.questions.filter(
    (question) => question.answer
  );

  if (!answeredQuestions.length) {
    const error = new Error(
      "At least one answered question is required."
    );

    error.statusCode = 400;

    throw error;
  }

  const overallScore = calculateOverallScore(
    answeredQuestions
  );

  const feedback = await generateFinalFeedback({
    targetRole: session.targetRole,
    difficulty: session.difficulty,
    questions: answeredQuestions,
  });

  session.overallScore = overallScore;
  session.feedback = feedback;
  session.status = "completed";
  session.completedAt = new Date();

  await session.save();

  return {
    sessionId: session._id,
    status: session.status,
    overallScore: session.overallScore,
    feedback: session.feedback,
    completedAt: session.completedAt,
  };
};

export const createInterviewSession = async ({
  userId,
  targetRole,
  difficulty = "medium",
}) => {
  const user = await User.findById(userId).select(
    "profile"
  );

  if (!user) {
    const error = new Error("User not found.");

    error.statusCode = 404;

    throw error;
  }

  const question = await generateFirstQuestion({
    targetRole,
    difficulty,
    profile: user.profile,
  });

  const session = await InterviewSession.create({
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

export const submitInterviewAnswer = async ({
  userId,
  sessionId,
  answer,
}) => {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    const error = new Error(
      "Interview session not found."
    );

    error.statusCode = 404;

    throw error;
  }

  if (session.status !== "active") {
    const error = new Error(
      "Interview session is not active."
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    !answer ||
    typeof answer !== "string" ||
    !answer.trim()
  ) {
    const error = new Error(
      "Answer cannot be empty."
    );

    error.statusCode = 400;

    throw error;
  }

  const currentQuestion =
    session.questions[session.questions.length - 1];

  if (!currentQuestion) {
    const error = new Error(
      "No active interview question."
    );

    error.statusCode = 400;

    throw error;
  }

  const cleanAnswer = answer.trim();

  currentQuestion.answer = cleanAnswer;

  const evaluation = await evaluateAnswer({
    targetRole: session.targetRole,
    difficulty: session.difficulty,
    question: currentQuestion.question,
    answer: cleanAnswer,
  });

  currentQuestion.evaluation = evaluation;
  currentQuestion.score = evaluation.score;

  const answeredQuestionCount =
    session.questions.filter(
      (question) => question.answer
    ).length;

  if (answeredQuestionCount >= MAX_QUESTIONS) {
    const finalResult =
      await completeInterviewSession(session);

    return {
      completed: true,
      evaluation,
      finalResult,
    };
  }

  const user = await User.findById(userId).select(
    "profile"
  );

  if (!user) {
    const error = new Error("User not found.");

    error.statusCode = 404;

    throw error;
  }

  const previousQuestions = session.questions.map(
    (question) => question.question
  );

  let nextQuestion = "";
  let questionType = "next";

  if (
    evaluation.needsFollowUp &&
    evaluation.followUpQuestion
  ) {
    nextQuestion = evaluation.followUpQuestion;
    questionType = "follow_up";
  }

  if (!nextQuestion) {
    nextQuestion = await generateNextQuestion({
      targetRole: session.targetRole,
      difficulty: session.difficulty,
      previousQuestion: currentQuestion.question,
      previousAnswer: cleanAnswer,
      evaluation,
      previousQuestions,
      profile: user.profile,
    });

    questionType = "next";
  }

  session.questions.push({
    question: nextQuestion,
  });

  await session.save();

  return {
    completed: false,
    evaluation,
    nextQuestion,
    questionType,
    questionsAnswered:
      answeredQuestionCount,
    questionsRemaining:
      MAX_QUESTIONS - answeredQuestionCount,
  };
};

export const endInterviewSession = async ({
  userId,
  sessionId,
}) => {
  const session = await InterviewSession.findOne({
    _id: sessionId,
    user: userId,
  });

  if (!session) {
    const error = new Error(
      "Interview session not found."
    );

    error.statusCode = 404;

    throw error;
  }

  if (session.status === "completed") {
    return {
      sessionId: session._id,
      status: session.status,
      overallScore: session.overallScore,
      feedback: session.feedback,
      completedAt: session.completedAt,
    };
  }

  if (session.status !== "active") {
    const error = new Error(
      "Interview session cannot be ended."
    );

    error.statusCode = 400;

    throw error;
  }

  return completeInterviewSession(session);
};