import { Inbox, Link2, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ShareLink } from "@/types/share";

export interface ResponseTrackerProps {
  total: number;
  links: ShareLink[];
}

export function ResponseTracker({ total, links }: ResponseTrackerProps) {
  const activeLinks = links.filter((l) => l.status === "active").length;
  const totalUses = links.reduce((sum, l) => sum + (l.usageCount ?? 0), 0);

  const stats = [
    { icon: Inbox, label: "Responses", value: total },
    { icon: Link2, label: "Active links", value: activeLinks },
    { icon: Users, label: "Link opens", value: totalUses },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label} className="flex flex-col items-start gap-2 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Icon className="h-4 w-4" />
            </span>
            <p className="font-serif text-xl text-ink-900">{s.value}</p>
            <p className="text-xs text-ink-500">{s.label}</p>
          </Card>
        );
      })}
    </div>
  );
}
