"use client";

import { useState } from "react";
import useSWR, { mutate as swrMutate } from "swr";
import { BellOff, CheckCheck } from "lucide-react";
import { notifications as notifService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";

export default function NotificationsPage() {
  const { error: toastError } = useToast();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data, isLoading, mutate } = useSWR(
    ["notifications", unreadOnly],
    () => notifService.list(1, 50, unreadOnly),
  );
  const items = data?.items ?? [];

  async function markRead(id: string) {
    try {
      await notifService.markRead(id);
      void mutate();
      void globalMutateUnread();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not update.");
    }
  }

  async function dismiss(id: string) {
    try {
      await notifService.remove(id);
      void mutate();
      void globalMutateUnread();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not dismiss.");
    }
  }

  async function markAll() {
    try {
      await notifService.markAllRead();
      void mutate();
      void globalMutateUnread();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not update.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">Notifications</h1>
          <p className="mt-1 text-sm text-ink-500">
            Activity from your forms and organizations.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAll}>
          <CheckCheck className="h-4 w-4" /> Mark all read
        </Button>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={
            !unreadOnly
              ? "rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white"
              : "rounded-full px-4 py-1.5 text-sm font-medium text-ink-500 hover:bg-ink-100"
          }
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={
            unreadOnly
              ? "rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white"
              : "rounded-full px-4 py-1.5 text-sm font-medium text-ink-500 hover:bg-ink-100"
          }
        >
          Unread
        </button>
      </div>

      {isLoading ? (
        <LoadingState label="Loading notifications…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="You're all caught up"
          description="New activity will show up here."
        />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onRead={markRead}
              onDismiss={dismiss}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function globalMutateUnread() {
  return swrMutate("/notifications/unread-count");
}
