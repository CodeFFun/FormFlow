import { ProgressBar } from "@/components/ui/ProgressBar";

export function FillProgressBar({
  answered,
  total,
}: {
  answered: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : (answered / total) * 100;
  return (
    <div className="sticky top-0 z-10 bg-ink-50/90 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <ProgressBar value={pct} className="flex-1" />
        <span className="text-xs font-medium text-ink-500">
          {answered}/{total}
        </span>
      </div>
    </div>
  );
}
