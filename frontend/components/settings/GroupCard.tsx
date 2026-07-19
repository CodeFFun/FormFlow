"use client";

import { UsersRound, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { OrgGroup } from "@/types/organization";

export interface GroupCardProps {
  group: OrgGroup;
  canManage: boolean;
  onEdit: (group: OrgGroup) => void;
  onDelete: (group: OrgGroup) => void;
}

export function GroupCard({ group, canManage, onEdit, onDelete }: GroupCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <UsersRound className="h-5 w-5" />
      </span>
      <div className="flex-1">
        <p className="font-medium text-ink-900">{group.name}</p>
        <p className="text-sm text-ink-500">
          {group.memberIds.length} member{group.memberIds.length === 1 ? "" : "s"}
        </p>
      </div>
      {canManage && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(group)}
            className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
            aria-label="Edit group"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(group)}
            className="rounded-md p-1.5 text-ink-500 hover:bg-coral-50 hover:text-coral-600"
            aria-label="Delete group"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </Card>
  );
}
