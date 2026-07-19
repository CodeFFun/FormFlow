"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Trash2 } from "lucide-react";
import { forms as formService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import type { FormDoc } from "@/types/form";

export interface DangerZoneProps {
  form: FormDoc;
  onUpdated: () => void;
}

export function DangerZone({ form, onUpdated }: DangerZoneProps) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [closing, setClosing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function closeForm() {
    setClosing(true);
    try {
      await formService.close(form._id);
      success("Form closed.");
      onUpdated();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not close form.");
    } finally {
      setClosing(false);
    }
  }

  async function deleteForm() {
    setDeleting(true);
    try {
      await formService.remove(form._id);
      success("Form deleted.");
      router.push("/dashboard");
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not delete form.");
      setDeleting(false);
    }
  }

  return (
    <Card className="border-coral-600/30">
      <CardHeader className="border-coral-600/20">
        <h3 className="font-serif text-lg text-coral-600">Danger zone</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        {form.status === "published" && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-ink-900">Close form</p>
              <p className="text-sm text-ink-500">
                Stop accepting new responses. Existing responses are kept.
              </p>
            </div>
            <Button variant="outline" onClick={closeForm} loading={closing}>
              <Lock className="h-4 w-4" /> Close
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink-900">Delete form</p>
            <p className="text-sm text-ink-500">
              Permanently remove this form, its responses, and history.
            </p>
          </div>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </CardBody>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this form?"
        description={`"${form.title}" and everything in it will be permanently deleted.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={deleteForm}>
              Delete form
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-500">This action cannot be undone.</p>
      </Modal>
    </Card>
  );
}
