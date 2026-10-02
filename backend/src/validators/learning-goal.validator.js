import { z } from "zod";

const normalizeText = (value) => {
  return value
    .trim()
    .replace(/\s+/g, " ");
};

const normalizeList = (values) => {
  const normalized =
    values.map(normalizeText);

  const seen = new Set();

  return normalized.filter((value) => {
    const key =
      value.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

export const createLearningGoalSchema =
  z
    .object({
      domain: z
        .string()
        .trim()
        .min(
          1,
          "Learning domain is required."
        )
        .max(
          100,
          "Learning domain is too long."
        )
        .transform(normalizeText),

      targetSkills: z
        .array(
          z
            .string()
            .trim()
            .min(
              1,
              "Learning skill cannot be empty."
            )
            .max(
              100,
              "Learning skill is too long."
            )
        )
        .min(
          1,
          "At least one learning skill is required."
        )
        .max(
          50,
          "Too many learning skills."
        )
        .transform(normalizeList),
    })
    .strict();