"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, FileX2 } from "lucide-react";
import { forms as formService, submissions as submissionService } from "@/lib/services";
import { ResponseMeta } from "@/components/responses/ResponseMeta";
import { ResponseAnswerGrid } from "@/components/responses/ResponseAnswerGrid";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ResponseDetailPage() {
  const { formId, submissionId } = useParams<{
    formId: string;
    submissionId: string;
  }>();

  const { data: form } = useSWR(["form", formId], () => formService.get(formId));
  const {
    data: submission,
    isLoading,
    error,
  } = useSWR(["submission", submissionId], () =>
    submissionService.get(submissionId),
  );
  const { data: files } = useSWR(["submission-files", submissionId], () =>
    submissionService.files(submissionId).catch(() => []),
  );

  return (
    <div>
      <Link
        href={`/forms/${formId}/responses`}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to responses
      </Link>

      {isLoading ? (
        <LoadingState label="Loading response…" />
      ) : error || !submission || !form ? (
        <EmptyState icon={FileX2} title="Response not found" />
      ) : (
        <div className="space-y-5">
          <h1 className="font-serif text-2xl text-ink-900">{form.title}</h1>
          <ResponseMeta submission={submission} />
          <ResponseAnswerGrid
            form={form}
            submission={submission}
            files={files ?? []}
          />
        </div>
      )}
    </div>
  );
}
