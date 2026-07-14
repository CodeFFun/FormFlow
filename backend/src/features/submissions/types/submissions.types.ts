export type AnswerValue = string | number | boolean | string[];

export interface SubmissionAnswer {
  questionId: string;
  value: AnswerValue;
}

export interface Respondent {
  userId?: string;
  email?: string;
  name?: string;
}

export interface Submission {
  _id: string;
  formId: string;
  orgId: string;
  answers: SubmissionAnswer[];
  respondent: Respondent;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadedFile {
  _id: string;
  formId: string;
  questionId: string;
  uploaderId: string;
  submissionId?: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionListResult {
  items: Submission[];
  total: number;
  page: number;
  limit: number;
}

export interface SubmissionStats {
  formId: string;
  total: number;
}
