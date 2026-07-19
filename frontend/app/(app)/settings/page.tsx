"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { orgs as orgService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useOrg } from "@/components/providers/OrgProvider";
import { LogoUpload } from "@/components/settings/LogoUpload";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

export default function OrgProfilePage() {
  const router = useRouter();
  const { currentOrg, isOwner, isAdmin, loading, refresh } = useOrg();
  const { success, error: toastError } = useToast();
  const canEdit = isOwner || isAdmin;

  const [name, setName] = useState("");
  const [primary, setPrimary] = useState("#534AB7");
  const [secondary, setSecondary] = useState("#0D7A5F");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      setName(currentOrg.name);
      setPrimary(currentOrg.branding?.primaryColor ?? "#534AB7");
      setSecondary(currentOrg.branding?.secondaryColor ?? "#0D7A5F");
    }
  }, [currentOrg]);

  if (loading || !currentOrg) return <LoadingState />;

  async function uploadLogo(file: File) {
    if (!currentOrg) return;
    try {
      await orgService.uploadLogo(currentOrg._id, file);
      success("Logo updated");
      refresh();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Upload failed.");
    }
  }

  async function save() {
    if (!currentOrg) return;
    setSaving(true);
    try {
      await orgService.update(currentOrg._id, {
        name,
        branding: {
          ...currentOrg.branding,
          primaryColor: primary,
          secondaryColor: secondary,
        },
      });
      success("Organization updated");
      refresh();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteOrg() {
    if (!currentOrg) return;
    setDeleting(true);
    try {
      await orgService.remove(currentOrg._id);
      success("Organization deleted");
      setConfirmDelete(false);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not delete.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-serif text-lg text-ink-900">Organization profile</h2>
          <p className="mt-0.5 text-sm text-ink-500">
            Branding shown on your forms and share links.
          </p>
        </CardHeader>
        <CardBody className="space-y-6">
          <LogoUpload
            name={currentOrg.name}
            logoUrl={currentOrg.branding?.logoUrl}
            disabled={!canEdit}
            onUpload={uploadLogo}
          />
          <div>
            <Label htmlFor="orgName">Organization name</Label>
            <Input
              id="orgName"
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input className="mt-1.5" value={currentOrg.slug} disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary">Primary color</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="primary"
                  type="color"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                  disabled={!canEdit}
                  className="h-10 w-14 cursor-pointer rounded-md border border-ink-100"
                />
                <span className="text-sm text-ink-500">{primary}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="secondary">Secondary color</Label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  id="secondary"
                  type="color"
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                  disabled={!canEdit}
                  className="h-10 w-14 cursor-pointer rounded-md border border-ink-100"
                />
                <span className="text-sm text-ink-500">{secondary}</span>
              </div>
            </div>
          </div>
          {canEdit && (
            <div className="flex justify-end">
              <Button onClick={save} loading={saving}>
                Save changes
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {isOwner && (
        <Card className="border-coral-600/30">
          <CardHeader className="border-coral-600/20">
            <h2 className="font-serif text-lg text-coral-600">Danger zone</h2>
          </CardHeader>
          <CardBody className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-900">
                Delete this organization
              </p>
              <p className="text-sm text-ink-500">
                Permanently removes the organization for everyone. This can&apos;t
                be undone.
              </p>
            </div>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          </CardBody>
        </Card>
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete organization?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={deleteOrg} loading={deleting}>
              Delete organization
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">
          <span className="font-medium text-ink-900">{currentOrg.name}</span> and
          its forms, members and groups will be removed. This action is
          permanent.
        </p>
      </Modal>
    </div>
  );
}
