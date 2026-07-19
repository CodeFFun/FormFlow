"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { forms as formService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useOrg } from "@/components/providers/OrgProvider";
import { FormTabNav } from "@/components/responses/FormTabNav";
import { FormSettingsPanel } from "@/components/builder/FormSettingsPanel";
import { DangerZone } from "@/components/responses/DangerZone";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import type { FormSettings, FormAudience } from "@/types/form";

const DEFAULT_SETTINGS: FormSettings = {
  allowMultipleSubmissions: false,
  requireLogin: false,
  showProgressBar: true,
};

export default function FormSettingsPage() {
  const { formId } = useParams<{ formId: string }>();
  const { currentOrg } = useOrg();
  const { success, error: toastError } = useToast();

  const { data: form, isLoading, mutate } = useSWR(["form", formId], () =>
    formService.get(formId),
  );

  const [settings, setSettings] = useState<FormSettings>(DEFAULT_SETTINGS);
  const [audience, setAudience] = useState<FormAudience>({ type: "organization" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (form) {
      setSettings({ ...DEFAULT_SETTINGS, ...form.settings });
      setAudience(form.audience ?? { type: "organization" });
    }
  }, [form]);

  async function save() {
    setSaving(true);
    try {
      await formService.update(formId, { settings, audience });
      success("Settings saved");
      void mutate();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <FormTabNav formId={formId} title={form?.title} />
      {isLoading || !form ? (
        <LoadingState label="Loading settings…" />
      ) : (
        <div className="max-w-2xl space-y-6">
          <FormSettingsPanel
            settings={settings}
            audience={audience}
            groups={currentOrg?.groups ?? []}
            onSettingsChange={setSettings}
            onAudienceChange={setAudience}
          />
          <div className="flex justify-end">
            <Button onClick={save} loading={saving}>
              Save changes
            </Button>
          </div>
          <DangerZone form={form} onUpdated={() => void mutate()} />
        </div>
      )}
    </div>
  );
}
