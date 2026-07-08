import { CommentModel, CommentDocument } from "../models/comment.model";
import { CommentStatus } from "../types/forms.types";

export const createComment = async (
  data: Pick<CommentDocument, "formId" | "authorId" | "body"> &
    Partial<Pick<CommentDocument, "questionId" | "status">>
): Promise<CommentDocument> => {
  return CommentModel.create(data);
};

export const findCommentById = async (
  id: string
): Promise<CommentDocument | null> => {
  return CommentModel.findById(id).lean<CommentDocument>().exec();
};

export const listCommentsByForm = async (
  formId: string
): Promise<CommentDocument[]> => {
  return CommentModel.find({ formId })
    .sort({ createdAt: -1 })
    .lean<CommentDocument[]>()
    .exec();
};

export const updateCommentStatus = async (
  id: string,
  status: CommentStatus
): Promise<CommentDocument | null> => {
  return CommentModel.findByIdAndUpdate(id, { status }, { new: true })
    .lean<CommentDocument>()
    .exec();
};

export const deleteComment = async (
  id: string
): Promise<CommentDocument | null> => {
  return CommentModel.findByIdAndDelete(id).lean<CommentDocument>().exec();
};

export const deleteCommentsByForm = async (formId: string): Promise<number> => {
  const result = await CommentModel.deleteMany({ formId }).exec();
  return result.deletedCount ?? 0;
};
