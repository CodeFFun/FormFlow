"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";
import { users as userService, auth as authService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { clearAccessToken, decodeToken } from "@/lib/auth";
import { useOrg } from "@/components/providers/OrgProvider";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, FieldError } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { userId, currentMember, refresh } = useOrg();
  const { success, error: toastError } = useToast();
  const claims = decodeToken();
  const fileRef = useRef<HTMLInputElement>(null);

  const profile = currentMember?.user;
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl);
  const [uploading, setUploading] = useState(false);

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await userService.uploadAvatar(file);
      const u = updated as { avatarUrl?: string };
      setAvatarUrl(u.avatarUrl);
      success("Avatar updated");
      refresh();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pw.next.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwError("Passwords don't match.");
      return;
    }
    setPwError(undefined);
    toastError("Changing your password isn't available yet.");
  }

  async function logoutAfterDelete() {
    try {
      await authService.logout();
    } catch {
    }
    clearAccessToken();
    router.replace("/login");
  }

  const displayName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : claims?.username;

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <h2 className="font-serif text-lg text-ink-900">Profile</h2>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar
              name={displayName}
              email={claims?.email}
              src={avatarUrl}
              size="lg"
            />
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={uploadAvatar}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-50 disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Change avatar
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input className="mt-1.5" value={displayName ?? ""} disabled />
            </div>
            <div>
              <Label>Username</Label>
              <Input
                className="mt-1.5"
                value={profile?.username ?? claims?.username ?? ""}
                disabled
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Email</Label>
              <Input
                className="mt-1.5"
                value={profile?.email ?? claims?.email ?? ""}
                disabled
              />
            </div>
          </div>
          <p className="text-xs text-ink-300">
            Profile details are managed by your administrator.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-serif text-lg text-ink-900">Change password</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <Label htmlFor="cur">Current password</Label>
              <Input
                id="cur"
                type="password"
                className="mt-1.5"
                value={pw.current}
                onChange={(e) => setPw((p) => ({ ...p, current: e.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="next">New password</Label>
                <Input
                  id="next"
                  type="password"
                  className="mt-1.5"
                  value={pw.next}
                  onChange={(e) => setPw((p) => ({ ...p, next: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="confirm">Confirm</Label>
                <Input
                  id="confirm"
                  type="password"
                  className="mt-1.5"
                  value={pw.confirm}
                  onChange={(e) =>
                    setPw((p) => ({ ...p, confirm: e.target.value }))
                  }
                />
              </div>
            </div>
            <FieldError message={pwError} />
            <div className="flex justify-end">
              <Button type="submit" variant="outline">
                Update password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="border-coral-600/30">
        <CardHeader className="border-coral-600/20">
          <h2 className="font-serif text-lg text-coral-600">Danger zone</h2>
        </CardHeader>
        <CardBody className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink-900">Sign out everywhere</p>
            <p className="text-sm text-ink-500">
              End your session on this device.
            </p>
          </div>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            Sign out
          </Button>
        </CardBody>
      </Card>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Sign out?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={logoutAfterDelete}>
              Sign out
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">
          You&apos;ll need to sign in again to access your forms.
        </p>
      </Modal>
    </div>
  );
}
