"use client";

import { useState } from "react";
import useSWR from "swr";
import { FilePlus2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/components/providers/OrgProvider";
import { forms as formService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { FormCard } from "@/components/dashboard/FormCard";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { TemplateStrip } from "@/components/dashboard/TemplateStrip";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { FormDoc, FormStatus } from "@/types/form";

const filters: { key: FormStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "published", label: "Published" },
  { key: "closed", label: "Closed" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { currentOrg, isManager } = useOrg();
  const { success, error: toastError } = useToast();
  const [filter, setFilter] = useState<FormStatus | "all">("all");
  const [toDelete, setToDelete] = useState<FormDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  const orgId = currentOrg?._id;
  const { data, isLoading, mutate } = useSWR(
    orgId ? ["forms", orgId] : null,
    () => formService.list(orgId as string),
  );

  const all = data ?? [];
  const visible = filter === "all" ? all : all.filter((f) => f.status === filter);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await formService.remove(toDelete._id);
      success("Form deleted");
      setToDelete(null);
      void mutate();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not delete form.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink-900">
            {isManager ? "Your forms" : "Forms for you"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {isManager
              ? "Create, manage, and track your team's forms."
              : "Forms shared with you to fill out."}
          </p>
        </div>
        {isManager && (
          <Button onClick={() => router.push("/forms/new")}>
            <FilePlus2 className="h-4 w-4" /> New form
          </Button>
        )}
      </div>

      {isManager && (
        <>
          <TemplateStrip />
          <StatsBar forms={all} />
        </>
      )}

      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={
              filter === f.key
                ? "rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white"
                : "rounded-full px-4 py-1.5 text-sm font-medium text-ink-500 hover:bg-ink-100"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingState label="Loading forms…" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={all.length === 0 ? "No forms yet" : "Nothing here"}
          description={
            isManager
              ? "Create your first form to start collecting responses."
              : "No forms have been shared with you yet."
          }
          action={
            isManager ? (
              <Button onClick={() => router.push("/forms/new")}>
                <FilePlus2 className="h-4 w-4" /> Create a form
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((form) => (
            <FormCard
              key={form._id}
              form={form}
              isManager={isManager}
              onDelete={isManager ? setToDelete : undefined}
            />
          ))}
        </div>
      )}

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete form?"
        description={`"${toDelete?.title || "Untitled form"}" and all its responses will be permanently removed.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
