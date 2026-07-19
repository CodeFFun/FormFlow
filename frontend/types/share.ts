import type { FormDoc } from "./form";

export type ShareLinkType = "magic_link" | "individual_invite";
export type ShareLinkStatus = "active" | "revoked";

export interface ShareLink {
  _id: string;
  formId: string;
  orgId: string;
  type: ShareLinkType;
  token: string;
  email?: string;
  status: ShareLinkStatus;
  expiresAt?: string;
  maxUses?: number;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShareLinkPayload {
  formId: string;
  type: ShareLinkType;
  email?: string;
  expiresAt?: string;
  maxUses?: number;
}

export interface ResolvedShare {
  share: {
    type: ShareLinkType;
    formId: string;
  };
  form: FormDoc;
}
