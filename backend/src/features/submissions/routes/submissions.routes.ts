import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../../../middleware/auth";
import { validate } from "../../../middleware/validate";
import { uploadImage } from "../../../middleware/upload";
import * as submissionController from "../controller/submission.controller";
import * as uploadedFileController from "../controller/uploadedFile.controller";
import {
  createSubmissionSchema,
  listSubmissionsQuerySchema,
  submissionIdParamSchema,
  submissionStatsQuerySchema,
  uploadFileBodySchema,
} from "../dtos/submissions.dtos";

const router: ExpressRouter = Router();

router.use(authenticate);

router.post(
  "/files",
  uploadImage,
  validate({ body: uploadFileBodySchema }),
  uploadedFileController.registerUpload
);
router.get(
  "/stats",
  validate({ query: submissionStatsQuerySchema }),
  submissionController.getSubmissionStats
);

router.post(
  "/",
  validate({ body: createSubmissionSchema }),
  submissionController.createSubmission
);
router.get(
  "/",
  validate({ query: listSubmissionsQuerySchema }),
  submissionController.listSubmissions
);

router.get(
  "/:submissionId",
  validate({ params: submissionIdParamSchema }),
  submissionController.getSubmission
);
router.delete(
  "/:submissionId",
  validate({ params: submissionIdParamSchema }),
  submissionController.deleteSubmission
);
router.get(
  "/:submissionId/files",
  validate({ params: submissionIdParamSchema }),
  submissionController.listSubmissionFiles
);

export default router;
