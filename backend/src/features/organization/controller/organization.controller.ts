import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { BadRequestError } from "../../../errors/http-error";
import * as organizationService from "../services/organization.service";

const requireUserId = (req: Request): string => req.userId as string;

const param = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const createOrganization: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.createOrganization(
    requireUserId(req),
    req.body
  );
  res.status(201).json({ success: true, data: organization });
});

export const listMyOrganizations: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const organizations = await organizationService.listMyOrganizations(requireUserId(req));
  res.status(200).json({ success: true, data: organizations });
});

export const getOrganization: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.getOrganization(
    requireUserId(req),
    param(req, "orgId")
  );
  res.status(200).json({ success: true, data: organization });
});

export const updateOrganization: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.updateOrganization(
    requireUserId(req),
    param(req, "orgId"),
    req.body
  );
  res.status(200).json({ success: true, data: organization });
});

export const deleteOrganization: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await organizationService.deleteOrganization(requireUserId(req), param(req, "orgId"));
  res.status(200).json({ success: true, message: "Organization deleted" });
});

export const uploadLogo: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new BadRequestError("An image file is required in the 'file' field");
  }
  const organization = await organizationService.setOrganizationLogo(
    requireUserId(req),
    param(req, "orgId"),
    `/uploads/${file.filename}`
  );
  res.status(200).json({ success: true, data: organization });
});

export const inviteMember: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await organizationService.inviteMember(
    requireUserId(req),
    param(req, "orgId"),
    req.body
  );
  res.status(201).json({ success: true, data: result });
});

export const listInvitations: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const invitations = await organizationService.listInvitations(
    requireUserId(req),
    param(req, "orgId")
  );
  res.status(200).json({ success: true, data: invitations });
});

export const revokeInvitation: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const invitation = await organizationService.revokeInvitation(
    requireUserId(req),
    param(req, "orgId"),
    param(req, "invitationId")
  );
  res.status(200).json({ success: true, data: invitation });
});

export const acceptInvitation: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.acceptInvitation(
    requireUserId(req),
    req.body.token
  );
  res.status(200).json({ success: true, data: organization });
});

export const updateMemberRole: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.updateMemberRole(
    requireUserId(req),
    param(req, "orgId"),
    param(req, "userId"),
    req.body
  );
  res.status(200).json({ success: true, data: organization });
});

export const removeMember: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.removeMember(
    requireUserId(req),
    param(req, "orgId"),
    param(req, "userId")
  );
  res.status(200).json({ success: true, data: organization });
});

export const updateMemberPermissions: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const organization = await organizationService.updateMemberPermissions(
    requireUserId(req),
    param(req, "orgId"),
    param(req, "userId"),
    req.body
  );
  res.status(200).json({ success: true, data: organization });
});

export const listGroups: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const groups = await organizationService.listGroups(
    requireUserId(req),
    param(req, "orgId")
  );
  res.status(200).json({ success: true, data: groups });
});

export const createGroup: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const group = await organizationService.createGroup(
    requireUserId(req),
    param(req, "orgId"),
    req.body
  );
  res.status(201).json({ success: true, data: group });
});

export const updateGroup: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const group = await organizationService.updateGroup(
    requireUserId(req),
    param(req, "orgId"),
    param(req, "groupId"),
    req.body
  );
  res.status(200).json({ success: true, data: group });
});

export const deleteGroup: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await organizationService.deleteGroup(
    requireUserId(req),
    param(req, "orgId"),
    param(req, "groupId")
  );
  res.status(200).json({ success: true, message: "Group deleted" });
});
