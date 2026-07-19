export type PlanName = "free" | "pro" | "business";
export type BillingInterval = "monthly" | "yearly";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing";
export type InvoiceStatus = "paid" | "open" | "void" | "uncollectible";

export interface PlanLimits {
  forms?: number;
  responsesPerMonth?: number;
  members?: number;
  [key: string]: number | undefined;
}

export interface PlanFeatures {
  [key: string]: boolean | string | number | undefined;
}

export interface Plan {
  name: PlanName;
  currency: string;
  monthlyPrice: number;
  yearlyPrice: number;
  limits: PlanLimits;
  features: PlanFeatures;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
  paidAt?: string;
}

export interface Subscription {
  _id: string;
  orgId: string;
  status: SubscriptionStatus;
  plan: {
    name: PlanName;
    price: number;
    currency: string;
    interval: BillingInterval;
    limits: PlanLimits;
    features: PlanFeatures;
  };
  invoices: Invoice[];
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
