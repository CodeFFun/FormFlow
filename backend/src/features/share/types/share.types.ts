export enum ShareLinkType {
  MAGIC_LINK = "magic_link",
  INDIVIDUAL_INVITE = "individual_invite",
}

export enum ShareLinkStatus {
  ACTIVE = "active",
  REVOKED = "revoked",
}

export interface ShareLink {
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

export interface PublicShareLink {
  type: ShareLinkType;
  formId: string;
}
