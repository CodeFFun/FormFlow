"use client";

import {
  GripVertical,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { QUESTION_TYPE_MAP, typeHasOptions, genId } from "@/lib/questionTypes";
import { cn } from "@/lib/utils";
import type { Question, QuestionOption } from "@/types/form";

export interface QuestionBlockProps {
  question: Question;
  index: number;
  total: number;
  onChange: (q: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMove: (dir: -1 | 1) => void;
}

export function QuestionBlock({
  question,
  index,
  total,
  onChange,
  onDelete,
  onDuplicate,
  onMove,
}: QuestionBlockProps) {
  const meta = QUESTION_TYPE_MAP[question.type];
  const Icon = meta?.icon;
  const showOptions = typeHasOptions(question.type);

  function updateOption(id: string, label: string) {
    onChange({
      ...question,
      options: (question.options ?? []).map((o) =>
        o.id === id ? { ...o, label, value: label } : o,
      ),
    });
  }

  function addOption() {
    const next: QuestionOption = {
      id: genId("o"),
      label: `Option ${(question.options?.length ?? 0) + 1}`,
    };
    next.value = next.label;
    onChange({ ...question, options: [...(question.options ?? []), next] });
  }

  function removeOption(id: string) {
    onChange({
      ...question,
      options: (question.options ?? []).filter((o) => o.id !== id),
    });
  }

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <GripVertical className="mt-2 h-4 w-4 shrink-0 text-ink-300" aria-hidden />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs font-medium text-ink-500">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {meta?.label}
            <span aria-hidden>·</span>
            <span>Question {index + 1}</span>
          </div>
          <Input
            className="mt-2 border-0 px-0 text-base font-medium shadow-none focus:ring-0 focus:ring-offset-0"
            placeholder="Question title"
            value={question.title}
            onChange={(e) => onChange({ ...question, title: e.target.value })}
          />
          <Input
            className="mt-1 border-0 px-0 text-sm text-ink-500 shadow-none focus:ring-0 focus:ring-offset-0"
            placeholder="Description (optional)"
            value={question.description ?? ""}
            onChange={(e) =>
              onChange({ ...question, description: e.target.value })
            }
          />

          {showOptions && (
            <div className="mt-3 space-y-2">
              {(question.options ?? []).map((opt) => (
                <div key={opt.id} className="flex items-center gap-2">
                  <span className="h-4 w-4 shrink-0 rounded-full border border-ink-300" />
                  <Input
                    className="h-9"
                    value={opt.label}
                    onChange={(e) => updateOption(opt.id, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    className="rounded-md p-1 text-ink-300 hover:bg-ink-100 hover:text-coral-600"
                    aria-label="Remove option"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
              >
                <Plus className="h-4 w-4" /> Add option
              </button>
            </div>
          )}

          {question.type === "rating" && (
            <div className="mt-3 flex gap-1 text-ink-300">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="text-2xl">
                  ★
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100 disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="rounded-md p-1 text-ink-500 hover:bg-ink-100 disabled:opacity-30"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
        <div className={cn("w-40")}>
          <Toggle
            checked={question.required}
            onChange={(v) => onChange({ ...question, required: v })}
            label="Required"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-ink-500 hover:bg-ink-100 hover:text-ink-900"
          >
            <Copy className="h-4 w-4" /> Duplicate
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-coral-600 hover:bg-coral-50"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
