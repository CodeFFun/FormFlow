"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Lock, FileX2 } from "lucide-react";
import { forms as formService, submissions as submissionService } from "@/lib/services";
import { useOrg } from "@/components/providers/OrgProvider";
import { FillForm } from "@/components/fill/FillForm";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Answer, Respondent } from "@/types/submission";

export default function AuthFillPage() {
  const { formId } = useParams<{ formId: string }>();
  const { currentOrg } = useOrg();
  const { data, isLoading, error } = useSWR(["form-fill", formId], () =>
    formService.get(formId),
  );

  if (isLoading) return <LoadingState label="Loading form…" />;

  if (error || !data) {
    return (
      <EmptyState
        icon={FileX2}
        title="Form not available"
        description="This form may not be published or you may not be in its audience."
      />
    );
  }

  if (data.status !== "published") {
    return (
      <EmptyState
        icon={Lock}
        title="Not accepting responses"
        description="This form isn't published, or it has been closed."
      />
    );
  }

  async function submit(answers: Answer[], respondent?: Respondent) {
    await submissionService.create({ formId, answers, respondent });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to forms
      </Link>
      <FillForm
        form={data}
        orgName={currentOrg?.name}
        logoUrl={currentOrg?.branding?.logoUrl}
        allowFileUpload
        onSubmit={submit}
      />
    </div>
  );
}
