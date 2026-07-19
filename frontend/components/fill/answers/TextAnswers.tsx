"use client";

import { Input, Textarea } from "@/components/ui/Input";
import type { AnswerFieldProps } from "./types";

export function ShortTextAnswer({ question, value, onChange, error }: AnswerFieldProps) {
  return (
    <Input
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your answer"
      error={error}
      aria-label={question.title}
    />
  );
}

export function LongTextAnswer({ question, value, onChange, error }: AnswerFieldProps) {
  return (
    <Textarea
      rows={4}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your answer"
      error={error}
      aria-label={question.title}
    />
  );
}

export function EmailAnswer({ question, value, onChange, error }: AnswerFieldProps) {
  return (
    <Input
      type="email"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder="name@example.com"
      error={error}
      aria-label={question.title}
    />
  );
}

export function NumberAnswer({ question, value, onChange, error }: AnswerFieldProps) {
  return (
    <Input
      type="number"
      value={typeof value === "number" ? value : ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? "" : Number(e.target.value))
      }
      placeholder="0"
      error={error}
      aria-label={question.title}
    />
  );
}

export function DateAnswer({ question, value, onChange, error }: AnswerFieldProps) {
  return (
    <Input
      type="date"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      aria-label={question.title}
    />
  );
}
