import { ShieldCheck } from "lucide-react";

export function TrustBar({ orgName }: { orgName?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 text-xs text-ink-500">
      <ShieldCheck className="h-4 w-4 text-teal-600" />
      <span>
        Securely collected{orgName ? ` by ${orgName}` : ""} via{" "}
        <span className="font-medium text-ink-900">FormFlow</span>
      </span>
    </div>
  );
}
