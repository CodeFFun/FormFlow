import type { FormDoc, Question } from "@/types/form";
import type { Answer, AnswerValue } from "@/types/submission";

function optionLabel(question: Question, raw: string): string {
  const opt = question.options?.find((o) => o.id === raw || o.value === raw);
  return opt?.label ?? raw;
}

export function displayAnswer(
  question: Question | undefined,
  value: AnswerValue | undefined,
): string {
  if (value == null || value === "") return "—";
  if (!question) return Array.isArray(value) ? value.join(", ") : String(value);

  switch (question.type) {
    case "multiple_choice":
    case "dropdown":
      return optionLabel(question, String(value));
    case "checkbox":
      return Array.isArray(value)
        ? value.map((v) => optionLabel(question, v)).join(", ")
        : String(value);
    case "rating":
      return `${value} / 5`;
    case "file_upload":
      return Array.isArray(value)
        ? `${value.length} file${value.length === 1 ? "" : "s"}`
        : "1 file";
    default:
      return Array.isArray(value) ? value.join(", ") : String(value);
  }
}

export function pairAnswers(form: FormDoc, answers: Answer[]) {
  const byId = new Map(answers.map((a) => [a.questionId, a.value]));
  return [...(form.questions ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((q) => ({ question: q, value: byId.get(q.id) }));
}
