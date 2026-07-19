"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X, FileImage } from "lucide-react";
import { submissions as submissionService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { AnswerFieldProps } from "./types";

interface FileUploadAnswerProps extends AnswerFieldProps {
  formId: string;
  enabled?: boolean;
}

interface LocalFile {
  id: string;
  name: string;
}

export function FileUploadAnswer({
  question,
  value,
  onChange,
  enabled = true,
  formId,
}: FileUploadAnswerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { error: toastError } = useToast();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<LocalFile[]>([]);

  const ids = Array.isArray(value) ? value : [];

  if (!enabled) {
    return (
      <div className="rounded-md border border-dashed border-ink-100 bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
        File uploads aren&apos;t available on public links. Open this form while
        signed in to attach files.
      </div>
    );
  }

  async function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await submissionService.uploadFile(
        formId,
        question.id,
        file,
      );
      setFiles((prev) => [...prev, { id: uploaded._id, name: uploaded.filename }]);
      onChange([...ids, uploaded._id]);
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    onChange(ids.filter((x) => x !== id));
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-ink-100 bg-white py-6 text-ink-500 transition-colors hover:border-indigo-200 hover:text-indigo-600"
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
        <span className="text-sm">
          {uploading ? "Uploading…" : "Click to upload an image (max 5MB)"}
        </span>
      </button>

      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-2 rounded-md border border-ink-100 bg-white px-3 py-2"
            >
              <FileImage className="h-4 w-4 text-ink-300" />
              <span className="flex-1 truncate text-sm text-ink-900">
                {f.name}
              </span>
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="rounded-md p-1 text-ink-300 hover:bg-ink-100 hover:text-coral-600"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
