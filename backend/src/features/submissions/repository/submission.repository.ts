import { SubmissionModel, SubmissionDocument } from "../models/submission.model";

export const createSubmission = async (
  data: Pick<SubmissionDocument, "formId" | "orgId" | "answers" | "respondent"> &
    Partial<Pick<SubmissionDocument, "submittedAt">>
): Promise<SubmissionDocument> => {
  return SubmissionModel.create(data);
};

export const findSubmissionById = async (
  id: string
): Promise<SubmissionDocument | null> => {
  return SubmissionModel.findById(id).lean<SubmissionDocument>().exec();
};

export const findSubmissionsByForm = async (
  formId: string,
  opts: { skip: number; limit: number }
): Promise<SubmissionDocument[]> => {
  return SubmissionModel.find({ formId })
    .sort({ submittedAt: -1 })
    .skip(opts.skip)
    .limit(opts.limit)
    .lean<SubmissionDocument[]>()
    .exec();
};

export const countSubmissionsByForm = async (formId: string): Promise<number> => {
  return SubmissionModel.countDocuments({ formId }).exec();
};

export const findSubmissionByFormAndUser = async (
  formId: string,
  userId: string
): Promise<SubmissionDocument | null> => {
  return SubmissionModel.findOne({ formId, "respondent.userId": userId })
    .lean<SubmissionDocument>()
    .exec();
};

export const deleteSubmission = async (
  id: string
): Promise<SubmissionDocument | null> => {
  return SubmissionModel.findByIdAndDelete(id).lean<SubmissionDocument>().exec();
};
