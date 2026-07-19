import type { Question } from "@/types/form";
import type { AnswerValue } from "@/types/submission";

export interface AnswerFieldProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  error?: string;
  accent?: string;
}
