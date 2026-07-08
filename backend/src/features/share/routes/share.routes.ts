import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import * as shareController from "../controller/share.controller";
import {
  createShareLinkSchema,
  linkIdParamSchema,
  listShareLinksQuerySchema,
  publicSubmitSchema,
  tokenParamSchema,
} from "../dtos/share.dtos";

const router: ExpressRouter = Router();

router.get(
  "/t/:token",
  validate({ params: tokenParamSchema }),
  shareController.resolveShareLink
);
router.post(
  "/t/:token/submit",
  validate({ params: tokenParamSchema, body: publicSubmitSchema }),
  shareController.submitViaShareLink
);

router.post(
  "/",
  authenticate,
  validate({ body: createShareLinkSchema }),
  shareController.createShareLink
);
router.get(
  "/",
  authenticate,
  validate({ query: listShareLinksQuerySchema }),
  shareController.listShareLinks
);
router.delete(
  "/:linkId",
  authenticate,
  validate({ params: linkIdParamSchema }),
  shareController.revokeShareLink
);

export default router;
