import { randomUUID } from "crypto";
import { ForbiddenError, NotFoundError } from "../../../errors/http-error";
import * as organizationService from "../../organization/services/organization.service";
import * as subscriptionRepo from "../repository/subscription.repository";
import {
  BillingInterval,
  Invoice,
  InvoiceStatus,
  Plan,
  PlanCatalogEntry,
  PlanFeatures,
  PlanLimits,
  PlanName,
  Subscription,
  SubscriptionStatus,
} from "../types/billing.types";
import { ChangePlanDto } from "../dtos/billing.dtos";

const DEFAULT_CURRENCY = "usd";

const PLAN_CATALOG: Record<
  PlanName,
  { monthlyPrice: number; limits: PlanLimits; features: PlanFeatures }
> = {
  [PlanName.FREE]: {
    monthlyPrice: 0,
    limits: { maxForms: 3, maxResponsesPerMonth: 100, maxMembers: 3, maxStorageMb: 100 },
    features: { customBranding: false, fileUploads: false, removeWatermark: false, analytics: false },
  },
  [PlanName.PRO]: {
    monthlyPrice: 1500,
    limits: { maxForms: 25, maxResponsesPerMonth: 5000, maxMembers: 10, maxStorageMb: 5000 },
    features: { customBranding: true, fileUploads: true, removeWatermark: true, analytics: true },
  },
  [PlanName.BUSINESS]: {
    monthlyPrice: 4900,
    limits: { maxResponsesPerMonth: 50000, maxMembers: 50, maxStorageMb: 50000 },
    features: { customBranding: true, fileUploads: true, removeWatermark: true, analytics: true },
  },
};

const YEARLY_MONTHS_CHARGED = 10;

const priceFor = (name: PlanName, interval: BillingInterval): number => {
  const monthly = PLAN_CATALOG[name].monthlyPrice;
  return interval === BillingInterval.YEARLY ? monthly * YEARLY_MONTHS_CHARGED : monthly;
};

const buildPlan = (name: PlanName, interval: BillingInterval): Plan => {
  const entry = PLAN_CATALOG[name];
  return {
    name,
    price: priceFor(name, interval),
    currency: DEFAULT_CURRENCY,
    interval,
    limits: entry.limits,
    features: entry.features,
  };
};

const addInterval = (from: Date, interval: BillingInterval): Date => {
  const next = new Date(from);
  if (interval === BillingInterval.YEARLY) {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
};

export const listPlans = (): PlanCatalogEntry[] => {
  return (Object.keys(PLAN_CATALOG) as PlanName[]).map((name) => ({
    name,
    currency: DEFAULT_CURRENCY,
    monthlyPrice: priceFor(name, BillingInterval.MONTHLY),
    yearlyPrice: priceFor(name, BillingInterval.YEARLY),
    limits: PLAN_CATALOG[name].limits,
    features: PLAN_CATALOG[name].features,
  }));
};

const ensureSubscription = async (
  orgId: string,
  userId: string
): Promise<Subscription> => {
  const existing = await subscriptionRepo.findSubscriptionByOrg(orgId);
  if (existing) {
    return existing;
  }
  return subscriptionRepo.createSubscription({
    orgId,
    status: SubscriptionStatus.ACTIVE,
    plan: buildPlan(PlanName.FREE, BillingInterval.MONTHLY),
    createdBy: userId,
  });
};

export const getSubscription = async (
  userId: string,
  orgId: string
): Promise<Subscription> => {
  const isManager = await organizationService.isOrgManager(userId, orgId);
  if (!isManager) {
    throw new ForbiddenError("Only organization managers can view billing");
  }
  return ensureSubscription(orgId, userId);
};

export const listInvoices = async (
  userId: string,
  orgId: string
): Promise<Invoice[]> => {
  const subscription = await getSubscription(userId, orgId);
  return subscription.invoices;
};

export const changePlan = async (
  userId: string,
  dto: ChangePlanDto
): Promise<Subscription> => {
  const isOwner = await organizationService.isOrgOwner(userId, dto.orgId);
  if (!isOwner) {
    throw new ForbiddenError("Only the organization owner can change the plan");
  }

  await ensureSubscription(dto.orgId, userId);

  const plan = buildPlan(dto.plan, dto.interval);
  const periodStart = new Date();
  const periodEnd = addInterval(periodStart, dto.interval);

  const updated = await subscriptionRepo.updateSubscriptionByOrg(dto.orgId, {
    status: SubscriptionStatus.ACTIVE,
    plan,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
  });
  if (!updated) {
    throw new NotFoundError("Subscription not found");
  }

  if (plan.price > 0) {
    const invoice: Invoice = {
      id: randomUUID(),
      amount: plan.price,
      currency: plan.currency,
      status: InvoiceStatus.PAID,
      periodStart,
      periodEnd,
      issuedAt: periodStart,
      paidAt: periodStart,
    };
    const withInvoice = await subscriptionRepo.addInvoice(dto.orgId, invoice);
    if (withInvoice) {
      return withInvoice;
    }
  }
  return updated;
};

export const cancelSubscription = async (
  userId: string,
  orgId: string,
  atPeriodEnd: boolean
): Promise<Subscription> => {
  const isOwner = await organizationService.isOrgOwner(userId, orgId);
  if (!isOwner) {
    throw new ForbiddenError("Only the organization owner can cancel the subscription");
  }

  await ensureSubscription(orgId, userId);

  const update = atPeriodEnd
    ? { cancelAtPeriodEnd: true }
    : { status: SubscriptionStatus.CANCELED, cancelAtPeriodEnd: false };

  const updated = await subscriptionRepo.updateSubscriptionByOrg(orgId, update);
  if (!updated) {
    throw new NotFoundError("Subscription not found");
  }
  return updated;
};

export const getActivePlan = async (orgId: string, userId: string): Promise<Plan> => {
  const subscription = await ensureSubscription(orgId, userId);
  return subscription.plan;
};
