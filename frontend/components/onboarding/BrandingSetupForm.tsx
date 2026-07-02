"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { orgs } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { BrandingPreview } from "./BrandingPreview";
import { ONBOARDING_ORG_KEY } from "./OrgSetupForm";
import type { Organization } from "@/types/organization";

const DEFAULT_PRIMARY = "#534AB7";
const DEFAULT_SECONDARY = "#0D7A5F";

export function BrandingSetupForm() {
  const router = useRouter();
  const { error: toastError } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [orgId, setOrgId] = useState<string | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [primary, setPrimary] = useState(DEFAULT_PRIMARY);
  const [secondary, setSecondary] = useState(DEFAULT_SECONDARY);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem(ONBOARDING_ORG_KEY);
    if (!id) {
      router.replace("/onboarding/organization");
      return;
    }
    setOrgId(id);
    orgs
      .get(id)
      .then((o) => {
        setOrg(o);
        if (o.branding?.primaryColor) setPrimary(o.branding.primaryColor);
        if (o.branding?.secondaryColor) setSecondary(o.branding.secondaryColor);
        setLogoUrl(o.branding?.logoUrl);
      })
      .catch(() => {});
  }, [router]);

  async function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !orgId) return;
    setUploading(true);
    try {
      const updated = await orgs.uploadLogo(orgId, file);
      setLogoUrl(updated.branding?.logoUrl);
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Logo upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    setSaving(true);
    try {
      await orgs.update(orgId, {
        branding: {
          logoUrl,
          primaryColor: primary,
          secondaryColor: secondary,
        },
      });
      router.push("/onboarding/team");
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not save branding.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink-900">Make it yours</h1>
      <p className="mt-2 text-sm text-ink-500">
        Add a logo and colors. You can change these later in settings.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 sm:grid-cols-2">
        <div className="space-y-5">
          <div>
            <Label>Logo</Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onLogoChange}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="mt-1.5 flex h-28 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-100 bg-white text-ink-500 transition-colors hover:border-indigo-200 hover:text-indigo-600"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span className="text-xs">
                {logoUrl ? "Replace logo" : "Upload a logo (max 5MB)"}
              </span>
            </button>
          </div>

          <div>
            <Label htmlFor="primary">Primary color</Label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                id="primary"
                type="color"
                value={primary}
                onChange={(e) => setPrimary(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-ink-100"
              />
              <span className="text-sm text-ink-500">{primary}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="secondary">Secondary color</Label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                id="secondary"
                type="color"
                value={secondary}
                onChange={(e) => setSecondary(e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-md border border-ink-100"
              />
              <span className="text-sm text-ink-500">{secondary}</span>
            </div>
          </div>
        </div>

        <div>
          <Label>Preview</Label>
          <div className="mt-1.5">
            <BrandingPreview
              name={org?.name ?? ""}
              logoUrl={logoUrl}
              primaryColor={primary}
              secondaryColor={secondary}
            />
          </div>
        </div>

        <div className="flex gap-3 sm:col-span-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/onboarding/team")}
          >
            Skip for now
          </Button>
          <Button type="submit" loading={saving} className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
