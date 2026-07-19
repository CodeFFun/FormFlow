export type OrgRole = "owner" | "admin" | "member";
export type OrgPermission = "manage_forms";
export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";

export interface Branding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface OrgMember {
  userId: string;
  role: OrgRole;
  permissions: OrgPermission[];
  joinedAt: string;
  user?: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
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
  branding: Branding;
  members: OrgMember[];
  groups: OrgGroup[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  _id: string;
  orgId: string;
  email: string;
  role: Exclude<OrgRole, "owner">;
  status: InvitationStatus;
  createdAt: string;
  expiresAt?: string;
}
