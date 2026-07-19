import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import type { Submission } from "@/types/submission";

export function ResponseMeta({ submission }: { submission: Submission }) {
  const who =
    submission.respondent?.name ||
    submission.respondent?.email ||
    (submission.respondent?.userId ? "Organization member" : "Anonymous");
  const source = submission.respondent?.userId
    ? "In-org"
    : submission.respondent?.email
      ? "Email invite"
      : "Public link";

  return (
    <div className="flex items-center justify-between rounded-xl border border-ink-100 bg-white p-5">
      <div className="flex items-center gap-3">
        <Avatar name={submission.respondent?.name} email={submission.respondent?.email} />
        <div>
          <p className="font-medium text-ink-900">{who}</p>
          {submission.respondent?.email && (
            <p className="text-sm text-ink-500">{submission.respondent.email}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <Badge tone="indigo">{source}</Badge>
        <p className="mt-1.5 text-xs text-ink-500">
          {formatDateTime(submission.submittedAt || submission.createdAt)}
        </p>
      </div>
    </div>
  );
}
