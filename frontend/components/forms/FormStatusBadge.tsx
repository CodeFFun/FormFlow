import { Badge } from "@/components/ui/Badge";
import type { FormStatus } from "@/types/form";

const map: Record<FormStatus, { tone: "neutral" | "indigo" | "teal" | "coral" | "amber"; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  published: { tone: "teal", label: "Published" },
  closed: { tone: "coral", label: "Closed" },
  archived: { tone: "amber", label: "Archived" },
};

export function FormStatusBadge({ status }: { status: FormStatus }) {
  const { tone, label } = map[status] ?? map.draft;
  return <Badge tone={tone}>{label}</Badge>;
}
