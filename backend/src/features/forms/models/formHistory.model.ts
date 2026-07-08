import { Schema, model, Model } from "mongoose";
import { randomUUID } from "crypto";
import { FormDocument } from "./form.model";

export interface FormHistoryDocument {
  _id: string;
  formId: string;
  version: number;
  snapshot: FormDocument;
  changedBy: string;
  createdAt: Date;
}

const formHistorySchema = new Schema<FormHistoryDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    formId: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    changedBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

formHistorySchema.index({ formId: 1, version: 1 }, { unique: true });

export const FormHistoryModel: Model<FormHistoryDocument> = model<FormHistoryDocument>(
  "FormHistory",
  formHistorySchema,
  "form_history"
);
