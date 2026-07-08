import {
  ForbiddenError,
  NotFoundError,
} from "../../../errors/http-error";
import * as organizationService from "../../organization/services/organization.service";
import * as notificationService from "../../notifications/services/notification.service";
import * as formRepo from "../repository/form.repository";
import * as commentRepo from "../repository/comment.repository";
import { CommentDocument } from "../models/comment.model";
import { Comment, CommentStatus } from "../types/forms.types";
import { AddCommentDto } from "../dtos/forms.dtos";
import { FormDocument } from "../models/form.model";

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
    throw new ForbiddenError("You do not have permission to review this form");
  }
};

export const addComment = async (
  userId: string,
  formId: string,
  dto: AddCommentDto
): Promise<Comment> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);

  if (dto.questionId) {
    const exists = form.questions.some((q) => q.id === dto.questionId);
    if (!exists) {
      throw new NotFoundError("Referenced question not found in this form");
    }
  }

  const comment = await commentRepo.createComment({
    formId,
    authorId: userId,
    body: dto.body,
    questionId: dto.questionId,
  });

  const managerIds = (await organizationService.getManagerUserIds(form.orgId)).filter(
    (id) => id !== userId
  );
  await notificationService.notifyCommentAdded(managerIds, {
    formId: form._id,
    formTitle: form.title,
    commentId: comment._id,
  });

  return comment;
};

export const listComments = async (
  userId: string,
  formId: string
): Promise<Comment[]> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);
  return commentRepo.listCommentsByForm(formId);
};

const loadEditableComment = async (
  userId: string,
  formId: string,
  commentId: string
): Promise<{ comment: CommentDocument; form: FormDocument }> => {
  const form = await getFormOrThrow(formId);
  await assertCanManage(form, userId);

  const comment = await commentRepo.findCommentById(commentId);
  if (!comment || comment.formId !== formId) {
    throw new NotFoundError("Comment not found");
  }
  return { comment, form };
};

export const resolveComment = async (
  userId: string,
  formId: string,
  commentId: string
): Promise<Comment> => {
  await loadEditableComment(userId, formId, commentId);
  const updated = await commentRepo.updateCommentStatus(
    commentId,
    CommentStatus.RESOLVED
  );
  if (!updated) {
    throw new NotFoundError("Comment not found");
  }
  return updated;
};

export const deleteComment = async (
  userId: string,
  formId: string,
  commentId: string
): Promise<void> => {
  await loadEditableComment(userId, formId, commentId);
  await commentRepo.deleteComment(commentId);
};
