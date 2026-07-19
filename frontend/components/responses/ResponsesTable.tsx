"use client";

import { useRouter } from "next/navigation";
import { Trash2, ChevronRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { displayAnswer } from "@/lib/answerDisplay";
import type { FormDoc } from "@/types/form";
import type { Submission } from "@/types/submission";

export interface ResponsesTableProps {
  form: FormDoc;
  submissions: Submission[];
  onDelete: (submission: Submission) => void;
}

export function ResponsesTable({ form, submissions, onDelete }: ResponsesTableProps) {
  const router = useRouter();
  const previewQuestions = [...(form.questions ?? [])]
    .sort((a, b) => a.position - b.position)
    .slice(0, 2);

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-ink-100 bg-ink-50 text-xs uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-4 py-3 font-medium">Respondent</th>
            {previewQuestions.map((q) => (
              <th key={q.id} className="px-4 py-3 font-medium">
                <span className="line-clamp-1 max-w-[180px]">{q.title}</span>
              </th>
            ))}
            <th className="px-4 py-3 font-medium">Submitted</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => {
            const byId = new Map(s.answers.map((a) => [a.questionId, a.value]));
            const who =
              s.respondent?.name ||
              s.respondent?.email ||
              (s.respondent?.userId ? "Org member" : "Anonymous");
            return (
              <tr
                key={s._id}
                className="cursor-pointer border-b border-ink-50 last:border-0 hover:bg-ink-50"
                onClick={() =>
                  router.push(`/forms/${form._id}/responses/${s._id}`)
                }
              >
                <td className="px-4 py-3 font-medium text-ink-900">{who}</td>
                {previewQuestions.map((q) => (
                  <td key={q.id} className="px-4 py-3 text-ink-500">
                    <span className="line-clamp-1 max-w-[180px]">
                      {displayAnswer(q, byId.get(q.id))}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-3 text-ink-500">
                  {formatDateTime(s.submittedAt || s.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(s);
                      }}
                      className="rounded-md p-1.5 text-ink-300 hover:bg-coral-50 hover:text-coral-600"
                      aria-label="Delete response"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4 text-ink-300" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
