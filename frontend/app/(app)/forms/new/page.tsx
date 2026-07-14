"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/components/providers/OrgProvider";
import { forms as formService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { LoadingState } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

export default function NewFormPage() {
  const router = useRouter();
  const { currentOrg, isManager, loading } = useOrg();
  const { error: toastError } = useToast();
  const created = useRef(false);

  useEffect(() => {
    if (loading || created.current) return;
    if (!currentOrg) return;
    if (!isManager) {
      router.replace("/dashboard");
      return;
    }
    created.current = true;
    formService
      .create({
        orgId: currentOrg._id,
        title: "Untitled form",
        questions: [],
        audience: { type: "organization" },
      })
      .then((form) => router.replace(`/forms/${form._id}`))
      .catch((err) => {
        toastError(
          err instanceof ApiError ? err.message : "Could not create form.",
        );
        router.replace("/dashboard");
      });
  }, [loading, currentOrg, isManager, router, toastError]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingState label="Creating your form…" />
    </div>
  );
}
