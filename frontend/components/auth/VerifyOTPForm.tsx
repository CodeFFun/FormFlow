"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setAccessToken } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Input";
import { OTPInput } from "./OTPInput";
import { PENDING_EMAIL_KEY } from "./LoginForm";
import type { VerifyTokenResponse } from "@/types/auth";

export function VerifyOTPForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEmail(sessionStorage.getItem(PENDING_EMAIL_KEY));
    }
  }, []);

  async function verify(otp: string) {
    setError(null);
    setLoading(true);
    try {
      const data = await api.post<VerifyTokenResponse>("/auth/verify-token", {
        token: otp,
      });
      setAccessToken(data.accessToken);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(PENDING_EMAIL_KEY);
      }
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Invalid or expired code.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    await verify(code);
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink-900">Enter your code</h1>
      <p className="mt-2 text-sm text-ink-500">
        We emailed a 6-digit verification code
        {email ? (
          <>
            {" "}
            for <span className="font-medium text-ink-900">{email}</span>
          </>
        ) : null}
        . Enter it below to continue.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <OTPInput value={code} onChange={setCode} error={Boolean(error)} />
        <FieldError message={error ?? undefined} />
        <Button type="submit" fullWidth loading={loading} size="lg">
          Verify &amp; continue
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Wrong email?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
