import { Schema, model, Model, HydratedDocument } from "mongoose";
import { randomUUID } from "crypto";
import { AnswerValue, Respondent, SubmissionAnswer } from "../types/submissions.types";

export interface SubmissionDocument {
  _id: string;
  formId: string;
  orgId: string;
  answers: SubmissionAnswer[];
  respondent: Respondent;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<SubmissionAnswer>(
  {
    questionId: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const respondentSchema = new Schema<Respondent>(
  {
    userId: { type: String },
    email: { type: String, lowercase: true, trim: true },
    name: { type: String, trim: true },
  },
  { _id: false }
);

const submissionSchema = new Schema<SubmissionDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    formId: { type: String, required: true, index: true },
    orgId: { type: String, required: true, index: true },
    answers: { type: [answerSchema], default: [] },
    respondent: { type: respondentSchema, default: () => ({}) },
    submittedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, versionKey: false }
);

export type SubmissionHydrated = HydratedDocument<SubmissionDocument>;

export const SubmissionModel: Model<SubmissionDocument> = model<SubmissionDocument>(
  "Submission",
  submissionSchema,
  "submissions"
);

export type { AnswerValue };
