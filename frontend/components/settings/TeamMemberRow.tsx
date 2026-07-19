"use client";

import { Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import type { OrgMember, OrgRole } from "@/types/organization";

export interface TeamMemberRowProps {
  member: OrgMember;
  isCurrentUser: boolean;
  canManage: boolean;
  canChangeRole: boolean;
  onRoleChange: (userId: string, role: Exclude<OrgRole, "owner">) => void;
  onPermissionToggle: (userId: string, manageForms: boolean) => void;
  onRemove: (userId: string) => void;
}

export function TeamMemberRow({
  member,
  isCurrentUser,
  canManage,
  canChangeRole,
  onRoleChange,
  onPermissionToggle,
  onRemove,
}: TeamMemberRowProps) {
  const isOwner = member.role === "owner";
  const name = member.user
    ? `${member.user.firstName} ${member.user.lastName}`.trim()
    : undefined;
  const email = member.user?.email;
  const canManageForms = member.permissions?.includes("manage_forms");

  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-4">
      <Avatar name={name} email={email} src={member.user?.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">
          {name || email || member.userId}
          {isCurrentUser && (
            <span className="ml-2 text-xs text-ink-300">(you)</span>
          )}
        </p>
        {email && name && (
          <p className="truncate text-xs text-ink-500">{email}</p>
        )}
      </div>

      {}
      {member.role === "member" && canManage && (
        <div className="w-40">
          <Toggle
            checked={Boolean(canManageForms)}
            onChange={(v) => onPermissionToggle(member.userId, v)}
            label="Can manage forms"
          />
        </div>
      )}

      {isOwner ? (
        <Badge tone="indigo">Owner</Badge>
      ) : canChangeRole ? (
        <Select
          className="h-9 w-32"
          value={member.role}
          onChange={(e) =>
            onRoleChange(member.userId, e.target.value as Exclude<OrgRole, "owner">)
          }
        >
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </Select>
      ) : (
        <Badge tone={member.role === "admin" ? "indigo" : "neutral"}>
          {member.role}
        </Badge>
      )}

      {canManage && !isOwner && !isCurrentUser && (
        <button
          type="button"
          onClick={() => onRemove(member.userId)}
          className="rounded-md p-1.5 text-ink-300 hover:bg-coral-50 hover:text-coral-600"
          aria-label="Remove member"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
