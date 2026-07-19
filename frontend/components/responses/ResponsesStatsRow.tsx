import { Inbox, Calendar, Hash } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Submission } from "@/types/submission";

export function ResponsesStatsRow({
  total,
  submissions,
  maxResponses,
}: {
  total: number;
  submissions: Submission[];
  maxResponses?: number;
}) {
  const latest = submissions[0]?.submittedAt ?? submissions[0]?.createdAt;
  const stats = [
    { icon: Inbox, label: "Total responses", value: String(total) },
    {
      icon: Hash,
      label: "Response limit",
      value: maxResponses ? String(maxResponses) : "Unlimited",
    },
    { icon: Calendar, label: "Latest", value: latest ? formatDate(latest) : "—" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="flex items-center gap-4 p-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-serif text-xl text-ink-900">{s.value}</p>
              <p className="text-xs text-ink-500">{s.label}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
