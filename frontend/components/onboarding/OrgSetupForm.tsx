"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { orgs } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, FieldError } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export const ONBOARDING_ORG_KEY = "formflow_onboarding_org";

const schema = z.object({
  name: z.string().min(2, "Organization name is too short").max(100),
  slug: z
    .string()
    .regex(/^[a-z0-9-]*$/, "Lowercase letters, numbers and dashes only")
    .optional()
    .or(z.literal("")),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function OrgSetupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(name);

  useEffect(() => {
    let active = true;
    orgs
      .list()
      .then((list) => {
        if (active && list.length > 0) router.replace("/dashboard");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse({ name, slug: effectiveSlug });
    if (!parsed.success) {
      const fe: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof typeof errors;
        if (!fe[k]) fe[k] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const org = await orgs.create({
        name: parsed.data.name,
        slug: parsed.data.slug || undefined,
      });
      sessionStorage.setItem(ONBOARDING_ORG_KEY, org._id);
      router.push("/onboarding/branding");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Could not create organization.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink-900">
        Create your organization
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        This is the workspace where your team will build and share forms.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {formError && (
          <p className="rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-600">
            {formError}
          </p>
        )}
        <div>
          <Label htmlFor="name" required>
            Organization name
          </Label>
          <Input
            id="name"
            className="mt-1.5"
            placeholder="Acme Inc."
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <FieldError message={errors.name} />
        </div>
        <div>
          <Label htmlFor="slug">URL slug</Label>
          <div className="mt-1.5 flex items-center rounded-md border border-ink-100 bg-white focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2">
            <span className="pl-3 text-sm text-ink-300">formflow.app/</span>
            <input
              id="slug"
              className="h-11 flex-1 rounded-md bg-transparent px-1 text-sm text-ink-900 focus:outline-none"
              placeholder="acme"
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
            />
          </div>
          <FieldError message={errors.slug} />
          <p className="mt-1 text-xs text-ink-500">
            Leave blank to generate one from your name.
          </p>
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg">
          Continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Been invited to a team?{" "}
        <Link
          href="/invite"
          className="font-medium text-indigo-600 hover:underline"
        >
          Join with a code
        </Link>
      </p>
    </div>
  );
}
