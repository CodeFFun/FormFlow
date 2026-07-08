import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import * as formController from "../controller/form.controller";
import * as commentController from "../controller/comment.controller";
import {
  addCommentSchema,
  commentParamSchema,
  createFormSchema,
  formIdParamSchema,
  listFormsQuerySchema,
  updateFormSchema,
  versionParamSchema,
} from "../dtos/forms.dtos";

const router: ExpressRouter = Router();

router.use(authenticate);

router.post("/", validate({ body: createFormSchema }), formController.createForm);
router.get("/", validate({ query: listFormsQuerySchema }), formController.listForms);
router.get(
  "/:formId",
  validate({ params: formIdParamSchema }),
  formController.getForm
);
router.patch(
  "/:formId",
  validate({ params: formIdParamSchema, body: updateFormSchema }),
  formController.updateForm
);
router.delete(
  "/:formId",
  validate({ params: formIdParamSchema }),
  formController.deleteForm
);

router.post(
  "/:formId/publish",
  validate({ params: formIdParamSchema }),
  formController.publishForm
);
router.post(
  "/:formId/close",
  validate({ params: formIdParamSchema }),
  formController.closeForm
);

router.post(
  "/:formId/notify",
  validate({ params: formIdParamSchema }),
  formController.shareWithAudience
);

router.get(
  "/:formId/history",
  validate({ params: formIdParamSchema }),
  formController.listHistory
);
router.post(
  "/:formId/history/:version/restore",
  validate({ params: versionParamSchema }),
  formController.restoreVersion
);

router.post(
  "/:formId/comments",
  validate({ params: formIdParamSchema, body: addCommentSchema }),
  commentController.addComment
);
router.get(
  "/:formId/comments",
  validate({ params: formIdParamSchema }),
  commentController.listComments
);
router.patch(
  "/:formId/comments/:commentId/resolve",
  validate({ params: commentParamSchema }),
  commentController.resolveComment
);
router.delete(
  "/:formId/comments/:commentId",
  validate({ params: commentParamSchema }),
  commentController.deleteComment
);

export default router;
