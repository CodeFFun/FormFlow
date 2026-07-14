import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { BadRequestError } from "../../../errors/http-error";
import * as uploadedFileService from "../services/uploadedFile.service";

const requireUserId = (req: Request): string => req.userId as string;

export const registerUpload: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  if (!file) {
    throw new BadRequestError("An image file is required in the 'file' field");
  }

  const { formId, questionId } = req.body as { formId: string; questionId: string };

  const result = await uploadedFileService.registerUpload(requireUserId(req), {
    formId,
    questionId,
    filename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storageKey: file.filename,
    url: `/uploads/${file.filename}`,
  });

  res.status(201).json({ success: true, data: result });
});
