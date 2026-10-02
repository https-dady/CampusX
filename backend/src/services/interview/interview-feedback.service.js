import { generateAIText } from "../ai/ai.service.js";

const extractJSON = (text) => {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error(
      "Invalid AI final feedback response."
    );
  }

  try {
    return JSON.parse(
      cleaned.slice(start, end + 1)
    );
  } catch {
    throw new Error(
      "Unable to parse AI final feedback."
    );
  }
};

const clampScore = (value) => {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.min(100, Math.max(0, score));
};

const average = (values) => {
  const numericValues = values
    .map(Number)
    .filter(Number.isFinite);

  if (!numericValues.length) {
    return 0;
  }

  const total = numericValues.reduce(
    (sum, value) => sum + value,
    0
  );

  return Math.round(
    total / numericValues.length
  );
};

const normalizeFeedback = (
  feedback,
  interviewData
) => {
  const questionResults =
    interviewData.map((item) => ({
      questionNumber:
        item.questionNumber,
      score: clampScore(item.score),
      feedback:
        String(
          item.evaluation?.feedback ||
            "No question-specific feedback was available."
        ).trim(),
    }));

  const overallScore = average(
    interviewData.map(
      (item) => item.score
    )
  );

  const technicalScore = average(
    interviewData.map(
      (item) =>
        item.evaluation?.technicalAccuracy
    )
  );

  const communicationScore = average(
    interviewData.map(
      (item) =>
        item.evaluation?.communication
    )
  );

  const relevanceScore = average(
    interviewData.map(
      (item) => item.evaluation?.relevance
    )
  );

  const completenessScore = average(
    interviewData.map(
      (item) =>
        item.evaluation?.completeness
    )
  );

  return {
    overallScore,
    technicalScore,
    communicationScore,
    relevanceScore,
    completenessScore,
    summary: String(
      feedback.summary || ""
    ).trim(),
    strengths: Array.isArray(
      feedback.strengths
    )
      ? feedback.strengths
          .map((item) =>
            String(item).trim()
          )
          .filter(Boolean)
      : [],
    weaknesses: Array.isArray(
      feedback.weaknesses
    )
      ? feedback.weaknesses
          .map((item) =>
            String(item).trim()
          )
          .filter(Boolean)
      : [],
    recommendations: Array.isArray(
      feedback.recommendations
    )
      ? feedback.recommendations
          .map((item) =>
            String(item).trim()
          )
          .filter(Boolean)
      : [],
    questionResults,
  };
};

export const generateFinalFeedback = async ({
  targetRole,
  difficulty,
  questions,
}) => {
  const interviewData = questions
    .filter(
      (item) =>
        item.answer &&
        String(item.answer).trim()
    )
    .map((item, index) => ({
      questionNumber: index + 1,
      question: item.question,
      answer: item.answer,
      score: item.score,
      evaluation: item.evaluation,
    }));

  if (!interviewData.length) {
    throw new Error(
      "No answered questions are available for final feedback."
    );
  }

  const prompt = `
You are an expert technical interviewer.

Target role: ${targetRole}
Interview difficulty: ${difficulty}

Below is the complete interview performance.

${JSON.stringify(
    interviewData,
    null,
    2
  )}

Generate a concise but useful final interview report.

Return ONLY valid JSON using exactly this structure:

{
  "summary": "overall performance summary",
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "weaknesses": [
    "weakness 1",
    "weakness 2"
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ]
}

Rules:
- Base the feedback only on the candidate's actual answers and evaluations.
- Do not invent skills that were not demonstrated.
- Focus on actionable feedback.
- Keep each point concise.
- Do not calculate or invent numeric scores.
- Do not include markdown.
- Do not include anything outside the JSON object.
`;

  const result =
    await generateAIText(prompt);

  const qualitativeFeedback =
    extractJSON(result);

  return normalizeFeedback(
    qualitativeFeedback,
    interviewData
  );
};
