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

const skillSchema = z
  .string()
  .trim()
  .min(1, "Skill cannot be empty")
  .max(100, "Skill is too long");

export const careerRequirementSchema = z
  .object({
    career: textSchema(
      "Career",
      150
    ),

    domain: textSchema(
      "Domain",
      100
    ),

    requiredSkills: z
      .array(skillSchema)
      .min(
        1,
        "At least one required skill is needed"
      )
      .max(
        100,
        "Too many required skills"
      )
      .transform(normalizeList),

    isActive: z
      .boolean()
      .optional(),
  })
  .strict();

export const updateCareerRequirementSchema =
  careerRequirementSchema
    .partial()
    .refine(
      (data) =>
        Object.keys(data).length > 0,
      {
        message:
          "At least one career requirement field is required",
      }
    );