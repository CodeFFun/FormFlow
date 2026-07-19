import { Check, Loader2, CloudOff } from "lucide-react";
import type { SaveStatus } from "@/hooks/useAutoSave";

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-ink-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-teal-600">
        <Check className="h-3.5 w-3.5" /> All changes saved
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-coral-600">
        <CloudOff className="h-3.5 w-3.5" /> Couldn&apos;t save
      </span>
    );
  }
  return <span className="text-xs text-ink-300">Up to date</span>;
}
