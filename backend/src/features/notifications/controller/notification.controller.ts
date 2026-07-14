import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as notificationService from "../services/notification.service";

const requireUserId = (req: Request): string => req.userId as string;

const param = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const listNotifications: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const unreadOnly = String(req.query.unreadOnly) === "true";
  const result = await notificationService.listNotifications(
    requireUserId(req),
    page,
    limit,
    unreadOnly
  );
  res.status(200).json({ success: true, ...result });
});

export const getUnreadCount: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.getUnreadCount(requireUserId(req));
  res.status(200).json({ success: true, data: { count } });
});

export const markAllAsRead: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.markAllAsRead(requireUserId(req));
  res.status(200).json({ success: true, data: result });
});

export const markAsRead: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(
    requireUserId(req),
    param(req, "notificationId")
  );
  res.status(200).json({ success: true, data: notification });
});

export const deleteNotification: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.deleteNotification(
    requireUserId(req),
    param(req, "notificationId")
  );
  res.status(200).json({ success: true, message: "Notification deleted" });
});
