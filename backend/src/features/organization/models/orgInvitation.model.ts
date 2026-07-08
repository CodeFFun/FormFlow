import { Schema, model, Model, HydratedDocument } from "mongoose";
import { randomUUID } from "crypto";
import { InvitationStatus, OrgRole } from "../types/organization.types";

export interface OrgInvitationDocument {
  _id: string;
  orgId: string;
  email: string;
  role: OrgRole;
  tokenHash: string;
  status: InvitationStatus;
  invitedBy: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orgInvitationSchema = new Schema<OrgInvitationDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    orgId: { type: String, required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: Object.values(OrgRole), required: true },
    tokenHash: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
    },
    invitedBy: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false }
);

export type OrgInvitationHydrated = HydratedDocument<OrgInvitationDocument>;

export const OrgInvitationModel: Model<OrgInvitationDocument> = model<OrgInvitationDocument>(
  "OrgInvitation",
  orgInvitationSchema,
  "org_invitations"
);
