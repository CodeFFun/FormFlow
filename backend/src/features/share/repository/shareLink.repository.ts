import { ShareLinkModel, ShareLinkDocument } from "../models/shareLink.model";
import { ShareLinkStatus } from "../types/share.types";

export const createShareLink = async (
  data: Pick<
    ShareLinkDocument,
    "formId" | "orgId" | "type" | "token" | "createdBy"
  > &
    Partial<Pick<ShareLinkDocument, "email" | "expiresAt" | "maxUses">>
): Promise<ShareLinkDocument> => {
  return ShareLinkModel.create(data);
};

export const findShareLinkById = async (
  id: string
): Promise<ShareLinkDocument | null> => {
  return ShareLinkModel.findById(id).lean<ShareLinkDocument>().exec();
};

export const findShareLinkByToken = async (
  token: string
): Promise<ShareLinkDocument | null> => {
  return ShareLinkModel.findOne({ token }).lean<ShareLinkDocument>().exec();
};

export const listShareLinksByForm = async (
  formId: string
): Promise<ShareLinkDocument[]> => {
  return ShareLinkModel.find({ formId })
    .sort({ createdAt: -1 })
    .lean<ShareLinkDocument[]>()
    .exec();
};

export const updateShareLinkStatus = async (
  id: string,
  status: ShareLinkStatus
): Promise<ShareLinkDocument | null> => {
  return ShareLinkModel.findByIdAndUpdate(id, { status }, { new: true })
    .lean<ShareLinkDocument>()
    .exec();
};

export const incrementShareLinkUsage = async (
  id: string
): Promise<ShareLinkDocument | null> => {
  return ShareLinkModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }, { new: true })
    .lean<ShareLinkDocument>()
    .exec();
};
