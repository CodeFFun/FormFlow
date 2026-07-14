import { FileText, Send, FileCheck2, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { FormDoc } from "@/types/form";

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: number;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-serif text-2xl text-ink-900">{value}</p>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
    </Card>
  );
}

export function StatsBar({ forms }: { forms: FormDoc[] }) {
  const total = forms.length;
  const published = forms.filter((f) => f.status === "published").length;
  const drafts = forms.filter((f) => f.status === "draft").length;
  const closed = forms.filter((f) => f.status === "closed").length;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Stat icon={FileText} label="Total forms" value={total} />
      <Stat icon={Send} label="Published" value={published} />
      <Stat icon={FileCheck2} label="Drafts" value={drafts} />
      <Stat icon={Lock} label="Closed" value={closed} />
    </div>
  );
}
