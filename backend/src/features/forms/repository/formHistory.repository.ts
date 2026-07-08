import { FormHistoryModel, FormHistoryDocument } from "../models/formHistory.model";

export const createHistoryEntry = async (
  data: Pick<FormHistoryDocument, "formId" | "version" | "snapshot" | "changedBy">
): Promise<FormHistoryDocument> => {
  return FormHistoryModel.create(data);
};

export const findLatestVersion = async (formId: string): Promise<number> => {
  const latest = await FormHistoryModel.findOne({ formId })
    .sort({ version: -1 })
    .select("version")
    .lean<{ version: number }>()
    .exec();
  return latest?.version ?? 0;
};

export const findByFormAndVersion = async (
  formId: string,
  version: number
): Promise<FormHistoryDocument | null> => {
  return FormHistoryModel.findOne({ formId, version })
    .lean<FormHistoryDocument>()
    .exec();
};

export const listHistoryByForm = async (
  formId: string
): Promise<FormHistoryDocument[]> => {
  return FormHistoryModel.find({ formId })
    .sort({ version: -1 })
    .lean<FormHistoryDocument[]>()
    .exec();
};

export const deleteHistoryByForm = async (formId: string): Promise<number> => {
  const result = await FormHistoryModel.deleteMany({ formId }).exec();
  return result.deletedCount ?? 0;
};
