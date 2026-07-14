"use client";

import { QUESTION_TYPES } from "@/lib/questionTypes";
import type { QuestionType } from "@/types/form";

export interface QuestionTypePanelProps {
  onAdd: (type: QuestionType) => void;
}

const groups: { key: "text" | "choice" | "other"; label: string }[] = [
  { key: "text", label: "Text" },
  { key: "choice", label: "Choice" },
  { key: "other", label: "Other" },
];

export function QuestionTypePanel({ onAdd }: QuestionTypePanelProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-sm font-semibold text-ink-900">Add a question</h2>
      {groups.map((group) => (
        <div key={group.key}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-300">
            {group.label}
          </p>
          <div className="space-y-1">
            {QUESTION_TYPES.filter((q) => q.group === group.key).map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.type}
                  type="button"
                  onClick={() => onAdd(q.type)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-ink-900 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                >
                  <Icon className="h-4 w-4 text-ink-500" />
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
