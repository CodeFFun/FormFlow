"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Link2, Mail, Users } from "lucide-react";
import { share as shareService, submissions as submissionService } from "@/lib/services";
import { MagicLinkPanel } from "@/components/builder/MagicLinkPanel";
import { BulkEmailPanel } from "@/components/builder/BulkEmailPanel";
import { TeamSharePanel } from "@/components/builder/TeamSharePanel";
import { ResponseTracker } from "@/components/builder/ResponseTracker";
import { Card, CardBody } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

type ShareTab = "magic" | "email" | "team";

export default function FormSharePage() {
  const { formId } = useParams<{ formId: string }>();
  const [tab, setTab] = useState<ShareTab>("magic");

  const { data: links, isLoading, mutate } = useSWR(["share", formId], () =>
    shareService.list(formId),
  );
  const { data: stats } = useSWR(["stats", formId], () =>
    submissionService.stats(formId),
  );

  const allLinks = links ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={`/forms/${formId}`}
          className="flex items-center gap-2 text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to builder
        </Link>
      </div>

      <div>
        <h1 className="font-serif text-3xl text-ink-900">Share your form</h1>
        <p className="mt-1 text-sm text-ink-500">
          Distribute via a public link or send individual email invitations.
        </p>
      </div>

      <ResponseTracker total={stats?.total ?? 0} links={allLinks} />

      <div className="flex gap-2">
        {([
          { key: "magic", label: "Magic link", icon: Link2 },
          { key: "email", label: "Email invites", icon: Mail },
          { key: "team", label: "Team & groups", icon: Users },
        ] as const).map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium",
                tab === t.key
                  ? "bg-indigo-600 text-white"
                  : "text-ink-500 hover:bg-ink-100",
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardBody>
          {isLoading ? (
            <LoadingState label="Loading share links…" />
          ) : tab === "magic" ? (
            <MagicLinkPanel
              formId={formId}
              links={allLinks}
              onChange={() => void mutate()}
            />
          ) : tab === "email" ? (
            <BulkEmailPanel
              formId={formId}
              links={allLinks}
              onChange={() => void mutate()}
            />
          ) : (
            <TeamSharePanel formId={formId} />
          )}
        </CardBody>
      </Card>
    </div>
  );
}
