import { Schema, model, Model, HydratedDocument } from "mongoose";
import { randomUUID } from "crypto";
import {
  OrgBranding,
  OrgGroup,
  OrgMember,
  OrgPermission,
  OrgRole,
} from "../types/organization.types";

export interface OrganizationDocument {
  _id: string;
  name: string;
  slug: string;
  branding: OrgBranding;
  members: OrgMember[];
  groups: OrgGroup[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const brandingSchema = new Schema<OrgBranding>(
  {
    logoUrl: { type: String },
    primaryColor: { type: String },
    secondaryColor: { type: String },
  },
  { _id: false }
);

const memberSchema = new Schema<OrgMember>(
  {
    userId: { type: String, required: true },
    role: { type: String, enum: Object.values(OrgRole), required: true },
    permissions: {
      type: [String],
      enum: Object.values(OrgPermission),
      default: [],
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const groupSchema = new Schema<OrgGroup>(
  {
    id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true, trim: true },
    memberIds: { type: [String], default: [] },
  },
  { _id: false }
);

const organizationSchema = new Schema<OrganizationDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    branding: { type: brandingSchema, default: () => ({}) },
    members: { type: [memberSchema], default: [] },
    groups: { type: [groupSchema], default: [] },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export type OrganizationHydrated = HydratedDocument<OrganizationDocument>;

export const OrganizationModel: Model<OrganizationDocument> = model<OrganizationDocument>(
  "Organization",
  organizationSchema,
  "organizations"
);
