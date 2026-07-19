export type NotificationType =
  | "generic"
  | "org_invitation"
  | "form_published"
  | "new_submission"
  | "comment_added";

export interface NotificationData {
  orgId?: string;
  formId?: string;
  submissionId?: string;
  commentId?: string;
  url?: string;
}

export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  data?: NotificationData;
  createdAt: string;
  updatedAt: string;
}
