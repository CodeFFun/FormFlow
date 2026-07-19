export type AnswerValue = string | number | string[];

export interface Answer {
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
  answers: Answer[];
  respondent?: Respondent;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubmissionPayload {
  formId: string;
  answers: Answer[];
  respondent?: Respondent;
}

export interface SubmissionStats {
  formId: string;
  total: number;
}

export interface UploadedFile {
  _id: string;
  formId: string;
  questionId: string;
  uploaderId?: string;
  submissionId?: string;
  filename: string;
  mimeType: string;
  size: number;
  storageKey: string;
  url: string;
  createdAt: string;
  updatedAt: string;
}
