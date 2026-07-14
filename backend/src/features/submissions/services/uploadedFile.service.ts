import { BadRequestError, NotFoundError } from "../../../errors/http-error";
import * as formService from "../../forms/services/form.service";
import { QuestionType } from "../../forms/types/forms.types";
import * as uploadedFileRepo from "../repository/uploadedFile.repository";
import { UploadedFile } from "../types/submissions.types";
import { RegisterUploadInput } from "../dtos/submissions.dtos";

export const registerUpload = async (
  userId: string,
  dto: RegisterUploadInput
): Promise<UploadedFile> => {
  const form = await formService.getRespondableForm(userId, dto.formId);

  const question = form.questions.find((q) => q.id === dto.questionId);
  if (!question) {
    throw new NotFoundError("Question not found in this form");
  }
  if (question.type !== QuestionType.FILE_UPLOAD) {
    throw new BadRequestError("This question does not accept file uploads");
  }

  return uploadedFileRepo.createUploadedFile({
    formId: dto.formId,
    questionId: dto.questionId,
    uploaderId: userId,
    filename: dto.filename,
    mimeType: dto.mimeType,
    size: dto.size,
    storageKey: dto.storageKey,
    url: dto.url,
  });
};
