import { z } from "zod";

const objectIdSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{24}$/, "Invalid ID");

export const communityIdParamSchema = z
  .object({
    communityId: objectIdSchema,
  })
  .strict();

export const messageIdParamSchema = z
  .object({
    communityId: objectIdSchema,
    messageId: objectIdSchema,
  })
  .strict();

export const messageListQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int("Limit must be a whole number")
      .min(1, "Limit must be at least 1")
      .max(50, "Limit cannot be greater than 50")
      .default(30),

    before: objectIdSchema.optional(),
  })
  .strict();

export const sendMessageSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, "Message cannot be empty")
      .max(5000, "Message is too long"),

    replyTo: objectIdSchema.nullable().optional(),
  })
  .strict();