"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, LogIn, Loader2, KeyRound } from "lucide-react";
import { orgs } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type State =
  | { kind: "checking" }
  | { kind: "needsLogin" }
  | { kind: "manual" }
  | { kind: "accepting" }
  | { kind: "success"; orgName: string }
  | { kind: "error"; message: string };

function InviteAcceptInner() {
  const router = useRouter();
  const params = useSearchParams();
  const urlToken = params.get("token");
  const [state, setState] = useState<State>({ kind: "checking" });
  const [code, setCode] = useState(urlToken ?? "");
  const autoAccepted = useRef(false);

  async function accept(token: string) {
    setState({ kind: "accepting" });
    try {
      const org = await orgs.acceptInvitation(token.trim());
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("formflow_pending_invite");
      }
      setState({ kind: "success", orgName: org.name });
    } catch (err) {
      setState({
        kind: "error",
        message:
          err instanceof ApiError
            ? err.message
            : "We couldn't accept this invitation.",
      });
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      if (urlToken && typeof window !== "undefined") {
        sessionStorage.setItem("formflow_pending_invite", urlToken);
      }
      setState({ kind: "needsLogin" });
      return;
    }
    if (urlToken) {
      if (autoAccepted.current) return;
      autoAccepted.current = true;
      void accept(urlToken);
    } else {
      setState({ kind: "manual" });
    }
  }, [urlToken]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-md rounded-xl border border-ink-100 bg-white p-10 text-center shadow-sm">
        <span className="mb-6 inline-block font-serif text-xl font-semibold text-ink-900">
          FormFlow
        </span>

        {(state.kind === "checking" || state.kind === "accepting") && (
          <div className="flex flex-col items-center gap-3 text-ink-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm">
              {state.kind === "accepting"
                ? "Accepting your invitation…"
                : "Loading…"}
            </p>
          </div>
        )}

        {state.kind === "needsLogin" && (
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
              <LogIn className="h-7 w-7" />
            </span>
            <h1 className="font-serif text-2xl text-ink-900">Sign in to continue</h1>
            <p className="text-sm text-ink-500">
              You&apos;ve been invited to join an organization. Sign in (or create
              an account), then come back to this link or enter your invite code.
            </p>
            <Link href="/login" className="w-full">
              <Button fullWidth size="lg">
                Go to sign in
              </Button>
            </Link>
          </div>
        )}

        {(state.kind === "manual" || state.kind === "error") && (
          <div className="flex flex-col items-center gap-4">
            <span
              className={
                state.kind === "error"
                  ? "inline-flex h-14 w-14 items-center justify-center rounded-full bg-coral-50 text-coral-600"
                  : "inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-700"
              }
            >
              {state.kind === "error" ? (
                <XCircle className="h-7 w-7" />
              ) : (
                <KeyRound className="h-7 w-7" />
              )}
            </span>
            <h1 className="font-serif text-2xl text-ink-900">
              {state.kind === "error"
                ? "Invitation unavailable"
                : "Join an organization"}
            </h1>
            {state.kind === "error" && (
              <p className="text-sm text-coral-600">{state.message}</p>
            )}
            <p className="text-sm text-ink-500">
              Enter the invitation code from your email to join.
            </p>
            <div className="w-full text-left">
              <Label htmlFor="code" required>
                Invitation code
              </Label>
              <Input
                id="code"
                className="mt-1.5"
                placeholder="Paste your invite code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <Button
              fullWidth
              size="lg"
              onClick={() => accept(code)}
              disabled={!code.trim()}
            >
              Join organization
            </Button>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-ink-500 hover:text-ink-900"
            >
              Skip for now
            </Link>
          </div>
        )}

        {state.kind === "success" && (
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="font-serif text-2xl text-ink-900">You&apos;re in!</h1>
            <p className="text-sm text-ink-500">
              You&apos;ve joined{" "}
              <span className="font-medium text-ink-900">{state.orgName}</span>.
            </p>
            <Button fullWidth size="lg" onClick={() => router.replace("/dashboard")}>
              Go to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-ink-50">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <InviteAcceptInner />
    </Suspense>
  );
}
