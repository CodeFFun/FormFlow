import { ForbiddenError, NotFoundError } from "../../../errors/http-error";
import { generateToken } from "../../../utils/token";
import { FRONTEND_URL } from "../../../config";
import { sendFormInviteEmail } from "../../../middleware/nodemailer";
import * as formService from "../../forms/services/form.service";
import * as submissionService from "../../submissions/services/submission.service";
import { Form } from "../../forms/types/forms.types";
import * as shareRepo from "../repository/shareLink.repository";
import { ShareLinkDocument } from "../models/shareLink.model";
import {
  PublicShareLink,
  ShareLink,
  ShareLinkStatus,
  ShareLinkType,
} from "../types/share.types";
import { CreateShareLinkDto, PublicSubmitDto } from "../dtos/share.dtos";

const toPublicLink = (link: ShareLinkDocument): PublicShareLink => ({
  type: link.type,
  formId: link.formId,
});

const resolveActiveLink = async (token: string): Promise<ShareLinkDocument> => {
  const link = await shareRepo.findShareLinkByToken(token);
  if (!link || link.status !== ShareLinkStatus.ACTIVE) {
    throw new NotFoundError("Share link not found or no longer active");
  }
  if (link.expiresAt && new Date(link.expiresAt).getTime() < Date.now()) {
    throw new ForbiddenError("This share link has expired");
  }
  if (typeof link.maxUses === "number" && link.usageCount >= link.maxUses) {
    throw new ForbiddenError("This share link has reached its usage limit");
  }
  return link;
};

export const createShareLink = async (
  userId: string,
  dto: CreateShareLinkDto
): Promise<ShareLink> => {
  const form = await formService.getManageableForm(userId, dto.formId);

  const maxUses =
    dto.maxUses ??
    (dto.type === ShareLinkType.INDIVIDUAL_INVITE ? 1 : undefined);

  const link = await shareRepo.createShareLink({
    formId: form._id,
    orgId: form.orgId,
    type: dto.type,
    token: generateToken(),
    email: dto.email,
    expiresAt: dto.expiresAt,
    maxUses,
    createdBy: userId,
  });

  if (link.type === ShareLinkType.INDIVIDUAL_INVITE && link.email) {
    try {
      await sendFormInviteEmail(link.email, {
        formTitle: form.title,
        fillUrl: `${FRONTEND_URL}/f/${link.token}`,
      });
    } catch (err) {
      console.error("Failed to send form invitation email:", err);
    }
  }

  return link;
};

export const listShareLinks = async (
  userId: string,
  formId: string
): Promise<ShareLink[]> => {
  await formService.getManageableForm(userId, formId);
  return shareRepo.listShareLinksByForm(formId);
};

export const revokeShareLink = async (
  userId: string,
  linkId: string
): Promise<ShareLink> => {
  const link = await shareRepo.findShareLinkById(linkId);
  if (!link) {
    throw new NotFoundError("Share link not found");
  }
  await formService.getManageableForm(userId, link.formId);

  const updated = await shareRepo.updateShareLinkStatus(
    linkId,
    ShareLinkStatus.REVOKED
  );
  if (!updated) {
    throw new NotFoundError("Share link not found");
  }
  return updated;
};

export const resolveShareLink = async (
  token: string
): Promise<{ share: PublicShareLink; form: Form }> => {
  const link = await resolveActiveLink(token);
  const form = await formService.getPublishedForm(link.formId);
  return { share: toPublicLink(link), form };
};

export const submitViaShareLink = async (
  token: string,
  dto: PublicSubmitDto
) => {
  const link = await resolveActiveLink(token);
  const form = await formService.getPublishedForm(link.formId);

  const respondent: { userId?: string; email?: string; name?: string } = {};
  if (link.type === ShareLinkType.INDIVIDUAL_INVITE) {
    respondent.email = link.email;
  } else if (dto.respondent?.email) {
    respondent.email = dto.respondent.email;
  }
  if (dto.respondent?.name) {
    respondent.name = dto.respondent.name;
  }

  const submission = await submissionService.createPublicSubmission(
    form,
    respondent,
    dto.answers
  );

  const updated = await shareRepo.incrementShareLinkUsage(link._id);
  if (
    updated &&
    typeof updated.maxUses === "number" &&
    updated.usageCount >= updated.maxUses
  ) {
    await shareRepo.updateShareLinkStatus(updated._id, ShareLinkStatus.REVOKED);
  }

  return submission;
};
