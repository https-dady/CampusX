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

const jobSchema = z
  .object({
    title: textSchema("Job title", 200),

    company: textSchema("Company", 150),

    location: textSchema("Location", 150).optional(),

    employmentType: textSchema(
      "Employment type",
      100
    ).optional(),

    experienceLevel: textSchema(
      "Experience level",
      100
    ).optional(),

    description: z
      .string()
      .trim()
      .max(5000, "Job description is too long")
      .transform(normalizeText)
      .optional(),

    skills: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Skill cannot be empty")
          .max(100, "Skill name is too long")
      )
      .max(50, "Too many skills")
      .optional(),

    salary: z
      .string()
      .trim()
      .max(150, "Salary information is too long")
      .transform(normalizeText)
      .optional(),

    url: z
      .string()
      .trim()
      .url("Job URL must be valid")
      .max(1000, "Job URL is too long"),

    source: textSchema("Job source", 100),
  })
  .strict();

export const jobSearchResponseSchema = z
  .object({
    success: z.boolean(),

    jobs: z
      .array(jobSchema)
      .max(100, "Too many jobs returned"),

    total: z.number().int().min(0),

    hasMore: z.boolean().optional(),

    cacheKey: z
      .string()
      .trim()
      .min(1, "Cache key cannot be empty")
      .max(200, "Cache key is too long")
      .optional(),
  })
  .strict();