import { OrgInvitationModel, OrgInvitationDocument } from "../models/orgInvitation.model";
import { InvitationStatus } from "../types/organization.types";

export const createInvitation = async (
  data: Pick<
    OrgInvitationDocument,
    "orgId" | "email" | "role" | "tokenHash" | "invitedBy" | "expiresAt"
  > &
    Partial<Pick<OrgInvitationDocument, "status">>
): Promise<OrgInvitationDocument> => {
  return OrgInvitationModel.create(data);
};

export const findInvitationById = async (
  id: string
): Promise<OrgInvitationDocument | null> => {
  return OrgInvitationModel.findById(id).lean<OrgInvitationDocument>().exec();
};

export const findInvitationByTokenHash = async (
  tokenHash: string
): Promise<OrgInvitationDocument | null> => {
  return OrgInvitationModel.findOne({ tokenHash }).lean<OrgInvitationDocument>().exec();
};

export const findPendingInvitationByOrgAndEmail = async (
  orgId: string,
  email: string
): Promise<OrgInvitationDocument | null> => {
  return OrgInvitationModel.findOne({
    orgId,
    email,
    status: InvitationStatus.PENDING,
  })
    .lean<OrgInvitationDocument>()
    .exec();
};

export const listInvitationsByOrg = async (
  orgId: string
): Promise<OrgInvitationDocument[]> => {
  return OrgInvitationModel.find({ orgId })
    .sort({ createdAt: -1 })
    .lean<OrgInvitationDocument[]>()
    .exec();
};

export const updateInvitationStatus = async (
  id: string,
  status: InvitationStatus
): Promise<OrgInvitationDocument | null> => {
  return OrgInvitationModel.findByIdAndUpdate(id, { status }, { new: true })
    .lean<OrgInvitationDocument>()
    .exec();
};
