import { randomUUID } from "crypto";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../../errors/http-error";
import { slugify } from "../../../utils/slugify";
import { generateToken, hashToken } from "../../../utils/token";
import { FRONTEND_URL } from "../../../config";
import { sendInvitationEmail } from "../../../middleware/nodemailer";
import { UserService } from "../../user/services/user.service";
import * as notificationService from "../../notifications/services/notification.service";
import { NotificationType } from "../../notifications/types/notifications.types";

const userService = new UserService();

const withMemberProfiles = async (
  org: Organization
): Promise<Organization> => {
  const seen = new Set<string>();
  const uniqueMembers = org.members.filter((m) => {
    if (seen.has(m.userId)) return false;
    seen.add(m.userId);
    return true;
  });

  const profiles = await userService.getProfilesByIds(
    uniqueMembers.map((m) => m.userId)
  );
  const byId = new Map(profiles.map((p) => [p._id, p]));
  return {
    ...org,
    members: uniqueMembers.map((m) => ({ ...m, user: byId.get(m.userId) })),
  };
};
import * as orgRepo from "../repository/organization.repository";
import * as invRepo from "../repository/orgInvitation.repository";
import { OrganizationDocument } from "../models/organization.model";
import { OrgInvitationDocument } from "../models/orgInvitation.model";
import {
  CreatedInvitation,
  InvitationStatus,
  OrgGroup,
  OrgInvitation,
  Organization,
  OrgPermission,
  OrgRole,
} from "../types/organization.types";
import {
  CreateGroupDto,
  CreateOrganizationDto,
  InviteMemberDto,
  UpdateGroupDto,
  UpdateMemberPermissionsDto,
  UpdateMemberRoleDto,
  UpdateOrganizationDto,
} from "../dtos/organization.dtos";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const toInvitation = (doc: OrgInvitationDocument): OrgInvitation => {
  const { tokenHash, ...rest } = doc;
  void tokenHash;
  return rest;
};

const findMember = (org: OrganizationDocument, userId: string) =>
  org.members.find((m) => m.userId === userId) ?? null;

const assertRole = (
  org: OrganizationDocument,
  userId: string,
  allowed: OrgRole[]
): void => {
  const member = findMember(org, userId);
  if (!member) {
    throw new ForbiddenError("You are not a member of this organization");
  }
  if (!allowed.includes(member.role)) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }
};

const getOrgOrThrow = async (orgId: string): Promise<OrganizationDocument> => {
  const org = await orgRepo.findOrganizationById(orgId);
  if (!org) {
    throw new NotFoundError("Organization not found");
  }
  return org;
};

export const getMembershipRole = async (
  userId: string,
  orgId: string
): Promise<OrgRole> => {
  const org = await getOrgOrThrow(orgId);
  const member = findMember(org, userId);
  if (!member) {
    throw new ForbiddenError("You are not a member of this organization");
  }
  return member.role;
};

export const isOrgManager = async (
  userId: string,
  orgId: string
): Promise<boolean> => {
  const role = await getMembershipRole(userId, orgId);
  return role === OrgRole.OWNER || role === OrgRole.ADMIN;
};

export const isOrgOwner = async (
  userId: string,
  orgId: string
): Promise<boolean> => {
  const role = await getMembershipRole(userId, orgId);
  return role === OrgRole.OWNER;
};

export const canManageForms = async (
  userId: string,
  orgId: string
): Promise<boolean> => {
  const org = await getOrgOrThrow(orgId);
  const member = findMember(org, userId);
  if (!member) {
    throw new ForbiddenError("You are not a member of this organization");
  }
  return (
    member.role === OrgRole.OWNER ||
    member.role === OrgRole.ADMIN ||
    member.permissions.includes(OrgPermission.MANAGE_FORMS)
  );
};

export const getUserGroupIds = async (
  userId: string,
  orgId: string
): Promise<string[]> => {
  const org = await getOrgOrThrow(orgId);
  const member = findMember(org, userId);
  if (!member) {
    throw new ForbiddenError("You are not a member of this organization");
  }
  return org.groups
    .filter((g) => g.memberIds.includes(userId))
    .map((g) => g.id);
};

export const assertGroupsExist = async (
  orgId: string,
  groupIds: string[]
): Promise<void> => {
  const org = await getOrgOrThrow(orgId);
  const existing = new Set(org.groups.map((g) => g.id));
  const missing = groupIds.filter((id) => !existing.has(id));
  if (missing.length > 0) {
    throw new BadRequestError(`Unknown group id(s): ${missing.join(", ")}`);
  }
};

export const getManagerUserIds = async (orgId: string): Promise<string[]> => {
  const org = await getOrgOrThrow(orgId);
  return org.members
    .filter(
      (m) =>
        m.role === OrgRole.OWNER ||
        m.role === OrgRole.ADMIN ||
        m.permissions.includes(OrgPermission.MANAGE_FORMS)
    )
    .map((m) => m.userId);
};

export const getMemberUserIds = async (orgId: string): Promise<string[]> => {
  const org = await getOrgOrThrow(orgId);
  return org.members.map((m) => m.userId);
};

export const getGroupMemberUserIds = async (
  orgId: string,
  groupIds: string[]
): Promise<string[]> => {
  const org = await getOrgOrThrow(orgId);
  const ids = new Set<string>();
  for (const group of org.groups) {
    if (groupIds.includes(group.id)) {
      group.memberIds.forEach((id) => ids.add(id));
    }
  }
  return Array.from(ids);
};

const generateUniqueSlug = async (base: string): Promise<string> => {
  let candidate = base;
  let attempt = 1;
  while (await orgRepo.findOrganizationBySlug(candidate)) {
    attempt += 1;
    candidate = `${base}-${attempt}`;
    if (attempt > 1000) {
      candidate = `${base}-${Date.now()}`;
      break;
    }
  }
  return candidate;
};

export const createOrganization = async (
  userId: string,
  dto: CreateOrganizationDto
): Promise<Organization> => {
  const base = dto.slug ?? slugify(dto.name);
  if (!base) {
    throw new BadRequestError("Unable to derive a valid slug from the organization name");
  }

  const slug = await generateUniqueSlug(base);

  return orgRepo.createOrganization({
    name: dto.name,
    slug,
    branding: dto.branding ?? {},
    createdBy: userId,
    members: [
      { userId, role: OrgRole.OWNER, permissions: [], joinedAt: new Date() },
    ],
  });
};

export const listMyOrganizations = async (
  userId: string
): Promise<Organization[]> => {
  const orgs = await orgRepo.findOrganizationsByMember(userId);
  return Promise.all(orgs.map((o) => withMemberProfiles(o)));
};

export const getOrganization = async (
  userId: string,
  orgId: string
): Promise<Organization> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN, OrgRole.MEMBER]);
  return withMemberProfiles(org);
};

export const updateOrganization = async (
  userId: string,
  orgId: string,
  dto: UpdateOrganizationDto
): Promise<Organization> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);

  const updated = await orgRepo.updateOrganization(orgId, {
    ...(dto.name !== undefined ? { name: dto.name } : {}),
    ...(dto.branding !== undefined ? { branding: dto.branding } : {}),
  });
  if (!updated) {
    throw new NotFoundError("Organization not found");
  }
  return updated;
};

export const deleteOrganization = async (
  userId: string,
  orgId: string
): Promise<void> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER]);
  await orgRepo.deleteOrganization(orgId);
};

export const setOrganizationLogo = async (
  userId: string,
  orgId: string,
  logoUrl: string
): Promise<Organization> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);

  const updated = await orgRepo.updateOrganization(orgId, {
    branding: { ...org.branding, logoUrl },
  });
  if (!updated) {
    throw new NotFoundError("Organization not found");
  }
  return updated;
};

export const inviteMember = async (
  userId: string,
  orgId: string,
  dto: InviteMemberDto
): Promise<CreatedInvitation> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);

  const pending = await invRepo.findPendingInvitationByOrgAndEmail(orgId, dto.email);
  if (pending) {
    throw new ConflictError("A pending invitation already exists for this email");
  }

  const token = generateToken();
  const invitation = await invRepo.createInvitation({
    orgId,
    email: dto.email,
    role: dto.role,
    tokenHash: hashToken(token),
    invitedBy: userId,
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
  });

  const acceptPath = `/invite?token=${token}`;
  try {
    await sendInvitationEmail(dto.email, {
      orgName: org.name,
      acceptUrl: `${FRONTEND_URL}${acceptPath}`,
      token,
    });
  } catch (err) {
    console.error("Failed to send invitation email:", err);
  }

  try {
    const invitee = await userService.getUserByEmail(dto.email);
    if (invitee) {
      await notificationService.createNotification({
        userId: invitee._id.toString(),
        type: NotificationType.ORG_INVITATION,
        title: "Organization invitation",
        message: `You've been invited to join "${org.name}". Click to accept.`,
        data: { orgId, url: acceptPath },
      });
    }
  } catch (err) {
    console.error("Failed to create invitation notification:", err);
  }

  return { invitation: toInvitation(invitation), token };
};

export const listInvitations = async (
  userId: string,
  orgId: string
): Promise<OrgInvitation[]> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);
  const invitations = await invRepo.listInvitationsByOrg(orgId);
  return invitations.map(toInvitation);
};

export const revokeInvitation = async (
  userId: string,
  orgId: string,
  invitationId: string
): Promise<OrgInvitation> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);

  const invitation = await invRepo.findInvitationById(invitationId);
  if (!invitation || invitation.orgId !== orgId) {
    throw new NotFoundError("Invitation not found");
  }
  if (invitation.status !== InvitationStatus.PENDING) {
    throw new BadRequestError("Only pending invitations can be revoked");
  }

  const updated = await invRepo.updateInvitationStatus(
    invitationId,
    InvitationStatus.REVOKED
  );
  if (!updated) {
    throw new NotFoundError("Invitation not found");
  }
  return toInvitation(updated);
};

export const acceptInvitation = async (
  userId: string,
  token: string
): Promise<Organization> => {
  const invitation = await invRepo.findInvitationByTokenHash(hashToken(token));
  if (!invitation) {
    throw new NotFoundError("Invitation not found");
  }
  if (invitation.status !== InvitationStatus.PENDING) {
    throw new BadRequestError("This invitation is no longer valid");
  }
  if (invitation.expiresAt.getTime() < Date.now()) {
    await invRepo.updateInvitationStatus(invitation._id, InvitationStatus.EXPIRED);
    throw new BadRequestError("This invitation has expired");
  }

  const org = await getOrgOrThrow(invitation.orgId);
  if (findMember(org, userId)) {
    await invRepo.updateInvitationStatus(invitation._id, InvitationStatus.ACCEPTED);
    throw new ConflictError("You are already a member of this organization");
  }

  const updated = await orgRepo.addMember(invitation.orgId, {
    userId,
    role: invitation.role,
    permissions: [],
    joinedAt: new Date(),
  });
  await invRepo.updateInvitationStatus(invitation._id, InvitationStatus.ACCEPTED);

  const result = updated ?? (await getOrgOrThrow(invitation.orgId));
  return withMemberProfiles(result);
};

export const updateMemberRole = async (
  userId: string,
  orgId: string,
  targetUserId: string,
  dto: UpdateMemberRoleDto
): Promise<Organization> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER]);

  const target = findMember(org, targetUserId);
  if (!target) {
    throw new NotFoundError("Member not found in this organization");
  }
  if (target.role === OrgRole.OWNER) {
    throw new ForbiddenError("The owner's role cannot be changed");
  }

  const updated = await orgRepo.updateMemberRole(orgId, targetUserId, dto.role);
  if (!updated) {
    throw new NotFoundError("Member not found in this organization");
  }
  return updated;
};

export const removeMember = async (
  userId: string,
  orgId: string,
  targetUserId: string
): Promise<Organization> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);

  const target = findMember(org, targetUserId);
  if (!target) {
    throw new NotFoundError("Member not found in this organization");
  }
  if (target.role === OrgRole.OWNER) {
    throw new ForbiddenError("The owner cannot be removed from the organization");
  }

  const updated = await orgRepo.removeMember(orgId, targetUserId);
  if (!updated) {
    throw new NotFoundError("Organization not found");
  }
  return updated;
};

export const updateMemberPermissions = async (
  userId: string,
  orgId: string,
  targetUserId: string,
  dto: UpdateMemberPermissionsDto
): Promise<Organization> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);

  const target = findMember(org, targetUserId);
  if (!target) {
    throw new NotFoundError("Member not found in this organization");
  }
  if (target.role === OrgRole.OWNER) {
    throw new ForbiddenError("The owner's permissions cannot be changed");
  }

  const permissions = Array.from(new Set(dto.permissions));
  const updated = await orgRepo.updateMemberPermissions(
    orgId,
    targetUserId,
    permissions
  );
  if (!updated) {
    throw new NotFoundError("Member not found in this organization");
  }
  return updated;
};

const assertMembersExist = (
  org: OrganizationDocument,
  memberIds: string[]
): void => {
  const existing = new Set(org.members.map((m) => m.userId));
  const missing = memberIds.filter((id) => !existing.has(id));
  if (missing.length > 0) {
    throw new BadRequestError(
      `These users are not members of the organization: ${missing.join(", ")}`
    );
  }
};

export const listGroups = async (
  userId: string,
  orgId: string
): Promise<OrgGroup[]> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN, OrgRole.MEMBER]);
  return org.groups;
};

export const createGroup = async (
  userId: string,
  orgId: string,
  dto: CreateGroupDto
): Promise<OrgGroup> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);

  const memberIds = Array.from(new Set(dto.memberIds ?? []));
  assertMembersExist(org, memberIds);

  const group: OrgGroup = { id: randomUUID(), name: dto.name, memberIds };
  const updated = await orgRepo.addGroup(orgId, group);
  if (!updated) {
    throw new NotFoundError("Organization not found");
  }
  return group;
};

export const updateGroup = async (
  userId: string,
  orgId: string,
  groupId: string,
  dto: UpdateGroupDto
): Promise<OrgGroup> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);

  const group = org.groups.find((g) => g.id === groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }

  if (dto.memberIds !== undefined) {
    const memberIds = Array.from(new Set(dto.memberIds));
    assertMembersExist(org, memberIds);
    dto = { ...dto, memberIds };
  }

  const updated = await orgRepo.updateGroup(orgId, groupId, dto);
  if (!updated) {
    throw new NotFoundError("Group not found");
  }
  const result = updated.groups.find((g) => g.id === groupId);
  if (!result) {
    throw new NotFoundError("Group not found");
  }
  return result;
};

export const deleteGroup = async (
  userId: string,
  orgId: string,
  groupId: string
): Promise<void> => {
  const org = await getOrgOrThrow(orgId);
  assertRole(org, userId, [OrgRole.OWNER, OrgRole.ADMIN]);

  const group = org.groups.find((g) => g.id === groupId);
  if (!group) {
    throw new NotFoundError("Group not found");
  }
  await orgRepo.removeGroup(orgId, groupId);
};
