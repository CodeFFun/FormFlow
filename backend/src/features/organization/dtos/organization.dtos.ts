import { z } from "zod";
import { OrgPermission, OrgRole } from "../types/organization.types";

const brandingSchema = z.object({
  logoUrl: z.string().min(1).max(2048).optional(),
  primaryColor: z.string().min(1).max(32).optional(),
  secondaryColor: z.string().min(1).max(32).optional(),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and dashes")
    .optional(),
  branding: brandingSchema.optional(),
});
export type CreateOrganizationDto = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    branding: brandingSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateOrganizationDto = z.infer<typeof updateOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: z.email(),
  role: z.enum([OrgRole.ADMIN, OrgRole.MEMBER]),
});
export type InviteMemberDto = z.infer<typeof inviteMemberSchema>;

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});
export type AcceptInvitationDto = z.infer<typeof acceptInvitationSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum([OrgRole.ADMIN, OrgRole.MEMBER]),
});
export type UpdateMemberRoleDto = z.infer<typeof updateMemberRoleSchema>;

export const updateMemberPermissionsSchema = z.object({
  permissions: z.array(z.nativeEnum(OrgPermission)),
});
export type UpdateMemberPermissionsDto = z.infer<
  typeof updateMemberPermissionsSchema
>;

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  memberIds: z.array(z.string().min(1)).optional(),
});
export type CreateGroupDto = z.infer<typeof createGroupSchema>;

export const updateGroupSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    memberIds: z.array(z.string().min(1)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdateGroupDto = z.infer<typeof updateGroupSchema>;

export const groupParamSchema = z.object({
  orgId: z.string().min(1),
  groupId: z.string().min(1),
});

export const orgIdParamSchema = z.object({
  orgId: z.string().min(1),
});

export const memberParamSchema = z.object({
  orgId: z.string().min(1),
  userId: z.string().min(1),
});

export const invitationParamSchema = z.object({
  orgId: z.string().min(1),
  invitationId: z.string().min(1),
});
