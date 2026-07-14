export enum PlanName {
  FREE = "free",
  PRO = "pro",
  BUSINESS = "business",
}

export enum BillingInterval {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  TRIALING = "trialing",
}

export enum InvoiceStatus {
  PAID = "paid",
  OPEN = "open",
  VOID = "void",
  UNCOLLECTIBLE = "uncollectible",
}

export interface PlanLimits {
  maxForms?: number;
  maxResponsesPerMonth?: number;
  maxMembers?: number;
  maxStorageMb?: number;
}

export interface PlanFeatures {
  customBranding: boolean;
  fileUploads: boolean;
  removeWatermark: boolean;
  analytics: boolean;
}

export interface Plan {
  name: PlanName;
  price: number;
  currency: string;
  interval: BillingInterval;
  limits: PlanLimits;
  features: PlanFeatures;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  periodStart: Date;
  periodEnd: Date;
  issuedAt: Date;
  paidAt?: Date;
}

export interface Subscription {
  _id: string;
  orgId: string;
  status: SubscriptionStatus;
  plan: Plan;
  invoices: Invoice[];
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanCatalogEntry {
  name: PlanName;
  currency: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: PlanLimits;
  features: PlanFeatures;
}
