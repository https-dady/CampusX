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

const technologySchema = z
  .string()
  .trim()
  .min(1, "Technology cannot be empty")
  .max(100, "Technology name is too long");

const stepSchema = z
  .object({
    title: textSchema("Step title", 150),

    description: z
      .string()
      .trim()
      .max(1000, "Step description is too long")
      .transform(normalizeText)
      .optional(),

    technologies: z
      .array(technologySchema)
      .max(20, "Too many technologies")
      .transform(normalizeList)
      .optional(),

    order: z
      .coerce
      .number()
      .int("Step order must be a whole number")
      .min(1, "Step order must be at least 1"),
  })
  .strict();

export const createLearningRoadmapSchema = z
  .object({
    domain: textSchema("Domain", 100),

    techStack: z
      .array(technologySchema)
      .min(1, "At least one technology is required")
      .max(20, "Too many technologies")
      .transform(normalizeList),

    steps: z
      .array(stepSchema)
      .min(1, "At least one roadmap step is required")
      .max(100, "Too many roadmap steps"),
    
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateLearningRoadmapSchema =
  createLearningRoadmapSchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message: "At least one roadmap field is required",
      }
    );