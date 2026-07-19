import { CheckCircle2 } from "lucide-react";

export interface SubmissionConfirmationProps {
  message?: string;
  orgName?: string;
}

export function SubmissionConfirmation({
  message,
  orgName,
}: SubmissionConfirmationProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
      <div className="h-2 bg-teal-600" />
      <div className="p-10 text-center">
        <span className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h1 className="font-serif text-3xl text-ink-900">
          Response submitted
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink-500">
          {message || "Thanks for your response!"}
        </p>
        {orgName && (
          <p className="mt-6 text-xs text-ink-300">Sent to {orgName}</p>
        )}
      </div>
    </div>
  );
}
