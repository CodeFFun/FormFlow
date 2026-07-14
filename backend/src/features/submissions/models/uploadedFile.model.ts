import { Schema, model, Model, HydratedDocument } from "mongoose";
import { randomUUID } from "crypto";

export interface UploadedFileDocument {
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

const uploadedFileSchema = new Schema<UploadedFileDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    formId: { type: String, required: true, index: true },
    questionId: { type: String, required: true },
    uploaderId: { type: String, required: true },
    submissionId: { type: String, default: null, index: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true, min: 0 },
    storageKey: { type: String, required: true },
    url: { type: String },
  },
  { timestamps: true, versionKey: false }
);

export type UploadedFileHydrated = HydratedDocument<UploadedFileDocument>;

export const UploadedFileModel: Model<UploadedFileDocument> = model<UploadedFileDocument>(
  "UploadedFile",
  uploadedFileSchema,
  "uploaded_files"
);
