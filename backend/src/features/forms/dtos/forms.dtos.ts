import { z } from "zod";
import {
  FormAudienceType,
  FormStatus,
  LogicAction,
  LogicOperator,
  QuestionType,
} from "../types/forms.types";

export const MAX_QUESTIONS = 200;

const optionSchema = z.object({
  id: z.string().min(1).optional(),
  label: z.string().min(1).max(500),
  value: z.string().max(500).optional(),
});

const logicSchema = z.object({
  id: z.string().min(1).optional(),
  action: z.nativeEnum(LogicAction),
  operator: z.nativeEnum(LogicOperator),
  sourceQuestionId: z.string().min(1),
  value: z.string().max(500).optional(),
  targetQuestionId: z.string().min(1).optional(),
});

const questionSchema = z.object({
  id: z.string().min(1).optional(),
  type: z.nativeEnum(QuestionType),
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  required: z.boolean().optional(),
  position: z.number().int().nonnegative().optional(),
  options: z.array(optionSchema).max(200).optional(),
  logic: z.array(logicSchema).max(50).optional(),
});

const settingsSchema = z.object({
  allowMultipleSubmissions: z.boolean().optional(),
  requireLogin: z.boolean().optional(),
  showProgressBar: z.boolean().optional(),
  confirmationMessage: z.string().max(2000).optional(),
  closeAt: z.coerce.date().optional(),
  maxResponses: z.number().int().positive().optional(),
});

const audienceSchema = z
  .object({
    type: z.nativeEnum(FormAudienceType),
    groupIds: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (a) => a.type !== FormAudienceType.GROUPS || (a.groupIds?.length ?? 0) > 0,
    { message: "groupIds must contain at least one group when audience type is 'groups'" }
  );

export const createFormSchema = z.object({
  orgId: z.string().min(1),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  questions: z.array(questionSchema).max(MAX_QUESTIONS).optional(),
  settings: settingsSchema.optional(),
  audience: audienceSchema.optional(),
});
export type CreateFormDto = z.infer<typeof createFormSchema>;

export const updateFormSchema = z
  .object({
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(5000).optional(),
    questions: z.array(questionSchema).max(MAX_QUESTIONS).optional(),
    settings: settingsSchema.optional(),
    audience: audienceSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateFormDto = z.infer<typeof updateFormSchema>;

export const listFormsQuerySchema = z.object({
  orgId: z.string().min(1),
  status: z.nativeEnum(FormStatus).optional(),
});

export const addCommentSchema = z.object({
  body: z.string().min(1).max(5000),
  questionId: z.string().min(1).optional(),
});
export type AddCommentDto = z.infer<typeof addCommentSchema>;

export const formIdParamSchema = z.object({
  formId: z.string().min(1),
});

export const versionParamSchema = z.object({
  formId: z.string().min(1),
  version: z.coerce.number().int().positive(),
});

export const commentParamSchema = z.object({
  formId: z.string().min(1),
  commentId: z.string().min(1),
});

export type QuestionInput = z.infer<typeof questionSchema>;
