"use client";

import Link from "next/link";
import { ArrowLeft, Eye, Share2, Send, Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormStatusBadge } from "@/components/forms/FormStatusBadge";
import { SaveStatusIndicator } from "./SaveStatusIndicator";
import type { SaveStatus } from "@/hooks/useAutoSave";
import type { FormStatus } from "@/types/form";

export interface BuilderNavbarProps {
  formId: string;
  title: string;
  status: FormStatus;
  saveStatus: SaveStatus;
  publishing: boolean;
  onTitleChange: (title: string) => void;
  onPublish: () => void;
  onClose: () => void;
}

export function BuilderNavbar({
  formId,
  title,
  status,
  saveStatus,
  publishing,
  onTitleChange,
  onPublish,
  onClose,
}: BuilderNavbarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-ink-100 pb-4">
      <Link
        href="/dashboard"
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100"
        aria-label="Back to dashboard"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="flex min-w-[200px] flex-1 items-center gap-3">
        <Input
          className="border-0 px-0 font-serif text-xl shadow-none focus:ring-0 focus:ring-offset-0"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled form"
          aria-label="Form title"
        />
        <FormStatusBadge status={status} />
      </div>

      <SaveStatusIndicator status={saveStatus} />

      <div className="flex items-center gap-2">
        <Link href={`/forms/${formId}/preview`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" /> Preview
          </Button>
        </Link>
        <Link href={`/forms/${formId}/share`}>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </Link>
        {status === "published" ? (
          <Button variant="danger" size="sm" onClick={onClose} loading={publishing}>
            <Lock className="h-4 w-4" /> Close
          </Button>
        ) : (
          <Button size="sm" onClick={onPublish} loading={publishing}>
            <Send className="h-4 w-4" /> Publish
          </Button>
        )}
      </div>
    </div>
  );
}
