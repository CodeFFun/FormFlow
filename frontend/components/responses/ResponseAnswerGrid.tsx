import Image from "next/image";
import { QUESTION_TYPE_MAP } from "@/lib/questionTypes";
import { displayAnswer, pairAnswers } from "@/lib/answerDisplay";
import { uploadUrl } from "@/lib/utils";
import type { FormDoc } from "@/types/form";
import type { Submission, UploadedFile } from "@/types/submission";

export interface ResponseAnswerGridProps {
  form: FormDoc;
  submission: Submission;
  files?: UploadedFile[];
}

export function ResponseAnswerGrid({ form, submission, files }: ResponseAnswerGridProps) {
  const pairs = pairAnswers(form, submission.answers);

  return (
    <div className="divide-y divide-ink-100 rounded-xl border border-ink-100 bg-white">
      {pairs.map(({ question, value }) => {
        const meta = QUESTION_TYPE_MAP[question.type];
        const isFile = question.type === "file_upload";
        const fileIds = isFile && Array.isArray(value) ? value : [];
        const matchedFiles = (files ?? []).filter((f) =>
          fileIds.includes(f._id),
        );

        return (
          <div key={question.id} className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-ink-300">
              {meta?.label}
            </div>
            <p className="mt-1 font-medium text-ink-900">{question.title}</p>
            {isFile ? (
              matchedFiles.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-3">
                  {matchedFiles.map((f) => (
                    <a
                      key={f._id}
                      href={uploadUrl(f.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block overflow-hidden rounded-md border border-ink-100"
                    >
                      <Image
                        src={uploadUrl(f.url) ?? ""}
                        alt={f.filename}
                        width={120}
                        height={120}
                        className="h-24 w-24 object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-1.5 text-sm text-ink-500">
                  {displayAnswer(question, value)}
                </p>
              )
            ) : (
              <p className="mt-1.5 text-sm text-ink-900">
                {displayAnswer(question, value)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
