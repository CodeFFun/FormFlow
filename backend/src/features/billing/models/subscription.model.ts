import { Schema, model, Model, HydratedDocument } from "mongoose";
import { randomUUID } from "crypto";
import {
  BillingInterval,
  Invoice,
  InvoiceStatus,
  Plan,
  PlanFeatures,
  PlanLimits,
  PlanName,
  SubscriptionStatus,
} from "../types/billing.types";

export interface SubscriptionDocument {
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

const limitsSchema = new Schema<PlanLimits>(
  {
    maxForms: { type: Number },
    maxResponsesPerMonth: { type: Number },
    maxMembers: { type: Number },
    maxStorageMb: { type: Number },
  },
  { _id: false }
);

const featuresSchema = new Schema<PlanFeatures>(
  {
    customBranding: { type: Boolean, default: false },
    fileUploads: { type: Boolean, default: false },
    removeWatermark: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
  },
  { _id: false }
);

const planSchema = new Schema<Plan>(
  {
    name: { type: String, enum: Object.values(PlanName), required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "usd" },
    interval: { type: String, enum: Object.values(BillingInterval), required: true },
    limits: { type: limitsSchema, default: () => ({}) },
    features: { type: featuresSchema, default: () => ({}) },
  },
  { _id: false }
);

const invoiceSchema = new Schema<Invoice>(
  {
    id: { type: String, default: () => randomUUID() },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "usd" },
    status: { type: String, enum: Object.values(InvoiceStatus), required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    issuedAt: { type: Date, default: Date.now },
    paidAt: { type: Date },
  },
  { _id: false }
);

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    _id: { type: String, default: () => randomUUID() },
    orgId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.ACTIVE,
    },
    plan: { type: planSchema, required: true },
    invoices: { type: [invoiceSchema], default: [] },
    currentPeriodStart: { type: Date },
    currentPeriodEnd: { type: Date },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export type SubscriptionHydrated = HydratedDocument<SubscriptionDocument>;

export const SubscriptionModel: Model<SubscriptionDocument> = model<SubscriptionDocument>(
  "Subscription",
  subscriptionSchema,
  "subscriptions"
);
