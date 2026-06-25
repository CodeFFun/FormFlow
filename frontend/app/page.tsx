"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { LoadingState } from "@/components/ui/Spinner";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(isAuthenticated() ? "/dashboard" : "/login");
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState label="Starting FormFlow…" />
    </div>
  );
}
