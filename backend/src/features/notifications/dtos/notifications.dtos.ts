import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});
export type ListNotificationsQueryDto = z.infer<typeof listNotificationsQuerySchema>;

export const notificationIdParamSchema = z.object({
  notificationId: z.string().min(1),
});
