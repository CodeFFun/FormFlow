import { Schema, model, Model, HydratedDocument } from "mongoose";
import { randomUUID } from "crypto";
import { ShareLinkStatus, ShareLinkType } from "../types/share.types";

export interface ShareLinkDocument {
  _id: string;
  formId: string;
  orgId: string;
  type: ShareLinkType;
  token: string;
  email?: string;
  status: ShareLinkStatus;
  expiresAt?: Date;
  maxUses?: number;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const shareLinkSchema = new Schema<ShareLinkDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    formId: { type: String, required: true, index: true },
    orgId: { type: String, required: true },
    type: { type: String, enum: Object.values(ShareLinkType), required: true },
    token: { type: String, required: true, unique: true },
    email: { type: String, lowercase: true, trim: true },
    status: {
      type: String,
      enum: Object.values(ShareLinkStatus),
      default: ShareLinkStatus.ACTIVE,
    },
    expiresAt: { type: Date },
    maxUses: { type: Number, min: 1 },
    usageCount: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export type ShareLinkHydrated = HydratedDocument<ShareLinkDocument>;

export const ShareLinkModel: Model<ShareLinkDocument> = model<ShareLinkDocument>(
  "ShareLink",
  shareLinkSchema,
  "share_links"
);
