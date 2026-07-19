import { Inbox, TrendingUp, Clock, PieChart } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AnalyticsMetrics({ total }: { total: number }) {
  const metrics = [
    { icon: Inbox, label: "Total responses", value: String(total), real: true },
    { icon: TrendingUp, label: "Completion rate", value: "—", real: false },
    { icon: Clock, label: "Avg. time to complete", value: "—", real: false },
    { icon: PieChart, label: "Responses by question", value: "—", real: false },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-serif text-2xl text-ink-900">{m.value}</p>
              <p className="text-xs text-ink-500">{m.label}</p>
            </Card>
          );
        })}
      </div>
      <div className="rounded-xl border border-dashed border-ink-100 bg-white px-5 py-4 text-sm text-ink-500">
        <span className="font-medium text-ink-900">More analytics coming soon.</span>{" "}
        Detailed breakdowns, charts, and timing metrics aren&apos;t available from
        the API yet — only the total response count is reported today.
      </div>
    </div>
  );
}
