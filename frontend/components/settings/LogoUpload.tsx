"use client";

import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

export interface LogoUploadProps {
  name?: string;
  logoUrl?: string;
  disabled?: boolean;
  onUpload: (file: File) => Promise<void>;
}

export function LogoUpload({ name, logoUrl, disabled, onUpload }: LogoUploadProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name} src={logoUrl} size="lg" />
      <div>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handle}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-50 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {logoUrl ? "Replace logo" : "Upload logo"}
        </button>
        <p className="mt-1.5 text-xs text-ink-500">PNG or JPG, up to 5MB.</p>
      </div>
    </div>
  );
}
