import { z } from "zod";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../../errors/http-error";
import * as organizationService from "../../organization/services/organization.service";
import * as formService from "../../forms/services/form.service";
import * as notificationService from "../../notifications/services/notification.service";
import { Form, Question, QuestionType } from "../../forms/types/forms.types";
import * as subRepo from "../repository/submission.repository";
import * as uploadedFileRepo from "../repository/uploadedFile.repository";
import {
  AnswerValue,
  Respondent,
  Submission,
  SubmissionAnswer,
  SubmissionListResult,
  SubmissionStats,
  UploadedFile,
} from "../types/submissions.types";
import { CreateSubmissionDto } from "../dtos/submissions.dtos";

const isEmptyValue = (value: AnswerValue | undefined): boolean => {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const optionTokens = (question: Question): Set<string> => {
  const tokens = new Set<string>();
  for (const option of question.options) {
    tokens.add(option.id);
    if (option.value) tokens.add(option.value);
  }
  return tokens;
};

const validateAnswerValue = (
  question: Question,
  value: AnswerValue,
  fileIdsToLink: string[]
): AnswerValue => {
  switch (question.type) {
    case QuestionType.SHORT_TEXT:
    case QuestionType.LONG_TEXT: {
      if (typeof value !== "string") {
        throw new BadRequestError(`Answer to "${question.title}" must be text`);
      }
      return value;
    }
    case QuestionType.EMAIL: {
      if (typeof value !== "string" || !z.email().safeParse(value).success) {
        throw new BadRequestError(`Answer to "${question.title}" must be a valid email`);
      }
      return value;
    }
    case QuestionType.NUMBER:
    case QuestionType.RATING: {
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new BadRequestError(`Answer to "${question.title}" must be a number`);
      }
      return value;
    }
    case QuestionType.DATE: {
      if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
        throw new BadRequestError(`Answer to "${question.title}" must be a valid date`);
      }
      return value;
    }
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.DROPDOWN: {
      if (typeof value !== "string") {
        throw new BadRequestError(`Answer to "${question.title}" must be a single choice`);
      }
      if (!optionTokens(question).has(value)) {
        throw new BadRequestError(`Answer to "${question.title}" is not a valid option`);
      }
      return value;
    }
    case QuestionType.CHECKBOX: {
      if (!Array.isArray(value)) {
        throw new BadRequestError(`Answer to "${question.title}" must be a list of choices`);
      }
      const tokens = optionTokens(question);
      for (const item of value) {
        if (!tokens.has(item)) {
          throw new BadRequestError(`Answer to "${question.title}" contains an invalid option`);
        }
      }
      return value;
    }
    case QuestionType.FILE_UPLOAD: {
      const ids = Array.isArray(value)
        ? value
        : typeof value === "string"
          ? [value]
          : null;
      if (!ids) {
        throw new BadRequestError(`Answer to "${question.title}" must reference uploaded files`);
      }
      fileIdsToLink.push(...ids);
      return ids;
    }
    default:
      throw new BadRequestError(`Unsupported question type for "${question.title}"`);
  }
};

const validateUploadedFiles = async (
  fileIds: string[],
  formId: string,
  userId: string
): Promise<void> => {
  const unique = Array.from(new Set(fileIds));
  const files = await uploadedFileRepo.findUploadedFilesByIds(unique);
  if (files.length !== unique.length) {
    throw new BadRequestError("One or more referenced uploaded files were not found");
  }
  for (const file of files) {
    if (file.formId !== formId) {
      throw new BadRequestError("An uploaded file does not belong to this form");
    }
    if (file.uploaderId !== userId) {
      throw new ForbiddenError("You can only attach files you uploaded");
    }
    if (file.submissionId) {
      throw new BadRequestError("An uploaded file is already attached to a submission");
    }
  }
};

const buildAnswers = async (
  form: Form,
  rawAnswers: ReadonlyArray<{ questionId: string; value: AnswerValue }>,
  userId: string,
  opts: { allowFiles?: boolean } = {}
): Promise<{ answers: SubmissionAnswer[]; fileIdsToLink: string[] }> => {
  const allowFiles = opts.allowFiles ?? true;
  const questionsById = new Map(form.questions.map((q) => [q.id, q]));
  const provided = new Map<string, AnswerValue>();
  for (const answer of rawAnswers) {
    if (!questionsById.has(answer.questionId)) {
      throw new BadRequestError(`Unknown question id: ${answer.questionId}`);
    }
    if (provided.has(answer.questionId)) {
      throw new BadRequestError(`Duplicate answer for question ${answer.questionId}`);
    }
    provided.set(answer.questionId, answer.value);
  }

  const answers: SubmissionAnswer[] = [];
  const fileIdsToLink: string[] = [];
  for (const question of form.questions) {
    const value = provided.get(question.id);
    if (isEmptyValue(value)) {
      if (question.required) {
        throw new BadRequestError(`Question "${question.title}" is required`);
      }
      continue;
    }
    if (question.type === QuestionType.FILE_UPLOAD && !allowFiles) {
      throw new BadRequestError("File uploads are not supported for this submission channel");
    }
    const normalized = validateAnswerValue(question, value as AnswerValue, fileIdsToLink);
    answers.push({ questionId: question.id, value: normalized });
  }

  if (fileIdsToLink.length > 0) {
    await validateUploadedFiles(fileIdsToLink, form._id, userId);
  }
  return { answers, fileIdsToLink };
};

const assertAcceptingResponses = async (form: Form): Promise<void> => {
  if (
    form.settings.closeAt &&
    new Date(form.settings.closeAt).getTime() < Date.now()
  ) {
    throw new ForbiddenError("This form is closed for responses");
  }
  if (typeof form.settings.maxResponses === "number") {
    const count = await subRepo.countSubmissionsByForm(form._id);
    if (count >= form.settings.maxResponses) {
      throw new ForbiddenError("This form has reached its maximum number of responses");
    }
  }
};

export const createSubmission = async (
  userId: string,
  dto: CreateSubmissionDto
): Promise<Submission> => {
  const form = await formService.getRespondableForm(userId, dto.formId);

  await assertAcceptingResponses(form);

  if (!form.settings.allowMultipleSubmissions) {
    const existing = await subRepo.findSubmissionByFormAndUser(form._id, userId);
    if (existing) {
      throw new ConflictError("You have already submitted a response to this form");
    }
  }

  const { answers, fileIdsToLink } = await buildAnswers(form, dto.answers, userId);

  const respondent: Respondent = { userId };
  if (dto.respondent?.email) respondent.email = dto.respondent.email;
  if (dto.respondent?.name) respondent.name = dto.respondent.name;

  const submission = await subRepo.createSubmission({
    formId: form._id,
    orgId: form.orgId,
    answers,
    respondent,
    submittedAt: new Date(),
  });

  if (fileIdsToLink.length > 0) {
    await uploadedFileRepo.linkFilesToSubmission(fileIdsToLink, submission._id);
  }

  const managerIds = (await organizationService.getManagerUserIds(form.orgId)).filter(
    (id) => id !== userId
  );
  await notificationService.notifyNewSubmission(managerIds, {
    formId: form._id,
    formTitle: form.title,
    submissionId: submission._id,
  });

  return submission;
};

export const createPublicSubmission = async (
  form: Form,
  respondent: Respondent,
  rawAnswers: ReadonlyArray<{ questionId: string; value: AnswerValue }>
): Promise<Submission> => {
  await assertAcceptingResponses(form);

  const { answers } = await buildAnswers(
    form,
    rawAnswers,
    respondent.userId ?? "",
    { allowFiles: false }
  );

  const submission = await subRepo.createSubmission({
    formId: form._id,
    orgId: form.orgId,
    answers,
    respondent,
    submittedAt: new Date(),
  });

  const managerIds = await organizationService.getManagerUserIds(form.orgId);
  await notificationService.notifyNewSubmission(managerIds, {
    formId: form._id,
    formTitle: form.title,
    submissionId: submission._id,
  });

  return submission;
};

export const listSubmissions = async (
  userId: string,
  formId: string,
  page: number,
  limit: number
): Promise<SubmissionListResult> => {
  await formService.getManageableForm(userId, formId);

  const [items, total] = await Promise.all([
    subRepo.findSubmissionsByForm(formId, { skip: (page - 1) * limit, limit }),
    subRepo.countSubmissionsByForm(formId),
  ]);
  return { items, total, page, limit };
};

export const getSubmission = async (
  userId: string,
  submissionId: string
): Promise<Submission> => {
  const submission = await subRepo.findSubmissionById(submissionId);
  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  const canManage = await organizationService.canManageForms(userId, submission.orgId);
  if (!canManage && submission.respondent.userId !== userId) {
    throw new ForbiddenError("You do not have access to this submission");
  }
  return submission;
};

export const deleteSubmission = async (
  userId: string,
  submissionId: string
): Promise<void> => {
  const submission = await subRepo.findSubmissionById(submissionId);
  if (!submission) {
    throw new NotFoundError("Submission not found");
  }

  const canManage = await organizationService.canManageForms(userId, submission.orgId);
  if (!canManage) {
    throw new ForbiddenError("You do not have permission to delete this submission");
  }

  await subRepo.deleteSubmission(submissionId);
  await uploadedFileRepo.deleteUploadedFilesBySubmission(submissionId);
};

export const getSubmissionStats = async (
  userId: string,
  formId: string
): Promise<SubmissionStats> => {
  await formService.getManageableForm(userId, formId);
  const total = await subRepo.countSubmissionsByForm(formId);
  return { formId, total };
};

export const listSubmissionFiles = async (
  userId: string,
  submissionId: string
): Promise<UploadedFile[]> => {
  await getSubmission(userId, submissionId);
  return uploadedFileRepo.findUploadedFilesBySubmission(submissionId);
};
