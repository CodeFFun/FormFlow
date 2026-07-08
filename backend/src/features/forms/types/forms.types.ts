export enum FormStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed",
  ARCHIVED = "archived",
}

export enum QuestionType {
  SHORT_TEXT = "short_text",
  LONG_TEXT = "long_text",
  MULTIPLE_CHOICE = "multiple_choice",
  CHECKBOX = "checkbox",
  DROPDOWN = "dropdown",
  NUMBER = "number",
  EMAIL = "email",
  DATE = "date",
  RATING = "rating",
  FILE_UPLOAD = "file_upload",
}

export enum LogicAction {
  SHOW = "show",
  HIDE = "hide",
  JUMP_TO = "jump_to",
}

export enum LogicOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  CONTAINS = "contains",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  IS_EMPTY = "is_empty",
  IS_NOT_EMPTY = "is_not_empty",
}

export enum CommentStatus {
  OPEN = "open",
  RESOLVED = "resolved",
}

export enum FormAudienceType {
  ORGANIZATION = "organization",
  GROUPS = "groups",
}

export interface FormAudience {
  type: FormAudienceType;
  groupIds: string[];
}

export interface QuestionOption {
  id: string;
  label: string;
  value?: string;
}

export interface QuestionLogic {
  id: string;
  action: LogicAction;
  operator: LogicOperator;
  sourceQuestionId: string;
  value?: string;
  targetQuestionId?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  position: number;
  options: QuestionOption[];
  logic: QuestionLogic[];
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  requireLogin: boolean;
  showProgressBar: boolean;
  confirmationMessage?: string;
  closeAt?: Date;
  maxResponses?: number;
}

export interface Form {
  _id: string;
  orgId: string;
  title: string;
  description?: string;
  status: FormStatus;
  questions: Question[];
  settings: FormSettings;
  audience: FormAudience;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormHistoryEntry {
  _id: string;
  formId: string;
  version: number;
  snapshot: Form;
  changedBy: string;
  createdAt: Date;
}

export interface Comment {
  _id: string;
  formId: string;
  questionId?: string;
  authorId: string;
  body: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}
