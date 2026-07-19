import type { Question } from "@/types/form";
import type { Answer, AnswerValue } from "@/types/submission";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmpty(value: AnswerValue | undefined): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "number") return Number.isNaN(value);
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function validateAnswers(
  questions: Question[],
  answers: Record<string, AnswerValue | undefined>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of questions) {
    const value = answers[q.id];
    const empty = isEmpty(value);

    if (q.required && empty) {
      errors[q.id] = "This question is required.";
      continue;
    }
    if (empty) continue;

    if (q.type === "email" && typeof value === "string" && !EMAIL_RE.test(value)) {
      errors[q.id] = "Enter a valid email address.";
    }
    if (q.type === "number" && typeof value !== "number") {
      errors[q.id] = "Enter a number.";
    }
  }
  return errors;
}

export function buildAnswers(
  questions: Question[],
  answers: Record<string, AnswerValue | undefined>,
): Answer[] {
  const result: Answer[] = [];
  for (const q of questions) {
    const value = answers[q.id];
    if (isEmpty(value)) continue;
    result.push({ questionId: q.id, value: value as AnswerValue });
  }
  return result;
}
