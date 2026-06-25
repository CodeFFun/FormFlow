"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 p-6">
      <div className="max-w-md text-center">
        <span className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-coral-50 text-coral-600">
          <AlertTriangle className="h-8 w-8" />
        </span>
        <h1 className="font-serif text-2xl text-ink-900">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          An unexpected error occurred. You can try again, and if it keeps
          happening, refresh the page.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            Go to dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
