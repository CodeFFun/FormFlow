"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { forms as formService, submissions as submissionService } from "@/lib/services";
import { FormTabNav } from "@/components/responses/FormTabNav";
import { AnalyticsMetrics } from "@/components/responses/AnalyticsMetrics";
import { LoadingState } from "@/components/ui/Spinner";

export default function AnalyticsPage() {
  const { formId } = useParams<{ formId: string }>();
  const { data: form } = useSWR(["form", formId], () => formService.get(formId));
  const { data: stats, isLoading } = useSWR(["stats", formId], () =>
    submissionService.stats(formId),
  );

  return (
    <div>
      <FormTabNav formId={formId} title={form?.title} />
      {isLoading ? (
        <LoadingState label="Loading analytics…" />
      ) : (
        <AnalyticsMetrics total={stats?.total ?? 0} />
      )}
    </div>
  );
}
