"use client";

import { useState } from "react";
import { Link2, Copy, Check, Trash2, Plus } from "lucide-react";
import { share as shareService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import type { ShareLink } from "@/types/share";

function publicUrl(token: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/f/${token}`;
}

export interface MagicLinkPanelProps {
  formId: string;
  links: ShareLink[];
  onChange: () => void;
}

export function MagicLinkPanel({ formId, links, onChange }: MagicLinkPanelProps) {
  const { success, error: toastError } = useToast();
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const magicLinks = links.filter(
    (l) => l.type === "magic_link" && l.status === "active",
  );

  async function createLink() {
    setCreating(true);
    try {
      await shareService.create({ formId, type: "magic_link" });
      success("Magic link created");
      onChange();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not create link.");
    } finally {
      setCreating(false);
    }
  }

  async function copy(token: string) {
    await navigator.clipboard.writeText(publicUrl(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 1500);
  }

  async function revoke(id: string) {
    try {
      await shareService.revoke(id);
      success("Link revoked");
      onChange();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not revoke.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg text-ink-900">Magic links</h3>
          <p className="text-sm text-ink-500">
            Anyone with the link can open and submit the form.
          </p>
        </div>
        <Button size="sm" onClick={createLink} loading={creating}>
          <Plus className="h-4 w-4" /> New link
        </Button>
      </div>

      {magicLinks.length === 0 ? (
        <p className="rounded-md border border-dashed border-ink-100 px-4 py-8 text-center text-sm text-ink-500">
          No magic links yet. Create one to share publicly.
        </p>
      ) : (
        <div className="space-y-2">
          {magicLinks.map((link) => (
            <div
              key={link._id}
              className="flex items-center gap-3 rounded-md border border-ink-100 bg-white px-4 py-3"
            >
              <Link2 className="h-4 w-4 shrink-0 text-ink-300" />
              <code className="flex-1 truncate text-xs text-ink-900">
                {publicUrl(link.token)}
              </code>
              <Badge tone={link.status === "active" ? "teal" : "neutral"}>
                {link.status}
              </Badge>
              <span className="hidden text-xs text-ink-500 sm:inline">
                {link.usageCount} uses
              </span>
              <button
                type="button"
                onClick={() => copy(link.token)}
                className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                aria-label="Copy link"
              >
                {copied === link.token ? (
                  <Check className="h-4 w-4 text-teal-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => revoke(link._id)}
                className="rounded-md p-1.5 text-ink-500 hover:bg-coral-50 hover:text-coral-600"
                aria-label="Revoke link"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      {magicLinks.some((l) => l.expiresAt) && (
        <p className="text-xs text-ink-300">
          Some links expire — check {formatDate(magicLinks.find((l) => l.expiresAt)?.expiresAt)}.
        </p>
      )}
    </div>
  );
}
