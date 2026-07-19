import { AlertCircle } from "lucide-react";

export function InlineFieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-coral-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}
