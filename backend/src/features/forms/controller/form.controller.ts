import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as formService from "../services/form.service";
import { FormStatus } from "../types/forms.types";

const requireUserId = (req: Request): string => req.userId as string;

const param = (req: Request, name: string): string => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const createForm: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.createForm(requireUserId(req), req.body);
  res.status(201).json({ success: true, data: form });
});

export const listForms: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const orgId = String(req.query.orgId);
  const status = req.query.status as FormStatus | undefined;
  const forms = await formService.listForms(requireUserId(req), orgId, status);
  res.status(200).json({ success: true, data: forms });
});

export const getForm: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.getForm(requireUserId(req), param(req, "formId"));
  res.status(200).json({ success: true, data: form });
});

export const updateForm: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.updateForm(
    requireUserId(req),
    param(req, "formId"),
    req.body
  );
  res.status(200).json({ success: true, data: form });
});

export const deleteForm: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  await formService.deleteForm(requireUserId(req), param(req, "formId"));
  res.status(200).json({ success: true, message: "Form deleted" });
});

export const publishForm: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.publishForm(requireUserId(req), param(req, "formId"));
  res.status(200).json({ success: true, data: form });
});

export const closeForm: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const form = await formService.closeForm(requireUserId(req), param(req, "formId"));
  res.status(200).json({ success: true, data: form });
});

export const shareWithAudience: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await formService.shareWithAudience(
    requireUserId(req),
    param(req, "formId")
  );
  res.status(200).json({ success: true, data: result });
});

export const listHistory: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const history = await formService.listHistory(requireUserId(req), param(req, "formId"));
  res.status(200).json({ success: true, data: history });
});

export const restoreVersion: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const version = Number(param(req, "version"));
  const form = await formService.restoreVersion(
    requireUserId(req),
    param(req, "formId"),
    version
  );
  res.status(200).json({ success: true, data: form });
});
