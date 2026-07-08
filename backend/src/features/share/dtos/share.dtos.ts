import { z } from "zod";
import { ShareLinkType } from "../types/share.types";

export const createShareLinkSchema = z
  .object({
    formId: z.string().min(1),
    type: z.nativeEnum(ShareLinkType),
    email: z.email().optional(),
    expiresAt: z.coerce.date().optional(),
    maxUses: z.number().int().min(1).optional(),
  })
  .refine(
    (data) => data.type !== ShareLinkType.INDIVIDUAL_INVITE || !!data.email,
    { message: "email is required for an individual invite", path: ["email"] }
  );
export type CreateShareLinkDto = z.infer<typeof createShareLinkSchema>;

export const listShareLinksQuerySchema = z.object({
  formId: z.string().min(1),
});

export const linkIdParamSchema = z.object({
  linkId: z.string().min(1),
});

export const tokenParamSchema = z.object({
  token: z.string().min(1),
});

const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
]);

export const publicSubmitSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().min(1),
      value: answerValueSchema,
    })
  ),
  respondent: z
    .object({
      email: z.email().optional(),
      name: z.string().min(1).max(200).optional(),
    })
    .optional(),
});
export type PublicSubmitDto = z.infer<typeof publicSubmitSchema>;
