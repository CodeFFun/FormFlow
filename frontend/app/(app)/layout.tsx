import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { OrgProvider } from "@/components/providers/OrgProvider";
import { AppShell } from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <OrgProvider>
        <AppShell>{children}</AppShell>
      </OrgProvider>
    </RequireAuth>
  );
}
