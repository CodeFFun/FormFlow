import { Schema, model, Model, HydratedDocument } from "mongoose";
import { randomUUID } from "crypto";
import {
  FormAudience,
  FormAudienceType,
  FormSettings,
  FormStatus,
  LogicAction,
  LogicOperator,
  Question,
  QuestionLogic,
  QuestionOption,
  QuestionType,
} from "../types/forms.types";

export interface FormDocument {
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

const optionSchema = new Schema<QuestionOption>(
  {
    id: { type: String, default: () => randomUUID() },
    label: { type: String, required: true },
    value: { type: String },
  },
  { _id: false }
);

const logicSchema = new Schema<QuestionLogic>(
  {
    id: { type: String, default: () => randomUUID() },
    action: { type: String, enum: Object.values(LogicAction), required: true },
    operator: { type: String, enum: Object.values(LogicOperator), required: true },
    sourceQuestionId: { type: String, required: true },
    value: { type: String },
    targetQuestionId: { type: String },
  },
  { _id: false }
);

const questionSchema = new Schema<Question>(
  {
    id: { type: String, default: () => randomUUID() },
    type: { type: String, enum: Object.values(QuestionType), required: true },
    title: { type: String, required: true },
    description: { type: String },
    required: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
    options: { type: [optionSchema], default: [] },
    logic: { type: [logicSchema], default: [] },
  },
  { _id: false }
);

const audienceSchema = new Schema<FormAudience>(
  {
    type: {
      type: String,
      enum: Object.values(FormAudienceType),
      default: FormAudienceType.ORGANIZATION,
    },
    groupIds: { type: [String], default: [] },
  },
  { _id: false }
);

const settingsSchema = new Schema<FormSettings>(
  {
    allowMultipleSubmissions: { type: Boolean, default: false },
    requireLogin: { type: Boolean, default: false },
    showProgressBar: { type: Boolean, default: true },
    confirmationMessage: { type: String },
    closeAt: { type: Date },
    maxResponses: { type: Number },
  },
  { _id: false }
);

const formSchema = new Schema<FormDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    orgId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    status: {
      type: String,
      enum: Object.values(FormStatus),
      default: FormStatus.DRAFT,
      index: true,
    },
    questions: { type: [questionSchema], default: [] },
    settings: { type: settingsSchema, default: () => ({}) },
    audience: { type: audienceSchema, default: () => ({}) },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export type FormHydrated = HydratedDocument<FormDocument>;

export const FormModel: Model<FormDocument> = model<FormDocument>(
  "Form",
  formSchema,
  "forms"
);
