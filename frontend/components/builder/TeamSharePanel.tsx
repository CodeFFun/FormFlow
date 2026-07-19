"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Send, Users } from "lucide-react";
import { forms as formService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useOrg } from "@/components/providers/OrgProvider";
import { AudienceSelector } from "./AudienceSelector";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import type { FormAudience } from "@/types/form";

export interface TeamSharePanelProps {
  formId: string;
}

export function TeamSharePanel({ formId }: TeamSharePanelProps) {
  const { currentOrg, isManager } = useOrg();
  const { success, error: toastError } = useToast();
  const groups = currentOrg?.groups ?? [];

  const { data: form, isLoading } = useSWR(["form", formId], () =>
    formService.get(formId),
  );

  const [audience, setAudience] = useState<FormAudience>({ type: "organization" });
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (form?.audience) setAudience(form.audience);
  }, [form]);

  if (isLoading || !form) return <LoadingState label="Loading audience…" />;

  const published = form.status === "published";

  async function share() {
    setSharing(true);
    try {
      await formService.update(formId, { audience });
      const res = await formService.notify(formId);
      success(
        res.recipients === 0
          ? "No members to notify in this audience yet."
          : `Shared with ${res.recipients} member${res.recipients === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not share.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-lg text-ink-900">Share with your team</h3>
        <p className="text-sm text-ink-500">
          Choose who inside your organization can respond, then notify them.
        </p>
      </div>

      {!published && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Publish the form first to notify members.
        </p>
      )}

      <AudienceSelector
        audience={audience}
        groups={groups}
        onChange={setAudience}
      />

      {audience.type === "groups" && (audience.groupIds?.length ?? 0) === 0 && (
        <p className="text-xs text-ink-500">
          Select at least one group above.
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <p className="flex items-center gap-2 text-xs text-ink-500">
          <Users className="h-4 w-4" />
          {audience.type === "organization"
            ? "Everyone in your organization"
            : `${audience.groupIds?.length ?? 0} group(s) selected`}
        </p>
        <Button
          onClick={share}
          loading={sharing}
          disabled={
            !isManager ||
            !published ||
            (audience.type === "groups" && (audience.groupIds?.length ?? 0) === 0)
          }
        >
          <Send className="h-4 w-4" /> Share with members
        </Button>
      </div>
    </div>
  );
}
