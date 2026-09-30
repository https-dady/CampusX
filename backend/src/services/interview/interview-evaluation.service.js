import { generateAIText } from "../ai/ai.service.js";

const extractJSON = (text) => {
  const cleaned = String(text || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Invalid AI evaluation response.");
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    throw new Error("Unable to parse AI evaluation response.");
  }
};

const normalizeEvaluation = (evaluation) => {
  const clampScore = (value) => {
    const score = Number(value);

    if (!Number.isFinite(score)) {
      return 0;
    }

    return Math.min(100, Math.max(0, score));
  };

  return {
    score: clampScore(evaluation.score),
    technicalAccuracy: clampScore(evaluation.technicalAccuracy),
    relevance: clampScore(evaluation.relevance),
    completeness: clampScore(evaluation.completeness),
    communication: clampScore(evaluation.communication),
    feedback: String(evaluation.feedback || "").trim(),
    needsFollowUp: evaluation.needsFollowUp === true,
    followUpQuestion: String(
      evaluation.followUpQuestion || ""
    ).trim(),
  };
};

export const evaluateAnswer = async ({
  targetRole,
  difficulty,
  question,
  answer,
}) => {
  const prompt = `
You are an expert technical interviewer.

Target role: ${targetRole}
Interview difficulty: ${difficulty}

Interview question:
${question}

Candidate answer:
${answer}

Evaluate the candidate's answer based on:
- Technical accuracy
- Relevance
- Completeness
- Communication clarity

Then decide whether a follow-up question is necessary.

Return ONLY valid JSON using exactly this structure:

{
  "score": 0,
  "technicalAccuracy": 0,
  "relevance": 0,
  "completeness": 0,
  "communication": 0,
  "feedback": "short useful feedback",
  "needsFollowUp": false,
  "followUpQuestion": ""
}

Rules:
- Every score must be between 0 and 100.
- score represents the overall answer score.
- needsFollowUp must be true only when clarification or deeper probing is useful.
- If needsFollowUp is false, followUpQuestion must be an empty string.
- If needsFollowUp is true, provide exactly ONE follow-up question.
- Do not include markdown.
- Do not include anything outside the JSON object.
`;

  const result = await generateAIText(prompt);

  const evaluation = extractJSON(result);

  return normalizeEvaluation(evaluation);
};