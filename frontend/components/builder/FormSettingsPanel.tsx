"use client";

import { Toggle } from "@/components/ui/Toggle";
import { Input, Textarea } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { AudienceSelector } from "./AudienceSelector";
import type { FormSettings, FormAudience } from "@/types/form";
import type { OrgGroup } from "@/types/organization";

export interface FormSettingsPanelProps {
  settings: FormSettings;
  audience: FormAudience;
  groups: OrgGroup[];
  onSettingsChange: (settings: FormSettings) => void;
  onAudienceChange: (audience: FormAudience) => void;
}

export function FormSettingsPanel({
  settings,
  audience,
  groups,
  onSettingsChange,
  onAudienceChange,
}: FormSettingsPanelProps) {
  const set = <K extends keyof FormSettings>(key: K, value: FormSettings[K]) =>
    onSettingsChange({ ...settings, [key]: value });

  const closeAtLocal = settings.closeAt
    ? new Date(settings.closeAt).toISOString().slice(0, 16)
    : "";

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <h3 className="font-serif text-lg text-ink-900">Audience</h3>
          <p className="mt-0.5 text-sm text-ink-500">
            Who inside your organization can respond.
          </p>
        </CardHeader>
        <CardBody>
          <AudienceSelector
            audience={audience}
            groups={groups}
            onChange={onAudienceChange}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-serif text-lg text-ink-900">Response options</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <Toggle
            checked={settings.allowMultipleSubmissions}
            onChange={(v) => set("allowMultipleSubmissions", v)}
            label="Allow multiple submissions"
            description="Let each person submit more than once."
          />
          <Toggle
            checked={settings.requireLogin}
            onChange={(v) => set("requireLogin", v)}
            label="Require login"
            description="Respondents must be signed in to submit."
          />
          <Toggle
            checked={settings.showProgressBar}
            onChange={(v) => set("showProgressBar", v)}
            label="Show progress bar"
            description="Display completion progress while filling."
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-serif text-lg text-ink-900">Limits & messaging</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="closeAt">Close date</Label>
            <Input
              id="closeAt"
              type="datetime-local"
              className="mt-1.5"
              value={closeAtLocal}
              onChange={(e) =>
                set(
                  "closeAt",
                  e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                )
              }
            />
            <p className="mt-1 text-xs text-ink-500">
              The form stops accepting responses after this time.
            </p>
          </div>
          <div>
            <Label htmlFor="maxResponses">Maximum responses</Label>
            <Input
              id="maxResponses"
              type="number"
              min={1}
              className="mt-1.5"
              placeholder="Unlimited"
              value={settings.maxResponses ?? ""}
              onChange={(e) =>
                set(
                  "maxResponses",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="confirmationMessage">Confirmation message</Label>
            <Textarea
              id="confirmationMessage"
              className="mt-1.5"
              rows={3}
              placeholder="Thanks for your response!"
              value={settings.confirmationMessage ?? ""}
              onChange={(e) => set("confirmationMessage", e.target.value)}
            />
            <p className="mt-1 text-xs text-ink-500">
              Shown to respondents after they submit.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
