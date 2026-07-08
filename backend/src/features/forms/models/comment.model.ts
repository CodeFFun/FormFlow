import { Schema, model, Model } from "mongoose";
import { randomUUID } from "crypto";
import { CommentStatus } from "../types/forms.types";

export interface CommentDocument {
  _id: string;
  formId: string;
  questionId?: string;
  authorId: string;
  body: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<CommentDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    formId: { type: String, required: true, index: true },
    questionId: { type: String },
    authorId: { type: String, required: true },
    body: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(CommentStatus),
      default: CommentStatus.OPEN,
    },
  },
  { timestamps: true, versionKey: false }
);

export const CommentModel: Model<CommentDocument> = model<CommentDocument>(
  "Comment",
  commentSchema,
  "comments"
);
