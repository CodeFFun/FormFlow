"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  Bell,
  ChevronDown,
  Plus,
  LogOut,
  User,
  Check,
  Building2,
  KeyRound,
} from "lucide-react";
import { useOrg } from "@/components/providers/OrgProvider";
import { notifications as notifService, auth, orgs } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

export function AppNavbar() {
  const router = useRouter();
  const {
    currentOrg,
    organizations,
    setCurrentOrgId,
    isManager,
    currentMember,
    refresh,
  } = useOrg();
  const { success, error: toastError } = useToast();
  const [orgMenu, setOrgMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  async function createOrg() {
    if (newOrgName.trim().length < 2) return;
    setCreating(true);
    try {
      const org = await orgs.create({ name: newOrgName.trim() });
      await refresh();
      setCurrentOrgId(org._id);
      setCreateOpen(false);
      setNewOrgName("");
      success(`Created "${org.name}"`);
      router.push("/dashboard");
    } catch (err) {
      toastError(
        err instanceof ApiError ? err.message : "Could not create organization.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function joinWithCode() {
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const org = await orgs.acceptInvitation(joinCode.trim());
      await refresh();
      setCurrentOrgId(org._id);
      setJoinOpen(false);
      setJoinCode("");
      success(`Joined "${org.name}"`);
      router.push("/dashboard");
    } catch (err) {
      toastError(
        err instanceof ApiError
          ? err.message
          : "Invalid or expired invitation code.",
      );
    } finally {
      setJoining(false);
    }
  }

  const { data: unread } = useSWR(
    "/notifications/unread-count",
    () => notifService.unreadCount(),
    { refreshInterval: 60_000 },
  );
  const count = unread?.count ?? 0;

  async function logout() {
    try {
      await auth.logout();
    } catch {
    }
    clearAccessToken();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-6 backdrop-blur">
      {}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOrgMenu((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-ink-50"
        >
          <Avatar
            name={currentOrg?.name}
            src={currentOrg?.branding?.logoUrl}
            size="sm"
          />
          <span className="max-w-[180px] truncate text-sm font-medium text-ink-900">
            {currentOrg?.name ?? "Select organization"}
          </span>
          <ChevronDown className="h-4 w-4 text-ink-500" />
        </button>
        {orgMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOrgMenu(false)}
            />
            <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-lg">
              {organizations.map((o) => (
                <button
                  key={o._id}
                  type="button"
                  onClick={() => {
                    setCurrentOrgId(o._id);
                    setOrgMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-ink-50"
                >
                  <Avatar name={o.name} src={o.branding?.logoUrl} size="sm" />
                  <span className="flex-1 truncate text-ink-900">{o.name}</span>
                  {o._id === currentOrg?._id && (
                    <Check className="h-4 w-4 text-indigo-600" />
                  )}
                </button>
              ))}
              <div className="my-1 border-t border-ink-100" />
              <button
                type="button"
                onClick={() => {
                  setOrgMenu(false);
                  setCreateOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-900 hover:bg-ink-50"
              >
                <Building2 className="h-4 w-4 text-ink-500" /> New organization
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrgMenu(false);
                  setJoinOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-900 hover:bg-ink-50"
              >
                <KeyRound className="h-4 w-4 text-ink-500" /> Join with a code
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isManager && (
          <Button
            size="sm"
            onClick={() => router.push("/forms/new")}
            className="hidden sm:inline-flex"
          >
            <Plus className="h-4 w-4" /> New form
          </Button>
        )}

        <Link
          href="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
          aria-label={`Notifications${count ? `, ${count} unread` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-600 px-1 text-[10px] font-semibold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>

        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenu((v) => !v)}
            className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-ink-50"
            aria-label="Account menu"
          >
            <Avatar
              name={currentMember?.user?.firstName}
              email={currentMember?.user?.email}
              src={currentMember?.user?.avatarUrl}
              size="sm"
            />
          </button>
          {userMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setUserMenu(false)}
              />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-lg">
                <Link
                  href="/settings/account"
                  onClick={() => setUserMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-ink-900 hover:bg-ink-50"
                >
                  <User className="h-4 w-4" /> Account
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-coral-600 hover:bg-coral-50",
                  )}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New organization"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createOrg}
              loading={creating}
              disabled={newOrgName.trim().length < 2}
            >
              Create
            </Button>
          </>
        }
      >
        <div>
          <Label htmlFor="newOrgName" required>
            Organization name
          </Label>
          <Input
            id="newOrgName"
            className="mt-1.5"
            placeholder="Acme Inc."
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-ink-500">
            You&apos;ll be the owner. A URL slug is generated automatically.
          </p>
        </div>
      </Modal>

      <Modal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        title="Join an organization"
        footer={
          <>
            <Button variant="ghost" onClick={() => setJoinOpen(false)}>
              Cancel
            </Button>
            <Button onClick={joinWithCode} loading={joining} disabled={!joinCode.trim()}>
              Join
            </Button>
          </>
        }
      >
        <div>
          <Label htmlFor="joinCode" required>
            Invitation code
          </Label>
          <Input
            id="joinCode"
            className="mt-1.5"
            placeholder="Paste the code from your invite email"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-ink-500">
            The code was emailed to you when you were invited.
          </p>
        </div>
      </Modal>
    </header>
  );
}
