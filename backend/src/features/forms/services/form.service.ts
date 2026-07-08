import { randomUUID } from "crypto";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../../../errors/http-error";
import * as organizationService from "../../organization/services/organization.service";
import * as notificationService from "../../notifications/services/notification.service";
import * as formRepo from "../repository/form.repository";
import * as historyRepo from "../repository/formHistory.repository";
import * as commentRepo from "../repository/comment.repository";
import { FormDocument } from "../models/form.model";
import {
  Form,
  FormAudience,
  FormAudienceType,
  FormHistoryEntry,
  FormStatus,
  Question,
} from "../types/forms.types";
import {
  CreateFormDto,
  MAX_QUESTIONS,
  QuestionInput,
  UpdateFormDto,
} from "../dtos/forms.dtos";

const normalizeQuestions = (questions: QuestionInput[]): Question[] => {
  return questions.map((q, index) => ({
    id: q.id ?? randomUUID(),
    type: q.type,
    title: q.title,
    description: q.description,
    required: q.required ?? false,
    position: q.position ?? index,
    options: (q.options ?? []).map((o) => ({
      id: o.id ?? randomUUID(),
      label: o.label,
      value: o.value,
    })),
    logic: (q.logic ?? []).map((l) => ({
      id: l.id ?? randomUUID(),
      action: l.action,
      operator: l.operator,
      sourceQuestionId: l.sourceQuestionId,
      value: l.value,
      targetQuestionId: l.targetQuestionId,
    })),
  }));
};

const snapshotForm = async (form: FormDocument, changedBy: string): Promise<void> => {
  const nextVersion = (await historyRepo.findLatestVersion(form._id)) + 1;
  await historyRepo.createHistoryEntry({
    formId: form._id,
    version: nextVersion,
    snapshot: form,
    changedBy,
  });
};

const getFormOrThrow = async (formId: string): Promise<FormDocument> => {
  const form = await formRepo.findFormById(formId);
  if (!form) {
    throw new NotFoundError("Form not found");
  }
  return form;
};

const assertCanManage = async (form: FormDocument, userId: string): Promise<void> => {
  const canManage = await organizationService.canManageForms(userId, form.orgId);
  if (!canManage) {
    throw new ForbiddenError("You do not have permission to manage this form");
  }
};

const isInAudience = async (
  form: FormDocument,
  userId: string
): Promise<boolean> => {
  if (form.audience.type === FormAudienceType.ORGANIZATION) {
    return true;
  }
  const userGroupIds = await organizationService.getUserGroupIds(userId, form.orgId);
  return form.audience.groupIds.some((id) => userGroupIds.includes(id));
};

const resolveAudience = async (
  orgId: string,
  audience: CreateFormDto["audience"]
): Promise<FormAudience> => {
  if (!audience || audience.type === FormAudienceType.ORGANIZATION) {
    return { type: FormAudienceType.ORGANIZATION, groupIds: [] };
  }
  const groupIds = Array.from(new Set(audience.groupIds ?? []));
  await organizationService.assertGroupsExist(orgId, groupIds);
  return { type: FormAudienceType.GROUPS, groupIds };
};

export const createForm = async (
  userId: string,
  dto: CreateFormDto
): Promise<Form> => {
  const canManage = await organizationService.canManageForms(userId, dto.orgId);
  if (!canManage) {
    throw new ForbiddenError("You do not have permission to create forms");
  }

  const questions = normalizeQuestions(dto.questions ?? []);
  if (questions.length > MAX_QUESTIONS) {
    throw new BadRequestError(
      `A form cannot exceed ${MAX_QUESTIONS} questions. Split the questions into a separate collection before adding more.`
    );
  }

  const audience = await resolveAudience(dto.orgId, dto.audience);

  const form = await formRepo.createForm({
    orgId: dto.orgId,
    title: dto.title,
    description: dto.description,
    questions,
    settings: dto.settings,
    audience,
    createdBy: userId,
  });

  await snapshotForm(form, userId);
  return form;
};

export const listForms = async (
  userId: string,
  orgId: string,
  status?: FormStatus
): Promise<Form[]> => {
  const canManage = await organizationService.canManageForms(userId, orgId);
  const forms = await formRepo.findFormsByOrg(orgId, status);
  if (canManage) {
    return forms;
  }

  const userGroupIds = await organizationService.getUserGroupIds(userId, orgId);
  return forms.filter(
    (f) =>
      f.status === FormStatus.PUBLISHED &&
      (f.audience.type === FormAudienceType.ORGANIZATION ||
        f.audience.groupIds.some((id) => userGroupIds.includes(id)))
  );
};

export const getForm = async (userId: string, formId: string): Promise<Form> => {
  const form = await getFormOrThrow(formId);
  const canManage = await organizationService.canManageForms(userId, form.orgId);
  if (canManage) {
    return form;
  }

  if (form.status !== FormStatus.PUBLISHED) {
    throw new ForbiddenError("This form is not available");
  }
  const allowed = await isInAudience(form, userId);
  if (!allowed) {
    throw new ForbiddenError("You do not have access to this form");
  }
  return form;
};

export const getRespondableForm = async (
  userId: string,
  formId: string
): Promise<Form> => {
  const form = await getForm(userId, formId);
  if (form.status !== FormStatus.PUBLISHED) {
    throw new ForbiddenError("This form is not accepting responses");
  }
  return form;
};

export const getManageableForm = async (
  userId: string,
  formId: string
): Promise<Form> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);
  return form;
};

export const getPublishedForm = async (formId: string): Promise<Form> => {
  const form = await getFormOrThrow(formId);
  if (form.status !== FormStatus.PUBLISHED) {
    throw new ForbiddenError("This form is not accepting responses");
  }
  return form;
};

export const updateForm = async (
  userId: string,
  formId: string,
  dto: UpdateFormDto
): Promise<Form> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);

  const update: Partial<
    Pick<FormDocument, "title" | "description" | "questions" | "settings" | "audience">
  > = {};
  if (dto.title !== undefined) update.title = dto.title;
  if (dto.description !== undefined) update.description = dto.description;
  if (dto.settings !== undefined) {
    update.settings = { ...form.settings, ...dto.settings };
  }
  if (dto.audience !== undefined) {
    update.audience = await resolveAudience(form.orgId, dto.audience);
  }
  if (dto.questions !== undefined) {
    const questions = normalizeQuestions(dto.questions);
    if (questions.length > MAX_QUESTIONS) {
      throw new BadRequestError(
        `A form cannot exceed ${MAX_QUESTIONS} questions. Split the questions into a separate collection before adding more.`
      );
    }
    update.questions = questions;
  }

  const updated = await formRepo.updateForm(formId, update);
  if (!updated) {
    throw new NotFoundError("Form not found");
  }
  await snapshotForm(updated, userId);
  return updated;
};

export const deleteForm = async (userId: string, formId: string): Promise<void> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);
  await formRepo.deleteForm(formId);
  await historyRepo.deleteHistoryByForm(formId);
  await commentRepo.deleteCommentsByForm(formId);
};

const resolveAudienceUserIds = async (form: Form): Promise<string[]> => {
  return form.audience.type === FormAudienceType.ORGANIZATION
    ? organizationService.getMemberUserIds(form.orgId)
    : organizationService.getGroupMemberUserIds(
        form.orgId,
        form.audience.groupIds
      );
};

const notifyAudienceOfForm = async (
  form: Form,
  excludeUserId: string
): Promise<number> => {
  const audienceUserIds = await resolveAudienceUserIds(form);
  return notificationService.notifyFormPublished(
    audienceUserIds.filter((id) => id !== excludeUserId),
    { formId: form._id, formTitle: form.title }
  );
};

export const publishForm = async (userId: string, formId: string): Promise<Form> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);

  if (form.status === FormStatus.PUBLISHED) {
    throw new BadRequestError("Form is already published");
  }
  if (form.status === FormStatus.ARCHIVED) {
    throw new BadRequestError("Archived forms cannot be published");
  }
  if (form.questions.length === 0) {
    throw new BadRequestError("A form must have at least one question to be published");
  }

  const updated = await formRepo.updateForm(formId, { status: FormStatus.PUBLISHED });
  if (!updated) {
    throw new NotFoundError("Form not found");
  }
  await snapshotForm(updated, userId);

  await notifyAudienceOfForm(updated, userId);

  return updated;
};

export const shareWithAudience = async (
  userId: string,
  formId: string
): Promise<{ notified: number; audienceType: FormAudienceType; recipients: number }> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);

  if (form.status !== FormStatus.PUBLISHED) {
    throw new BadRequestError("Only published forms can be shared with members");
  }

  const audienceUserIds = await resolveAudienceUserIds(form);
  const recipients = audienceUserIds.filter((id) => id !== userId);
  const notified = await notifyAudienceOfForm(form, userId);
  return { notified, audienceType: form.audience.type, recipients: recipients.length };
};

export const closeForm = async (userId: string, formId: string): Promise<Form> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);

  if (form.status !== FormStatus.PUBLISHED) {
    throw new BadRequestError("Only published forms can be closed");
  }

  const updated = await formRepo.updateForm(formId, { status: FormStatus.CLOSED });
  if (!updated) {
    throw new NotFoundError("Form not found");
  }
  await snapshotForm(updated, userId);
  return updated;
};

export const listHistory = async (
  userId: string,
  formId: string
): Promise<FormHistoryEntry[]> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);
  return historyRepo.listHistoryByForm(formId);
};

export const restoreVersion = async (
  userId: string,
  formId: string,
  version: number
): Promise<Form> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);

  const entry = await historyRepo.findByFormAndVersion(formId, version);
  if (!entry) {
    throw new NotFoundError(`Version ${version} not found for this form`);
  }

  const { snapshot } = entry;
  const updated = await formRepo.updateForm(formId, {
    title: snapshot.title,
    description: snapshot.description,
    questions: snapshot.questions,
    settings: snapshot.settings,
    audience: snapshot.audience,
  });
  if (!updated) {
    throw new NotFoundError("Form not found");
  }
  await snapshotForm(updated, userId);
  return updated;
};
