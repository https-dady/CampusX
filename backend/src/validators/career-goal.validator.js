import { z } from "zod";

const normalizeText = (value) => {
  return value.trim().replace(/\s+/g, " ");
};

const normalizeList = (values) => {
  const normalized = values.map(normalizeText);

  const seen = new Set();

  return normalized.filter((value) => {
    const key = value.toLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const textSchema = (fieldName, max) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .max(max, `${fieldName} is too long`)
    .transform(normalizeText);

export const careerGoalSchema = z
  .object({
    targetCareer: textSchema(
      "Target career",
      150
    ),

    targetDomain: textSchema(
      "Target domain",
      100
    ),

    targetLevel: textSchema(
      "Target level",
      50
    ),

    targetTimeline: z
  .string()
  .trim()
  .min(1, "Target timeline cannot be empty")
  .max(
    50,
    "Target timeline is too long"
  )
  .transform(normalizeText)
  .optional(),

    additionalGoals: z
      .array(
        z
          .string()
          .trim()
          .min(
            1,
            "Additional goal cannot be empty"
          )
          .max(
            200,
            "Additional goal is too long"
          )
      )
      .max(
        20,
        "Too many additional goals"
      )
      .transform(normalizeList)
      .optional(),
  })
  .strict();

export const updateCareerGoalSchema =
  careerGoalSchema.partial().refine(
    (data) =>
      Object.keys(data).length > 0,
    {
      message:
        "At least one career goal field is required",
    }
  );