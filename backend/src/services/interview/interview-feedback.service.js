import { generateAIText } from "../ai/ai.service.js";

const extractJSON = (text) => {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Invalid AI final feedback response.");
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error("Unable to parse AI final feedback.");
  }
};

const normalizeFeedback = (feedback) => ({
  summary: String(feedback.summary || "").trim(),

  strengths: Array.isArray(feedback.strengths)
    ? feedback.strengths
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [],

  weaknesses: Array.isArray(feedback.weaknesses)
    ? feedback.weaknesses
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [],

  recommendations: Array.isArray(feedback.recommendations)
    ? feedback.recommendations
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [],
});

export const generateFinalFeedback = async ({
  targetRole,
  difficulty,
  questions,
}) => {
  const interviewData = questions
    .filter((item) => item.answer)
    .map((item, index) => ({
      questionNumber: index + 1,
      question: item.question,
      answer: item.answer,
      score: item.score,
      evaluation: item.evaluation,
    }));

  const prompt = `
You are an expert technical interviewer.

Target role: ${targetRole}
Interview difficulty: ${difficulty}

Below is the complete interview performance:

${JSON.stringify(interviewData, null, 2)}

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
- Do not include markdown.
- Do not include anything outside the JSON object.
`;

  const result = await generateAIText(prompt);

  return normalizeFeedback(extractJSON(result));
};