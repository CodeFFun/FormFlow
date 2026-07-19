"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { orgs as orgService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";

type State =
  | { kind: "loading" }
  | { kind: "need-auth" }
  | { kind: "no-token" }
  | { kind: "success"; orgName?: string }
  | { kind: "error"; message: string };

function InviteAcceptInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setState({ kind: "no-token" });
      return;
    }
    if (!isAuthenticated()) {
      sessionStorage.setItem("formflow_pending_invite", token);
      setState({ kind: "need-auth" });
      return;
    }
    orgService
      .acceptInvitation(token)
      .then((org) => setState({ kind: "success", orgName: org?.name }))
      .catch((err) =>
        setState({
          kind: "error",
          message:
            err instanceof ApiError
              ? err.message
              : "This invitation is invalid or has expired.",
        }),
      );
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <div className="w-full max-w-md rounded-xl border border-ink-100 bg-white p-8 text-center shadow-sm">
        {state.kind === "loading" && <LoadingState label="Accepting invitation…" />}

        {state.kind === "need-auth" && (
          <>
            <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Mail className="h-7 w-7" />
            </span>
            <h1 className="font-serif text-2xl text-ink-900">
              You&apos;ve been invited
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              Sign in or create an account to join the organization. Return to
              this link afterward to accept.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/login">
                <Button>Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline">Create account</Button>
              </Link>
            </div>
          </>
        )}

        {state.kind === "no-token" && (
          <>
            <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-500">
              <XCircle className="h-7 w-7" />
            </span>
            <h1 className="font-serif text-2xl text-ink-900">
              Invalid invitation link
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              This link is missing its invitation token.
            </p>
          </>
        )}

        {state.kind === "success" && (
          <>
            <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="font-serif text-2xl text-ink-900">You&apos;re in!</h1>
            <p className="mt-2 text-sm text-ink-500">
              You&apos;ve joined{" "}
              <span className="font-medium text-ink-900">
                {state.orgName ?? "the organization"}
              </span>
              .
            </p>
            <Button className="mt-6" onClick={() => router.replace("/dashboard")}>
              Go to dashboard
            </Button>
          </>
        )}

        {state.kind === "error" && (
          <>
            <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-coral-50 text-coral-600">
              <XCircle className="h-7 w-7" />
            </span>
            <h1 className="font-serif text-2xl text-ink-900">
              Couldn&apos;t accept invitation
            </h1>
            <p className="mt-2 text-sm text-ink-500">{state.message}</p>
            <Link href="/dashboard">
              <Button variant="outline" className="mt-6">
                Go to dashboard
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <InviteAcceptInner />
    </Suspense>
  );
}
