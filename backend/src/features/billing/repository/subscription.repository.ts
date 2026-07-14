import { SubscriptionModel, SubscriptionDocument } from "../models/subscription.model";
import { Invoice } from "../types/billing.types";

export const findSubscriptionByOrg = async (
  orgId: string
): Promise<SubscriptionDocument | null> => {
  return SubscriptionModel.findOne({ orgId }).lean<SubscriptionDocument>().exec();
};

export const createSubscription = async (
  data: Pick<SubscriptionDocument, "orgId" | "plan" | "createdBy"> &
    Partial<
      Pick<
        SubscriptionDocument,
        "status" | "currentPeriodStart" | "currentPeriodEnd" | "cancelAtPeriodEnd"
      >
    >
): Promise<SubscriptionDocument> => {
  return SubscriptionModel.create(data);
};

export const updateSubscriptionByOrg = async (
  orgId: string,
  update: Partial<
    Pick<
      SubscriptionDocument,
      | "status"
      | "plan"
      | "currentPeriodStart"
      | "currentPeriodEnd"
      | "cancelAtPeriodEnd"
    >
  >
): Promise<SubscriptionDocument | null> => {
  return SubscriptionModel.findOneAndUpdate({ orgId }, update, { new: true })
    .lean<SubscriptionDocument>()
    .exec();
};

export const addInvoice = async (
  orgId: string,
  invoice: Invoice
): Promise<SubscriptionDocument | null> => {
  return SubscriptionModel.findOneAndUpdate(
    { orgId },
    { $push: { invoices: invoice } },
    { new: true }
  )
    .lean<SubscriptionDocument>()
    .exec();
};
