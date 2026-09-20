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

const urlSchema = z
  .string()
  .trim()
  .url("Please enter a valid resource URL")
  .max(500, "Resource URL is too long");

const skillSchema = z
  .string()
  .trim()
  .min(1, "Skill cannot be empty")
  .max(100, "Skill is too long");

const resourceSchema = z
  .object({
    title: textSchema("Resource title", 200),

    url: urlSchema,

    type: textSchema("Resource type", 50),
  })
  .strict();

const roadmapStepSchema = z
  .object({
    title: textSchema("Step title", 150),

    description: z
      .string()
      .trim()
      .max(1000, "Step description is too long")
      .transform(normalizeText)
      .optional(),

    skills: z
      .array(skillSchema)
      .max(50, "Too many skills in a roadmap step")
      .transform(normalizeList)
      .optional(),

    resources: z
      .array(resourceSchema)
      .max(20, "Too many resources in a roadmap step")
      .optional(),

    order: z
      .number()
      .int("Step order must be a whole number")
      .min(1, "Step order must be at least 1"),
  })
  .strict();

export const careerRoadmapSchema = z
  .object({
    career: textSchema("Career", 150),

    domain: textSchema("Domain", 100),

    steps: z
      .array(roadmapStepSchema)
      .min(1, "At least one roadmap step is required")
      .max(100, "Too many roadmap steps"),

    isActive: z.boolean().optional(),
  })
  .strict();

export const updateCareerRoadmapSchema =
  careerRoadmapSchema
    .partial()
    .refine(
      (data) => Object.keys(data).length > 0,
      {
        message:
          "At least one roadmap field is required",
      }
    );