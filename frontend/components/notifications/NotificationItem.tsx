"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  Mail,
  Send,
  Inbox,
  MessageSquare,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import type { AppNotification, NotificationType } from "@/types/notification";

const icons: Record<NotificationType, LucideIcon> = {
  generic: Bell,
  org_invitation: Mail,
  form_published: Send,
  new_submission: Inbox,
  comment_added: MessageSquare,
};

const tints: Record<NotificationType, string> = {
  generic: "bg-ink-100 text-ink-500",
  org_invitation: "bg-indigo-50 text-indigo-600",
  form_published: "bg-teal-50 text-teal-600",
  new_submission: "bg-amber-50 text-amber-600",
  comment_added: "bg-coral-50 text-coral-600",
};

export interface NotificationItemProps {
  notification: AppNotification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function NotificationItem({
  notification,
  onRead,
  onDismiss,
}: NotificationItemProps) {
  const router = useRouter();
  const Icon = icons[notification.type] ?? Bell;

  function handleClick() {
    if (!notification.read) onRead(notification._id);
    const url = notification.data?.url;
    if (url) router.push(url);
    else if (notification.data?.formId) {
      router.push(`/forms/${notification.data.formId}/responses`);
    }
  }

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border px-4 py-4 transition-colors",
        notification.read
          ? "border-ink-100 bg-white"
          : "border-indigo-200 bg-indigo-50/40",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          tints[notification.type] ?? tints.generic,
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <button type="button" onClick={handleClick} className="flex-1 text-left">
        <p className="text-sm font-medium text-ink-900">{notification.title}</p>
        <p className="mt-0.5 text-sm text-ink-500">{notification.message}</p>
        <p className="mt-1 text-xs text-ink-300">
          {timeAgo(notification.createdAt)}
        </p>
      </button>
      <div className="flex items-center gap-2">
        {!notification.read && (
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
        )}
        <button
          type="button"
          onClick={() => onDismiss(notification._id)}
          className="rounded-md p-1 text-ink-300 transition-colors hover:bg-ink-100 hover:text-ink-900"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
