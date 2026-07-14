import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as submissionService from "../services/submission.service";

const requireUserId = (req: Request): string => req.userId as string;

const param = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const createSubmission: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const submission = await submissionService.createSubmission(
    requireUserId(req),
    req.body
  );
  res.status(201).json({ success: true, data: submission });
});

export const listSubmissions: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const formId = String(req.query.formId);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await submissionService.listSubmissions(
    requireUserId(req),
    formId,
    page,
    limit
  );
  res.status(200).json({ success: true, ...result });
});

export const getSubmissionStats: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const formId = String(req.query.formId);
  const stats = await submissionService.getSubmissionStats(requireUserId(req), formId);
  res.status(200).json({ success: true, data: stats });
});

export const getSubmission: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const submission = await submissionService.getSubmission(
    requireUserId(req),
    param(req, "submissionId")
  );
  res.status(200).json({ success: true, data: submission });
});

export const deleteSubmission: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await submissionService.deleteSubmission(
    requireUserId(req),
    param(req, "submissionId")
  );
  res.status(200).json({ success: true, message: "Submission deleted" });
});

export const listSubmissionFiles: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const files = await submissionService.listSubmissionFiles(
    requireUserId(req),
    param(req, "submissionId")
  );
  res.status(200).json({ success: true, data: files });
});
