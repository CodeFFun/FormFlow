"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useEffect } from "react";
import { forms as formService } from "@/lib/services";
import { useOrg } from "@/components/providers/OrgProvider";
import { BuilderClient } from "@/components/builder/BuilderClient";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileX2 } from "lucide-react";

export default function FormBuilderPage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;
  const router = useRouter();
  const { isManager, loading: orgLoading } = useOrg();

  const { data, isLoading, error } = useSWR(
    formId ? ["form", formId] : null,
    () => formService.get(formId),
  );

  useEffect(() => {
    if (!orgLoading && !isManager) {
      router.replace(`/forms/${formId}/fill`);
    }
  }, [orgLoading, isManager, formId, router]);

  if (isLoading || orgLoading) return <LoadingState label="Loading form…" />;

  if (error || !data) {
    return (
      <EmptyState
        icon={FileX2}
        title="Form not found"
        description="This form may have been deleted or you don't have access."
      />
    );
  }

  return <BuilderClient initialForm={data} />;
}
