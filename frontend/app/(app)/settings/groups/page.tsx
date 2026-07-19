"use client";

import { useState } from "react";
import useSWR from "swr";
import { Plus, UsersRound } from "lucide-react";
import { orgs as orgService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useOrg } from "@/components/providers/OrgProvider";
import { GroupCard } from "@/components/settings/GroupCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import type { OrgGroup } from "@/types/organization";

export default function GroupsSettingsPage() {
  const { currentOrg, isOwner, isAdmin, loading } = useOrg();
  const { success, error: toastError } = useToast();
  const canManage = isOwner || isAdmin;
  const orgId = currentOrg?._id;

  const { data: groups, isLoading, mutate } = useSWR(
    orgId ? ["groups", orgId] : null,
    () => orgService.listGroups(orgId as string),
  );

  const [editing, setEditing] = useState<OrgGroup | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<OrgGroup | null>(null);

  if (loading || !currentOrg) return <LoadingState />;

  function openCreate() {
    setEditing(null);
    setName("");
    setMemberIds([]);
    setCreating(true);
  }

  function openEdit(group: OrgGroup) {
    setEditing(group);
    setName(group.name);
    setMemberIds(group.memberIds);
    setCreating(true);
  }

  function toggleMember(id: string) {
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function save() {
    if (!orgId || !name.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await orgService.updateGroup(orgId, editing.id, { name, memberIds });
        success("Group updated");
      } else {
        await orgService.createGroup(orgId, { name, memberIds });
        success("Group created");
      }
      setCreating(false);
      void mutate();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not save group.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!orgId || !toDelete) return;
    try {
      await orgService.deleteGroup(orgId, toDelete.id);
      success("Group deleted");
      setToDelete(null);
      void mutate();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not delete.");
    }
  }

  const list = groups ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-lg text-ink-900">Audience groups</h2>
          <p className="text-sm text-ink-500">
            Named subsets of members you can target forms to.
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New group
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No groups yet"
          description="Create groups to send forms to specific people."
          action={
            canManage ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Create a group
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((g) => (
            <GroupCard
              key={g.id}
              group={g}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={editing ? "Edit group" : "New group"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving} disabled={!name.trim()}>
              {editing ? "Save" : "Create"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="groupName" required>
              Group name
            </Label>
            <Input
              id="groupName"
              className="mt-1.5"
              placeholder="Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Members</Label>
            <div className="mt-1.5 max-h-60 space-y-1 overflow-y-auto rounded-md border border-ink-100 p-2">
              {currentOrg.members.map((m) => {
                const label =
                  (m.user
                    ? `${m.user.firstName} ${m.user.lastName}`.trim()
                    : "") ||
                  m.user?.email ||
                  m.userId;
                return (
                  <label
                    key={m.userId}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-ink-50"
                  >
                    <input
                      type="checkbox"
                      checked={memberIds.includes(m.userId)}
                      onChange={() => toggleMember(m.userId)}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-600"
                    />
                    <Avatar
                      name={m.user?.firstName}
                      email={m.user?.email}
                      src={m.user?.avatarUrl}
                      size="sm"
                    />
                    <span className="flex-1 truncate text-sm text-ink-900">
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete group?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">
          Forms targeting only this group will fall back to no audience. This
          can&apos;t be undone.
        </p>
      </Modal>
    </div>
  );
}
