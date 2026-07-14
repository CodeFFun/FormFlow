import { ForbiddenError, NotFoundError } from "../../../errors/http-error";
import * as notificationRepo from "../repository/notification.repository";
import {
  CreateNotificationInput,
  Notification,
  NotificationListResult,
  NotificationType,
} from "../types/notifications.types";

export const createNotification = async (
  input: CreateNotificationInput
): Promise<Notification> => {
  return notificationRepo.createNotification({
    userId: input.userId,
    type: input.type ?? NotificationType.GENERIC,
    title: input.title,
    message: input.message,
    data: input.data,
  });
};

export const notifyUsers = async (
  userIds: string[],
  payload: Omit<CreateNotificationInput, "userId">
): Promise<number> => {
  const unique = Array.from(new Set(userIds));
  return notificationRepo.createManyNotifications(
    unique.map((userId) => ({
      userId,
      type: payload.type ?? NotificationType.GENERIC,
      title: payload.title,
      message: payload.message,
      data: payload.data,
    }))
  );
};

export const notifyNewSubmission = async (
  userIds: string[],
  info: { formId: string; formTitle: string; submissionId: string }
): Promise<number> => {
  try {
    return await notifyUsers(userIds, {
      type: NotificationType.NEW_SUBMISSION,
      title: "New response",
      message: `A new response was submitted to "${info.formTitle}".`,
      data: { formId: info.formId, submissionId: info.submissionId },
    });
  } catch (err) {
    console.error("Failed to send new-submission notifications:", err);
    return 0;
  }
};

export const notifyCommentAdded = async (
  userIds: string[],
  info: { formId: string; formTitle: string; commentId: string }
): Promise<number> => {
  try {
    return await notifyUsers(userIds, {
      type: NotificationType.COMMENT_ADDED,
      title: "New comment",
      message: `A new comment was added on "${info.formTitle}".`,
      data: { formId: info.formId, commentId: info.commentId },
    });
  } catch (err) {
    console.error("Failed to send comment notifications:", err);
    return 0;
  }
};

export const notifyFormPublished = async (
  userIds: string[],
  info: { formId: string; formTitle: string }
): Promise<number> => {
  try {
    return await notifyUsers(userIds, {
      type: NotificationType.FORM_PUBLISHED,
      title: "Form published",
      message: `"${info.formTitle}" is now available to fill out.`,
      data: { formId: info.formId },
    });
  } catch (err) {
    console.error("Failed to send form-published notifications:", err);
    return 0;
  }
};

export const listNotifications = async (
  userId: string,
  page: number,
  limit: number,
  unreadOnly: boolean
): Promise<NotificationListResult> => {
  const [items, total] = await Promise.all([
    notificationRepo.listNotificationsByUser(userId, {
      skip: (page - 1) * limit,
      limit,
      unreadOnly,
    }),
    notificationRepo.countNotificationsByUser(userId, unreadOnly),
  ]);
  return { items, total, page, limit };
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  return notificationRepo.countNotificationsByUser(userId, true);
};

const getOwnedNotification = async (
  userId: string,
  notificationId: string
): Promise<Notification> => {
  const notification = await notificationRepo.findNotificationById(notificationId);
  if (!notification) {
    throw new NotFoundError("Notification not found");
  }
  if (notification.userId !== userId) {
    throw new ForbiddenError("You do not have access to this notification");
  }
  return notification;
};

export const markAsRead = async (
  userId: string,
  notificationId: string
): Promise<Notification> => {
  await getOwnedNotification(userId, notificationId);
  const updated = await notificationRepo.markNotificationRead(notificationId);
  if (!updated) {
    throw new NotFoundError("Notification not found");
  }
  return updated;
};

export const markAllAsRead = async (
  userId: string
): Promise<{ updated: number }> => {
  const updated = await notificationRepo.markAllNotificationsRead(userId);
  return { updated };
};

export const deleteNotification = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  await getOwnedNotification(userId, notificationId);
  await notificationRepo.deleteNotification(notificationId);
};
