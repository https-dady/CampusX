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

export const learningRequestSchema = z
  .object({
    domain: textSchema("Domain", 100),

    techStack: z
      .array(technologySchema)
      .min(1, "At least one technology is required")
      .max(20, "Too many technologies")
      .transform(normalizeList),
  })
  .strict();