"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input, FieldError } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({ email: z.string().email("Enter a valid email") });

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h1 className="font-serif text-2xl text-ink-900">Check your inbox</h1>
        <p className="mt-2 text-sm text-ink-500">
          If an account exists for{" "}
          <span className="font-medium text-ink-900">{email}</span>, you&apos;ll
          receive password reset instructions shortly.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink-900">Reset your password</h1>
      <p className="mt-2 text-sm text-ink-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            autoComplete="email"
          />
          <FieldError message={error} />
        </div>
        <Button type="submit" fullWidth loading={loading} size="lg">
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-500">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
