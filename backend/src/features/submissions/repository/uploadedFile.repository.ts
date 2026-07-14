import { UploadedFileModel, UploadedFileDocument } from "../models/uploadedFile.model";

export const createUploadedFile = async (
  data: Pick<
    UploadedFileDocument,
    | "formId"
    | "questionId"
    | "uploaderId"
    | "filename"
    | "mimeType"
    | "size"
    | "storageKey"
  > &
    Partial<Pick<UploadedFileDocument, "url">>
): Promise<UploadedFileDocument> => {
  return UploadedFileModel.create(data);
};

export const findUploadedFileById = async (
  id: string
): Promise<UploadedFileDocument | null> => {
  return UploadedFileModel.findById(id).lean<UploadedFileDocument>().exec();
};

export const findUploadedFilesByIds = async (
  ids: string[]
): Promise<UploadedFileDocument[]> => {
  return UploadedFileModel.find({ _id: { $in: ids } })
    .lean<UploadedFileDocument[]>()
    .exec();
};

export const findUploadedFilesBySubmission = async (
  submissionId: string
): Promise<UploadedFileDocument[]> => {
  return UploadedFileModel.find({ submissionId })
    .lean<UploadedFileDocument[]>()
    .exec();
};

export const linkFilesToSubmission = async (
  ids: string[],
  submissionId: string
): Promise<void> => {
  await UploadedFileModel.updateMany(
    { _id: { $in: ids } },
    { $set: { submissionId } }
  ).exec();
};

export const deleteUploadedFilesBySubmission = async (
  submissionId: string
): Promise<void> => {
  await UploadedFileModel.deleteMany({ submissionId }).exec();
};
