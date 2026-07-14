import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import * as notificationController from "../controller/notification.controller";
import {
  listNotificationsQuerySchema,
  notificationIdParamSchema,
} from "../dtos/notifications.dtos";

const router: ExpressRouter = Router();

router.use(authenticate);

router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/read-all", notificationController.markAllAsRead);

router.get(
  "/",
  validate({ query: listNotificationsQuerySchema }),
  notificationController.listNotifications
);

router.patch(
  "/:notificationId/read",
  validate({ params: notificationIdParamSchema }),
  notificationController.markAsRead
);
router.delete(
  "/:notificationId",
  validate({ params: notificationIdParamSchema }),
  notificationController.deleteNotification
);

export default router;
