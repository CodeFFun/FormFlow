import { Schema, model, Model, HydratedDocument } from "mongoose";
import { randomUUID } from "crypto";
import { NotificationData, NotificationType } from "../types/notifications.types";

export interface NotificationDocument {
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

const NOTIFICATION_TTL_SECONDS = 90 * 24 * 60 * 60;

const dataSchema = new Schema<NotificationData>(
  {
    orgId: { type: String },
    formId: { type: String },
    submissionId: { type: String },
    commentId: { type: String },
    url: { type: String },
  },
  { _id: false }
);

const notificationSchema = new Schema<NotificationDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.GENERIC,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    data: { type: dataSchema },
  },
  { timestamps: true, versionKey: false }
);

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: NOTIFICATION_TTL_SECONDS });

export type NotificationHydrated = HydratedDocument<NotificationDocument>;

export const NotificationModel: Model<NotificationDocument> = model<NotificationDocument>(
  "Notification",
  notificationSchema,
  "notifications"
);
