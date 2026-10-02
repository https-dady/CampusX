import { z } from "zod";

const SUPPORTED_SOURCE_TYPES = [
  "government",
  "official_documentation",
  "courses",
];

export const createLearningPreferenceSchema = z
  .object({
    language: z
      .string()
      .trim()
      .min(1, "Language is required.")
      .max(50, "Language must not exceed 50 characters."),

    preferredSources: z
      .array(
        z.enum(SUPPORTED_SOURCE_TYPES, {
          errorMap: () => ({
            message: "Invalid learning resource source.",
          }),
        })
      )
      .min(1, "At least one preferred source is required.")
      .max(
        SUPPORTED_SOURCE_TYPES.length,
        "Too many preferred sources selected."
      ),
  })
  .strict()
  .superRefine((data, ctx) => {
    const uniqueSources = new Set(data.preferredSources);

    if (
      uniqueSources.size !==
      data.preferredSources.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["preferredSources"],
        message:
          "Preferred sources must not contain duplicates.",
      });
    }
  });

export const updateLearningPreferenceSchema =
  createLearningPreferenceSchema;