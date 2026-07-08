export enum OrgRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
}

export enum OrgPermission {
  MANAGE_FORMS = "manage_forms",
}

export enum InvitationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REVOKED = "revoked",
  EXPIRED = "expired",
}

export interface OrgBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface OrgMemberUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

export interface OrgMember {
  userId: string;
  role: OrgRole;
  permissions: OrgPermission[];
  joinedAt: Date;
  user?: OrgMemberUser;
}

export interface OrgGroup {
  id: string;
  name: string;
  memberIds: string[];
}

export interface Organization {
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

export interface OrgInvitation {
  _id: string;
  orgId: string;
  email: string;
  role: OrgRole;
  status: InvitationStatus;
  invitedBy: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatedInvitation {
  invitation: OrgInvitation;
  token: string;
}
