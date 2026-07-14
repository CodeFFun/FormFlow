import { z } from "zod";

const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.string()),
]);

const answerSchema = z.object({
  questionId: z.string().min(1),
  value: answerValueSchema,
});

export const createSubmissionSchema = z.object({
  formId: z.string().min(1),
  answers: z.array(answerSchema),
  respondent: z
    .object({
      email: z.email().optional(),
      name: z.string().min(1).max(200).optional(),
    })
    .optional(),
});
export type CreateSubmissionDto = z.infer<typeof createSubmissionSchema>;

export const listSubmissionsQuerySchema = z.object({
  formId: z.string().min(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListSubmissionsQueryDto = z.infer<typeof listSubmissionsQuerySchema>;

export const submissionStatsQuerySchema = z.object({
  formId: z.string().min(1),
});

export const submissionIdParamSchema = z.object({
  submissionId: z.string().min(1),
});

export const uploadFileBodySchema = z.object({
  formId: z.string().min(1),
  questionId: z.string().min(1),
});
export type UploadFileBodyDto = z.infer<typeof uploadFileBodySchema>;

export interface RegisterUploadInput {
  formId: string;
  questionId: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
}
