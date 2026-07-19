export type FormStatus = "draft" | "published" | "closed" | "archived";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkbox"
  | "dropdown"
  | "number"
  | "email"
  | "date"
  | "rating"
  | "file_upload";

export type LogicAction = "show" | "hide" | "jump_to";
export type LogicOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty";

export type FormAudienceType = "organization" | "groups";

export interface QuestionOption {
  id: string;
  label: string;
  value?: string;
}

export interface QuestionLogic {
  action: LogicAction;
  operator: LogicOperator;
  sourceQuestionId: string;
  value?: string;
  targetQuestionId: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  position: number;
  options?: QuestionOption[];
  logic?: QuestionLogic[];
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  requireLogin: boolean;
  showProgressBar: boolean;
  confirmationMessage?: string;
  closeAt?: string;
  maxResponses?: number;
}

export interface FormAudience {
  type: FormAudienceType;
  groupIds?: string[];
}

export interface FormDoc {
  _id: string;
  orgId: string;
  title: string;
  description?: string;
  status: FormStatus;
  questions: Question[];
  settings: FormSettings;
  audience: FormAudience;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormPayload {
  orgId: string;
  title: string;
  description?: string;
  questions?: Question[];
  settings?: Partial<FormSettings>;
  audience?: FormAudience;
}

export type UpdateFormPayload = Partial<
  Pick<FormDoc, "title" | "description" | "questions" | "settings" | "audience">
>;

export type CommentStatus = "open" | "resolved";

export interface FormComment {
  _id: string;
  formId: string;
  questionId?: string;
  body: string;
  status: CommentStatus;
  createdBy: string;
  createdAt: string;
}

export interface FormHistoryEntry {
  version: number;
  title: string;
  status: FormStatus;
  createdAt: string;
  createdBy?: string;
}
