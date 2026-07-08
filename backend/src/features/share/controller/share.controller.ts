import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as shareService from "../services/share.service";

const requireUserId = (req: Request): string => req.userId as string;

const param = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const createShareLink: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const link = await shareService.createShareLink(requireUserId(req), req.body);
  res.status(201).json({ success: true, data: link });
});

export const listShareLinks: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const formId = String(req.query.formId);
  const links = await shareService.listShareLinks(requireUserId(req), formId);
  res.status(200).json({ success: true, data: links });
});

export const revokeShareLink: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const link = await shareService.revokeShareLink(requireUserId(req), param(req, "linkId"));
  res.status(200).json({ success: true, data: link });
});

export const resolveShareLink: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await shareService.resolveShareLink(param(req, "token"));
  res.status(200).json({ success: true, data: result });
});

export const submitViaShareLink: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const submission = await shareService.submitViaShareLink(param(req, "token"), req.body);
  res.status(201).json({ success: true, data: submission });
});
