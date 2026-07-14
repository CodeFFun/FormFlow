export enum NotificationType {
  GENERIC = "generic",
  ORG_INVITATION = "org_invitation",
  FORM_PUBLISHED = "form_published",
  NEW_SUBMISSION = "new_submission",
  COMMENT_ADDED = "comment_added",
}

export interface NotificationData {
  orgId?: string;
  formId?: string;
  submissionId?: string;
  commentId?: string;
  url?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: Date;
  data?: NotificationData;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type?: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
}

export interface NotificationListResult {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
}
