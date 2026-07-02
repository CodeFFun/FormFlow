"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Plus, Mail } from "lucide-react";
import { orgs } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { ONBOARDING_ORG_KEY } from "./OrgSetupForm";
import type { OrgRole } from "@/types/organization";

interface PendingInvite {
  email: string;
  role: Exclude<OrgRole, "owner">;
}

const emailSchema = z.string().email();

export function InviteTeamForm() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<OrgRole, "owner">>("member");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [sending, setSending] = useState(false);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem(ONBOARDING_ORG_KEY);
    if (!id) {
      router.replace("/onboarding/organization");
      return;
    }
    setOrgId(id);
  }, [router]);

  async function addInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!orgId) return;
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError("Enter a valid email");
      return;
    }
    if (invites.some((i) => i.email === email)) {
      setEmailError("Already added");
      return;
    }
    setEmailError(undefined);
    setSending(true);
    try {
      await orgs.invite(orgId, { email, role });
      setInvites((prev) => [...prev, { email, role }]);
      setEmail("");
      success(`Invitation sent to ${email}`);
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not send invite.");
    } finally {
      setSending(false);
    }
  }

  function finish() {
    setFinishing(true);
    sessionStorage.removeItem(ONBOARDING_ORG_KEY);
    router.push("/dashboard");
  }

  return (
    <div>
      <h1 className="font-serif text-3xl text-ink-900">Invite your team</h1>
      <p className="mt-2 text-sm text-ink-500">
        Add teammates as admins or members. You can always invite more later.
      </p>

      <form onSubmit={addInvite} className="mt-8 space-y-4" noValidate>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              className="mt-1.5"
              placeholder="teammate@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
            />
          </div>
          <div className="sm:w-40">
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              className="mt-1.5"
              value={role}
              onChange={(e) => setRole(e.target.value as Exclude<OrgRole, "owner">)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <Button type="submit" loading={sending} variant="secondary">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        {emailError && (
          <p className="text-xs font-medium text-coral-600">{emailError}</p>
        )}
      </form>

      <div className="mt-6 space-y-2">
        {invites.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink-100 bg-white px-4 py-6 text-center text-sm text-ink-500">
            No invitations yet. Add teammates above or skip this step.
          </p>
        ) : (
          invites.map((inv) => (
            <div
              key={inv.email}
              className="flex items-center justify-between rounded-md border border-ink-100 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-ink-300" />
                <span className="text-sm text-ink-900">{inv.email}</span>
              </div>
              <Badge tone={inv.role === "admin" ? "indigo" : "neutral"}>
                {inv.role}
              </Badge>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="ghost" onClick={finish} loading={finishing}>
          {invites.length > 0 ? "Done" : "Skip for now"}
        </Button>
        <Button onClick={finish} loading={finishing}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
