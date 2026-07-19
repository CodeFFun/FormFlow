"use client";

import { Label } from "@/components/ui/Label";
import { AnswerField } from "./answers/AnswerField";
import { InlineFieldError } from "./InlineFieldError";
import type { Question } from "@/types/form";
import type { AnswerValue } from "@/types/submission";

export interface QuestionCardProps {
  question: Question;
  index: number;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  error?: string;
  formId: string;
  allowFileUpload?: boolean;
}

export function QuestionCard({
  question,
  index,
  value,
  onChange,
  error,
  formId,
  allowFileUpload,
}: QuestionCardProps) {
  return (
    <div className="rounded-xl border border-ink-100 bg-white p-6 shadow-sm">
      <Label required={question.required} className="text-base">
        {index + 1}. {question.title}
      </Label>
      {question.description && (
        <p className="mt-1 text-sm text-ink-500">{question.description}</p>
      )}
      <div className="mt-4">
        <AnswerField
          question={question}
          value={value}
          onChange={onChange}
          error={error}
          formId={formId}
          allowFileUpload={allowFileUpload}
        />
      </div>
      <InlineFieldError message={error} />
    </div>
  );
}
