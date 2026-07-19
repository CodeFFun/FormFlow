"use client";

import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import type { AnswerFieldProps } from "./types";

export function MultipleChoiceAnswer({ question, value, onChange }: AnswerFieldProps) {
  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => {
        const selected = value === opt.id;
        return (
          <label
            key={opt.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors",
              selected
                ? "border-indigo-600 bg-indigo-50"
                : "border-ink-100 bg-white hover:border-indigo-200",
            )}
          >
            <input
              type="radio"
              name={question.id}
              checked={selected}
              onChange={() => onChange(opt.id)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-600"
            />
            <span className="text-sm text-ink-900">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function CheckboxAnswer({ question, value, onChange }: AnswerFieldProps) {
  const selected = new Set(Array.isArray(value) ? value : []);
  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  }
  return (
    <div className="space-y-2">
      {(question.options ?? []).map((opt) => {
        const checked = selected.has(opt.id);
        return (
          <label
            key={opt.id}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors",
              checked
                ? "border-indigo-600 bg-indigo-50"
                : "border-ink-100 bg-white hover:border-indigo-200",
            )}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(opt.id)}
              className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-600"
            />
            <span className="text-sm text-ink-900">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function DropdownAnswer({ question, value, onChange, error }: AnswerFieldProps) {
  return (
    <Select
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      aria-label={question.title}
    >
      <option value="">Select an option…</option>
      {(question.options ?? []).map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
