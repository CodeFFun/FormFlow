import { z } from "zod";
import { BillingInterval, PlanName } from "../types/billing.types";

export const orgIdQuerySchema = z.object({
  orgId: z.string().min(1),
});

export const changePlanSchema = z.object({
  orgId: z.string().min(1),
  plan: z.nativeEnum(PlanName),
  interval: z.nativeEnum(BillingInterval),
});
export type ChangePlanDto = z.infer<typeof changePlanSchema>;

export const cancelSubscriptionSchema = z.object({
  orgId: z.string().min(1),
  atPeriodEnd: z.boolean().optional().default(true),
});
export type CancelSubscriptionDto = z.infer<typeof cancelSubscriptionSchema>;
