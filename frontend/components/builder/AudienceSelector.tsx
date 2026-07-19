"use client";

import { Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FormAudience } from "@/types/form";
import type { OrgGroup } from "@/types/organization";

export interface AudienceSelectorProps {
  audience: FormAudience;
  groups: OrgGroup[];
  onChange: (audience: FormAudience) => void;
}

export function AudienceSelector({
  audience,
  groups,
  onChange,
}: AudienceSelectorProps) {
  const isGroups = audience.type === "groups";
  const selected = new Set(audience.groupIds ?? []);

  function toggleGroup(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ type: "groups", groupIds: Array.from(next) });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange({ type: "organization" })}
          className={cn(
            "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
            !isGroups
              ? "border-indigo-600 bg-indigo-50"
              : "border-ink-100 bg-white hover:border-indigo-200",
          )}
        >
          <Building2 className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-ink-900">
            Whole organization
          </span>
          <span className="text-xs text-ink-500">
            Everyone in your org can respond.
          </span>
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({ type: "groups", groupIds: audience.groupIds ?? [] })
          }
          className={cn(
            "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
            isGroups
              ? "border-indigo-600 bg-indigo-50"
              : "border-ink-100 bg-white hover:border-indigo-200",
          )}
        >
          <Users className="h-5 w-5 text-indigo-600" />
          <span className="text-sm font-medium text-ink-900">
            Specific groups
          </span>
          <span className="text-xs text-ink-500">
            Only chosen audience groups.
          </span>
        </button>
      </div>

      {isGroups && (
        <div className="rounded-xl border border-ink-100 bg-white p-3">
          {groups.length === 0 ? (
            <p className="px-1 py-2 text-sm text-ink-500">
              No groups yet. Create groups in{" "}
              <a href="/settings/groups" className="text-indigo-600 hover:underline">
                Settings → Groups
              </a>
              .
            </p>
          ) : (
            <div className="space-y-1">
              {groups.map((g) => (
                <label
                  key={g.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-ink-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(g.id)}
                    onChange={() => toggleGroup(g.id)}
                    className="h-4 w-4 rounded border-ink-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="flex-1 text-sm text-ink-900">{g.name}</span>
                  <span className="text-xs text-ink-300">
                    {g.memberIds.length} members
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
