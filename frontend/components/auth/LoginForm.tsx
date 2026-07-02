"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input, FieldError } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const PENDING_EMAIL_KEY = "formflow_pending_email";

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = schema.safeParse(values);
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
      await api.post("/auth/login", parsed.data);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(PENDING_EMAIL_KEY, parsed.data.email);
      }
      router.push("/verify-otp");
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : "Could not sign in.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink-900">Welcome back</h1>
      <p className="mt-2 text-sm text-ink-500">
        Sign in to continue to FormFlow.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        {formError && (
          <p className="rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-600">
            {formError}
          </p>
        )}
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            error={errors.email}
            autoComplete="email"
          />
          <FieldError message={errors.email} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            className="mt-1.5"
            value={values.password}
            onChange={(e) =>
              setValues((v) => ({ ...v, password: e.target.value }))
            }
            error={errors.password}
            autoComplete="current-password"
          />
          <FieldError message={errors.password} />
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg">
          Continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to FormFlow?{" "}
        <Link href="/signup" className="font-medium text-indigo-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export { PENDING_EMAIL_KEY };
