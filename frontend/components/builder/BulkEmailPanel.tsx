"use client";

import { useState } from "react";
import { Mail, Copy, Check, Trash2, Send } from "lucide-react";
import { z } from "zod";
import { share as shareService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { ShareLink } from "@/types/share";

const emailSchema = z.string().email();

function publicUrl(token: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/f/${token}`;
}

export interface BulkEmailPanelProps {
  formId: string;
  links: ShareLink[];
  onChange: () => void;
}

export function BulkEmailPanel({ formId, links, onChange }: BulkEmailPanelProps) {
  const { success, error: toastError } = useToast();
  const [raw, setRaw] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const invites = links.filter(
    (l) => l.type === "individual_invite" && l.status === "active",
  );

  async function sendInvites() {
    const emails = Array.from(
      new Set(
        raw
          .split(/[\s,;]+/)
          .map((e) => e.trim())
          .filter(Boolean),
      ),
    );
    const valid = emails.filter((e) => emailSchema.safeParse(e).success);
    const invalid = emails.filter((e) => !emailSchema.safeParse(e).success);
    if (valid.length === 0) {
      toastError("Enter at least one valid email.");
      return;
    }
    setSending(true);
    let created = 0;
    try {
      for (const email of valid) {
        try {
          await shareService.create({ formId, type: "individual_invite", email });
          created++;
        } catch {
        }
      }
      success(
        `Sent ${created} invite${created === 1 ? "" : "s"}${
          invalid.length ? `, skipped ${invalid.length} invalid` : ""
        }.`,
      );
      setRaw("");
      onChange();
    } finally {
      setSending(false);
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
      onChange();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not revoke.");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-serif text-lg text-ink-900">Email invitations</h3>
        <p className="text-sm text-ink-500">
          Each invite is bound to one email address and single-use by default.
        </p>
      </div>

      <Textarea
        rows={3}
        placeholder="alice@company.com, bob@company.com"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={sendInvites} loading={sending}>
          <Send className="h-4 w-4" /> Send invites
        </Button>
      </div>

      {invites.length > 0 && (
        <div className="space-y-2">
          {invites.map((link) => (
            <div
              key={link._id}
              className="flex items-center gap-3 rounded-md border border-ink-100 bg-white px-4 py-3"
            >
              <Mail className="h-4 w-4 shrink-0 text-ink-300" />
              <span className="flex-1 truncate text-sm text-ink-900">
                {link.email}
              </span>
              <Badge tone={link.status === "active" ? "teal" : "neutral"}>
                {link.status}
              </Badge>
              <button
                type="button"
                onClick={() => copy(link.token)}
                className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-900"
                aria-label="Copy invite link"
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
                aria-label="Revoke invite"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
