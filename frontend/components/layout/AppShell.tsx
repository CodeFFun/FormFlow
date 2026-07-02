"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useOrg } from "@/components/providers/OrgProvider";
import { AppSidebar } from "./AppSidebar";
import { AppNavbar } from "./AppNavbar";
import { LoadingState } from "@/components/ui/Spinner";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { organizations, loading } = useOrg();

  useEffect(() => {
    if (!loading && organizations.length === 0) {
      router.replace("/onboarding/organization");
    }
  }, [loading, organizations, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Setting up your workspace…" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <AppSidebar />
      <div className="pl-[120px]">
        <AppNavbar />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
