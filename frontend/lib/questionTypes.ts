import {
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  ChevronDownSquare,
  Hash,
  Mail,
  Calendar,
  Star,
  Paperclip,
  type LucideIcon,
} from "lucide-react";
import type { QuestionType } from "@/types/form";

export interface QuestionTypeMeta {
  type: QuestionType;
  label: string;
  icon: LucideIcon;
  hasOptions: boolean;
  group: "text" | "choice" | "other";
}

export const QUESTION_TYPES: QuestionTypeMeta[] = [
  { type: "short_text", label: "Short text", icon: Type, hasOptions: false, group: "text" },
  { type: "long_text", label: "Long text", icon: AlignLeft, hasOptions: false, group: "text" },
  { type: "email", label: "Email", icon: Mail, hasOptions: false, group: "text" },
  { type: "number", label: "Number", icon: Hash, hasOptions: false, group: "other" },
  { type: "date", label: "Date", icon: Calendar, hasOptions: false, group: "other" },
  { type: "multiple_choice", label: "Multiple choice", icon: CircleDot, hasOptions: true, group: "choice" },
  { type: "checkbox", label: "Checkboxes", icon: CheckSquare, hasOptions: true, group: "choice" },
  { type: "dropdown", label: "Dropdown", icon: ChevronDownSquare, hasOptions: true, group: "choice" },
  { type: "rating", label: "Rating", icon: Star, hasOptions: false, group: "other" },
  { type: "file_upload", label: "File upload", icon: Paperclip, hasOptions: false, group: "other" },
];

export const QUESTION_TYPE_MAP: Record<QuestionType, QuestionTypeMeta> =
  Object.fromEntries(QUESTION_TYPES.map((q) => [q.type, q])) as Record<
    QuestionType,
    QuestionTypeMeta
  >;

export function typeHasOptions(type: QuestionType): boolean {
  return QUESTION_TYPE_MAP[type]?.hasOptions ?? false;
}

let counter = 0;
export function genId(prefix = "q"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}
