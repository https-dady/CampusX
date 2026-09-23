import { z } from "zod";

const normalizeText = (value) => {
  return value.trim().replace(/\s+/g, " ");
};

const textSchema = (fieldName, max) =>
  z
    .string()
    .trim()
    .min(1, `${fieldName} is required`)
    .max(max, `${fieldName} is too long`)
    .transform(normalizeText);

export const jobSearchSchema = z
  .object({
    targetRole: textSchema("Target role", 150),

    location: textSchema("Location", 100).optional(),

    experienceLevel: textSchema(
      "Experience level",
      50
    ).optional(),

    employmentType: textSchema(
      "Employment type",
      50
    ).optional(),
  })
  .strict();