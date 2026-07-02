import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <div className="min-h-screen bg-ink-50">
        <header className="border-b border-ink-100 bg-white">
          <div className="mx-auto flex max-w-3xl items-center px-6 py-4">
            <span className="font-serif text-xl font-semibold text-ink-900">
              FormFlow
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-6 py-10">{children}</main>
      </div>
    </RequireAuth>
  );
}
