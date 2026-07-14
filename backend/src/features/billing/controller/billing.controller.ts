import { Request, Response, RequestHandler } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import * as billingService from "../services/billing.service";

const requireUserId = (req: Request): string => req.userId as string;

export const listPlans: RequestHandler = asyncHandler(async (_req: Request, res: Response) => {
  const plans = billingService.listPlans();
  res.status(200).json({ success: true, data: plans });
});

export const getSubscription: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const orgId = String(req.query.orgId);
  const subscription = await billingService.getSubscription(requireUserId(req), orgId);
  res.status(200).json({ success: true, data: subscription });
});

export const listInvoices: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const orgId = String(req.query.orgId);
  const invoices = await billingService.listInvoices(requireUserId(req), orgId);
  res.status(200).json({ success: true, data: invoices });
});

export const changePlan: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await billingService.changePlan(requireUserId(req), req.body);
  res.status(200).json({ success: true, data: subscription });
});

export const cancelSubscription: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const subscription = await billingService.cancelSubscription(
    requireUserId(req),
    req.body.orgId,
    req.body.atPeriodEnd
  );
  res.status(200).json({ success: true, data: subscription });
});
