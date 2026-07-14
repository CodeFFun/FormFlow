import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import * as billingController from "../controller/billing.controller";
import {
  cancelSubscriptionSchema,
  changePlanSchema,
  orgIdQuerySchema,
} from "../dtos/billing.dtos";

const router: ExpressRouter = Router();

router.use(authenticate);

router.get("/plans", billingController.listPlans);

router.get(
  "/subscription",
  validate({ query: orgIdQuerySchema }),
  billingController.getSubscription
);
router.post(
  "/subscription/change",
  validate({ body: changePlanSchema }),
  billingController.changePlan
);
router.post(
  "/subscription/cancel",
  validate({ body: cancelSubscriptionSchema }),
  billingController.cancelSubscription
);

router.get(
  "/invoices",
  validate({ query: orgIdQuerySchema }),
  billingController.listInvoices
);

export default router;
