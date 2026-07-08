import { OrganizationModel, OrganizationDocument } from "../models/organization.model";
import {
  OrgGroup,
  OrgMember,
  OrgPermission,
  OrgRole,
} from "../types/organization.types";

export const createOrganization = async (
  data: Pick<OrganizationDocument, "name" | "slug" | "createdBy"> &
    Partial<Pick<OrganizationDocument, "branding" | "members">>
): Promise<OrganizationDocument> => {
  return OrganizationModel.create(data);
};

export const findOrganizationById = async (
  id: string
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findById(id).lean<OrganizationDocument>().exec();
};

export const findOrganizationBySlug = async (
  slug: string
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findOne({ slug }).lean<OrganizationDocument>().exec();
};

export const findOrganizationsByMember = async (
  userId: string
): Promise<OrganizationDocument[]> => {
  return OrganizationModel.find({ "members.userId": userId })
    .lean<OrganizationDocument[]>()
    .exec();
};

export const updateOrganization = async (
  id: string,
  update: Partial<Pick<OrganizationDocument, "name" | "branding">>
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findByIdAndUpdate(id, update, { new: true })
    .lean<OrganizationDocument>()
    .exec();
};

export const addMember = async (
  id: string,
  member: OrgMember
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findOneAndUpdate(
    { _id: id, "members.userId": { $ne: member.userId } },
    { $push: { members: member } },
    { new: true }
  )
    .lean<OrganizationDocument>()
    .exec();
};

export const updateMemberRole = async (
  id: string,
  userId: string,
  role: OrgRole
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findOneAndUpdate(
    { _id: id, "members.userId": userId },
    { $set: { "members.$.role": role } },
    { new: true }
  )
    .lean<OrganizationDocument>()
    .exec();
};

export const updateMemberPermissions = async (
  id: string,
  userId: string,
  permissions: OrgPermission[]
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findOneAndUpdate(
    { _id: id, "members.userId": userId },
    { $set: { "members.$.permissions": permissions } },
    { new: true }
  )
    .lean<OrganizationDocument>()
    .exec();
};

export const removeMember = async (
  id: string,
  userId: string
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findByIdAndUpdate(
    id,
    { $pull: { members: { userId }, "groups.$[].memberIds": userId } },
    { new: true }
  )
    .lean<OrganizationDocument>()
    .exec();
};

export const addGroup = async (
  id: string,
  group: OrgGroup
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findByIdAndUpdate(
    id,
    { $push: { groups: group } },
    { new: true }
  )
    .lean<OrganizationDocument>()
    .exec();
};

export const updateGroup = async (
  id: string,
  groupId: string,
  update: Partial<Pick<OrgGroup, "name" | "memberIds">>
): Promise<OrganizationDocument | null> => {
  const set: Record<string, unknown> = {};
  if (update.name !== undefined) set["groups.$.name"] = update.name;
  if (update.memberIds !== undefined) set["groups.$.memberIds"] = update.memberIds;
  return OrganizationModel.findOneAndUpdate(
    { _id: id, "groups.id": groupId },
    { $set: set },
    { new: true }
  )
    .lean<OrganizationDocument>()
    .exec();
};

export const removeGroup = async (
  id: string,
  groupId: string
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findByIdAndUpdate(
    id,
    { $pull: { groups: { id: groupId } } },
    { new: true }
  )
    .lean<OrganizationDocument>()
    .exec();
};

export const deleteOrganization = async (
  id: string
): Promise<OrganizationDocument | null> => {
  return OrganizationModel.findByIdAndDelete(id).lean<OrganizationDocument>().exec();
};
