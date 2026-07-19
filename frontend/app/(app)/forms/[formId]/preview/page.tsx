"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import { forms as formService } from "@/lib/services";
import { PreviewCard } from "@/components/builder/PreviewCard";
import { DeviceToggle, type Device } from "@/components/builder/DeviceToggle";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileX2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FormPreviewPage() {
  const { formId } = useParams<{ formId: string }>();
  const [device, setDevice] = useState<Device>("desktop");
  const { data, isLoading, error } = useSWR(["form", formId], () =>
    formService.get(formId),
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href={`/forms/${formId}`}
          className="flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to builder
        </Link>
        <DeviceToggle device={device} onChange={setDevice} />
      </div>

      {isLoading ? (
        <LoadingState label="Loading preview…" />
      ) : error || !data ? (
        <EmptyState icon={FileX2} title="Form not found" />
      ) : (
        <div
          className={cn(
            "mx-auto transition-all",
            device === "mobile" ? "max-w-sm" : "max-w-2xl",
          )}
        >
          <PreviewCard form={data} />
        </div>
      )}
    </div>
  );
}
