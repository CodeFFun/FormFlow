"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, Mail, Copy, Check, Trash2 } from "lucide-react";
import { z } from "zod";
import { orgs as orgService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useOrg } from "@/components/providers/OrgProvider";
import { TeamMemberRow } from "@/components/settings/TeamMemberRow";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { OrgRole } from "@/types/organization";

const emailSchema = z.string().email();

export default function TeamSettingsPage() {
  const { currentOrg, userId, isOwner, isAdmin, loading, refresh } = useOrg();
  const { success, error: toastError } = useToast();
  const canManage = isOwner || isAdmin;

  const orgId = currentOrg?._id;
  const { data: invitations, mutate: mutateInvites } = useSWR(
    orgId && canManage ? ["invitations", orgId] : null,
    () => orgService.listInvitations(orgId as string),
  );

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<OrgRole, "owner">>("member");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (loading || !currentOrg) return <LoadingState />;

  async function invite() {
    if (!orgId) return;
    if (!emailSchema.safeParse(email).success) {
      setEmailError("Enter a valid email");
      return;
    }
    setEmailError(undefined);
    setSending(true);
    try {
      const res = await orgService.invite(orgId, { email, role });
      setLastToken(res.token);
      setEmail("");
      success(`Invitation created for ${email}`);
      void mutateInvites();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not invite.");
    } finally {
      setSending(false);
    }
  }

  async function changeRole(uid: string, newRole: Exclude<OrgRole, "owner">) {
    if (!orgId) return;
    try {
      await orgService.setMemberRole(orgId, uid, newRole);
      success("Role updated");
      refresh();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not update role.");
    }
  }

  async function togglePermission(uid: string, manageForms: boolean) {
    if (!orgId) return;
    try {
      await orgService.setMemberPermissions(orgId, uid, manageForms ? ["manage_forms"] : []);
      success("Permissions updated");
      refresh();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not update.");
    }
  }

  async function removeMember(uid: string) {
    if (!orgId) return;
    try {
      await orgService.removeMember(orgId, uid);
      success("Member removed");
      refresh();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not remove.");
    }
  }

  async function revokeInvite(invId: string) {
    if (!orgId) return;
    try {
      await orgService.revokeInvitation(orgId, invId);
      void mutateInvites();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not revoke.");
    }
  }

  const pending = (invitations ?? []).filter((i) => i.status === "pending");

  return (
    <div className="max-w-2xl space-y-6">
      {canManage && (
        <Card>
          <CardHeader>
            <h2 className="font-serif text-lg text-ink-900">Invite a member</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="teammate@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={emailError}
                />
              </div>
              <Select
                className="sm:w-36"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as Exclude<OrgRole, "owner">)
                }
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Select>
              <Button onClick={invite} loading={sending}>
                <Plus className="h-4 w-4" /> Invite
              </Button>
            </div>
            {emailError && (
              <p className="text-xs font-medium text-coral-600">{emailError}</p>
            )}
            {lastToken && (
              <div className="flex items-center gap-2 rounded-md bg-indigo-50 px-3 py-2 text-sm">
                <span className="text-ink-500">Invite token:</span>
                <code className="flex-1 truncate text-xs text-ink-900">
                  {lastToken}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(lastToken);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="rounded-md p-1 text-ink-500 hover:bg-white"
                  aria-label="Copy token"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-teal-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-serif text-lg text-ink-900">
            Members ({currentOrg.members.length})
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-ink-100">
            {currentOrg.members.map((m) => (
              <TeamMemberRow
                key={m.userId}
                member={m}
                isCurrentUser={m.userId === userId}
                canManage={canManage}
                canChangeRole={isOwner}
                onRoleChange={changeRole}
                onPermissionToggle={togglePermission}
                onRemove={removeMember}
              />
            ))}
          </div>
        </CardBody>
      </Card>

      {canManage && pending.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-serif text-lg text-ink-900">
              Pending invitations
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-ink-100">
              {pending.map((inv) => (
                <div
                  key={inv._id}
                  className="flex items-center gap-3 px-5 py-4"
                >
                  <Mail className="h-4 w-4 text-ink-300" />
                  <span className="flex-1 truncate text-sm text-ink-900">
                    {inv.email}
                  </span>
                  <Badge tone={inv.role === "admin" ? "indigo" : "neutral"}>
                    {inv.role}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => revokeInvite(inv._id)}
                    className="rounded-md p-1.5 text-ink-300 hover:bg-coral-50 hover:text-coral-600"
                    aria-label="Revoke invitation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {currentOrg.members.length === 0 && (
        <EmptyState title="No members yet" />
      )}
    </div>
  );
}
