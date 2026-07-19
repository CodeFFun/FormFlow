"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { orgs as orgService } from "@/lib/services";
import { getCurrentUserId } from "@/lib/auth";
import type { Organization, OrgMember } from "@/types/organization";

const CURRENT_ORG_KEY = "formflow_current_org";

interface OrgContextValue {
  userId: string | null;
  organizations: Organization[];
  currentOrg: Organization | null;
  currentMember: OrgMember | null;
  isManager: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  loading: boolean;
  setCurrentOrgId: (id: string) => void;
  refresh: () => Promise<void>;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within <OrgProvider>");
  return ctx;
}

export function OrgProvider({ children }: { children: ReactNode }) {
  const userId = getCurrentUserId();
  const {
    data: organizations,
    isLoading,
    mutate,
  } = useSWR<Organization[]>("/organizations", () => orgService.list());

  const [currentOrgId, setCurrentOrgIdState] = useState<string | null>(null);

  useEffect(() => {
    if (!organizations || organizations.length === 0) return;
    const stored =
      typeof window !== "undefined"
        ? window.localStorage.getItem(CURRENT_ORG_KEY)
        : null;
    const exists = stored && organizations.some((o) => o._id === stored);
    setCurrentOrgIdState(exists ? stored : organizations[0]._id);
  }, [organizations]);

  const setCurrentOrgId = useCallback((id: string) => {
    setCurrentOrgIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CURRENT_ORG_KEY, id);
    }
  }, []);

  const value = useMemo<OrgContextValue>(() => {
    const list = organizations ?? [];
    const currentOrg =
      list.find((o) => o._id === currentOrgId) ?? list[0] ?? null;
    const currentMember =
      currentOrg?.members.find((m) => m.userId === userId) ?? null;
    const isOwner = currentMember?.role === "owner";
    const isAdmin = currentMember?.role === "admin";
    const isManager =
      isOwner ||
      isAdmin ||
      Boolean(currentMember?.permissions?.includes("manage_forms"));

    return {
      userId,
      organizations: list,
      currentOrg,
      currentMember,
      isManager,
      isOwner,
      isAdmin,
      loading: isLoading,
      setCurrentOrgId,
      refresh: () => mutate().then(() => undefined),
    };
  }, [organizations, currentOrgId, userId, isLoading, setCurrentOrgId, mutate]);

  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
}
