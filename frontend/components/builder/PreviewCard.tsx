import { Star } from "lucide-react";
import { Label } from "@/components/ui/Label";
import { QUESTION_TYPE_MAP } from "@/lib/questionTypes";
import type { FormDoc, Question } from "@/types/form";

function PreviewField({ question }: { question: Question }) {
  switch (question.type) {
    case "long_text":
      return (
        <div className="h-24 rounded-md border border-ink-100 bg-ink-50/50" />
      );
    case "multiple_choice":
    case "checkbox":
      return (
        <div className="space-y-2">
          {(question.options ?? []).map((o) => (
            <div key={o.id} className="flex items-center gap-2">
              <span
                className={
                  question.type === "checkbox"
                    ? "h-4 w-4 rounded border border-ink-300"
                    : "h-4 w-4 rounded-full border border-ink-300"
                }
              />
              <span className="text-sm text-ink-900">{o.label}</span>
            </div>
          ))}
        </div>
      );
    case "dropdown":
      return (
        <div className="flex h-11 items-center rounded-md border border-ink-100 bg-ink-50/50 px-3 text-sm text-ink-300">
          Select an option…
        </div>
      );
    case "rating":
      return (
        <div className="flex gap-1 text-ink-300">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className="h-6 w-6" />
          ))}
        </div>
      );
    case "file_upload":
      return (
        <div className="flex h-20 items-center justify-center rounded-md border-2 border-dashed border-ink-100 text-sm text-ink-300">
          Upload a file
        </div>
      );
    default:
      return (
        <div className="h-11 rounded-md border border-ink-100 bg-ink-50/50" />
      );
  }
}

export function PreviewCard({ form }: { form: FormDoc }) {
  const questions = [...(form.questions ?? [])].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
      <div className="h-2 bg-indigo-600" />
      <div className="space-y-6 p-6">
        <div>
          <h1 className="font-serif text-2xl text-ink-900">
            {form.title || "Untitled form"}
          </h1>
          {form.description && (
            <p className="mt-2 text-sm text-ink-500">{form.description}</p>
          )}
        </div>

        {questions.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink-100 px-4 py-8 text-center text-sm text-ink-500">
            No questions to preview yet.
          </p>
        ) : (
          questions.map((q, i) => (
            <div key={q.id} className="space-y-2">
              <Label required={q.required}>
                {i + 1}. {q.title || QUESTION_TYPE_MAP[q.type]?.label}
              </Label>
              {q.description && (
                <p className="text-xs text-ink-500">{q.description}</p>
              )}
              <PreviewField question={q} />
            </div>
          ))
        )}

        <button
          type="button"
          disabled
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white opacity-80"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
