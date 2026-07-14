import { NotificationModel, NotificationDocument } from "../models/notification.model";

export const createNotification = async (
  data: Pick<NotificationDocument, "userId" | "type" | "title" | "message"> &
    Partial<Pick<NotificationDocument, "data">>
): Promise<NotificationDocument> => {
  return NotificationModel.create(data);
};

export const createManyNotifications = async (
  docs: Array<
    Pick<NotificationDocument, "userId" | "type" | "title" | "message"> &
      Partial<Pick<NotificationDocument, "data">>
  >
): Promise<number> => {
  if (docs.length === 0) return 0;
  const created = await NotificationModel.insertMany(docs);
  return created.length;
};

export const findNotificationById = async (
  id: string
): Promise<NotificationDocument | null> => {
  return NotificationModel.findById(id).lean<NotificationDocument>().exec();
};

export const listNotificationsByUser = async (
  userId: string,
  opts: { skip: number; limit: number; unreadOnly: boolean }
): Promise<NotificationDocument[]> => {
  const filter: Record<string, unknown> = { userId };
  if (opts.unreadOnly) filter.read = false;
  return NotificationModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(opts.skip)
    .limit(opts.limit)
    .lean<NotificationDocument[]>()
    .exec();
};

export const countNotificationsByUser = async (
  userId: string,
  unreadOnly: boolean
): Promise<number> => {
  const filter: Record<string, unknown> = { userId };
  if (unreadOnly) filter.read = false;
  return NotificationModel.countDocuments(filter).exec();
};

export const markNotificationRead = async (
  id: string
): Promise<NotificationDocument | null> => {
  return NotificationModel.findByIdAndUpdate(
    id,
    { read: true, readAt: new Date() },
    { new: true }
  )
    .lean<NotificationDocument>()
    .exec();
};

export const markAllNotificationsRead = async (userId: string): Promise<number> => {
  const result = await NotificationModel.updateMany(
    { userId, read: false },
    { read: true, readAt: new Date() }
  ).exec();
  return result.modifiedCount;
};

export const deleteNotification = async (
  id: string
): Promise<NotificationDocument | null> => {
  return NotificationModel.findByIdAndDelete(id).lean<NotificationDocument>().exec();
};
