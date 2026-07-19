"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Inbox } from "lucide-react";
import { forms as formService, submissions as submissionService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useOrg } from "@/components/providers/OrgProvider";
import { FormTabNav } from "@/components/responses/FormTabNav";
import { ResponsesStatsRow } from "@/components/responses/ResponsesStatsRow";
import { ResponsesTable } from "@/components/responses/ResponsesTable";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { Submission } from "@/types/submission";

const PAGE_SIZE = 20;

export default function ResponsesPage() {
  const { formId } = useParams<{ formId: string }>();
  const { isManager, loading: orgLoading } = useOrg();
  const { success, error: toastError } = useToast();
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Submission | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: form } = useSWR(["form", formId], () => formService.get(formId));
  const { data: stats } = useSWR(["stats", formId], () =>
    submissionService.stats(formId),
  );
  const {
    data: page1,
    isLoading,
    mutate,
  } = useSWR(["submissions", formId, page], () =>
    submissionService.list(formId, page, PAGE_SIZE),
  );

  if (!orgLoading && !isManager) {
    return (
      <EmptyState
        icon={Inbox}
        title="Managers only"
        description="You don't have permission to view responses for this form."
      />
    );
  }

  const submissions = page1?.items ?? [];
  const total = stats?.total ?? page1?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil((page1?.total ?? 0) / PAGE_SIZE));

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await submissionService.remove(toDelete._id);
      success("Response deleted");
      setToDelete(null);
      void mutate();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <FormTabNav formId={formId} title={form?.title} />

      <div className="space-y-6">
        <ResponsesStatsRow
          total={total}
          submissions={submissions}
          maxResponses={form?.settings?.maxResponses}
        />

        {isLoading ? (
          <LoadingState label="Loading responses…" />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No responses yet"
            description="Share your form to start collecting responses."
          />
        ) : (
          <>
            {form && (
              <ResponsesTable
                form={form}
                submissions={submissions}
                onDelete={setToDelete}
              />
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete response?"
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
        <p className="text-sm text-ink-500">
          This response and its uploaded files will be permanently removed.
        </p>
      </Modal>
    </div>
  );
}
