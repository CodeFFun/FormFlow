import { Router, type Router as ExpressRouter } from "express";
import { authenticate } from "../../../middleware/auth";
import { uploadImage } from "../../../middleware/upload";
import { validate } from "../../../middleware/validate";
import * as organizationController from "../controller/organization.controller";
import {
  acceptInvitationSchema,
  createGroupSchema,
  createOrganizationSchema,
  groupParamSchema,
  invitationParamSchema,
  inviteMemberSchema,
  memberParamSchema,
  orgIdParamSchema,
  updateGroupSchema,
  updateMemberPermissionsSchema,
  updateMemberRoleSchema,
  updateOrganizationSchema,
} from "../dtos/organization.dtos";

const router: ExpressRouter = Router();

router.use(authenticate);

router.post(
  "/invitations/accept",
  validate({ body: acceptInvitationSchema }),
  organizationController.acceptInvitation
);

router.post(
  "/",
  validate({ body: createOrganizationSchema }),
  organizationController.createOrganization
);
router.get("/", organizationController.listMyOrganizations);
router.get(
  "/:orgId",
  validate({ params: orgIdParamSchema }),
  organizationController.getOrganization
);
router.patch(
  "/:orgId",
  validate({ params: orgIdParamSchema, body: updateOrganizationSchema }),
  organizationController.updateOrganization
);
router.delete(
  "/:orgId",
  validate({ params: orgIdParamSchema }),
  organizationController.deleteOrganization
);

router.patch(
  "/:orgId/logo",
  uploadImage,
  validate({ params: orgIdParamSchema }),
  organizationController.uploadLogo
);

router.post(
  "/:orgId/invitations",
  validate({ params: orgIdParamSchema, body: inviteMemberSchema }),
  organizationController.inviteMember
);
router.get(
  "/:orgId/invitations",
  validate({ params: orgIdParamSchema }),
  organizationController.listInvitations
);
router.delete(
  "/:orgId/invitations/:invitationId",
  validate({ params: invitationParamSchema }),
  organizationController.revokeInvitation
);

router.patch(
  "/:orgId/members/:userId",
  validate({ params: memberParamSchema, body: updateMemberRoleSchema }),
  organizationController.updateMemberRole
);
router.patch(
  "/:orgId/members/:userId/permissions",
  validate({ params: memberParamSchema, body: updateMemberPermissionsSchema }),
  organizationController.updateMemberPermissions
);
router.delete(
  "/:orgId/members/:userId",
  validate({ params: memberParamSchema }),
  organizationController.removeMember
);

router.get(
  "/:orgId/groups",
  validate({ params: orgIdParamSchema }),
  organizationController.listGroups
);
router.post(
  "/:orgId/groups",
  validate({ params: orgIdParamSchema, body: createGroupSchema }),
  organizationController.createGroup
);
router.patch(
  "/:orgId/groups/:groupId",
  validate({ params: groupParamSchema, body: updateGroupSchema }),
  organizationController.updateGroup
);
router.delete(
  "/:orgId/groups/:groupId",
  validate({ params: groupParamSchema }),
  organizationController.deleteGroup
);

export default router;
