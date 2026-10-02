import { z } from "zod";

export const upsertLearningPreferenceSchema = z
  .object({
    preferredLanguage: z
      .string()
      .trim()
      .toLowerCase()
      .refine(
        (value) => ["english", "hindi"].includes(value),
        {
          message: "preferredLanguage must be either english or hindi",
        }
      ),
  })
  .strict();