import { api, type Paginated } from "./api";
import type { Organization, Invitation, OrgGroup, OrgRole, OrgPermission } from "@/types/organization";
import type {
  FormDoc,
  CreateFormPayload,
  UpdateFormPayload,
  FormComment,
  FormHistoryEntry,
  FormStatus,
} from "@/types/form";
import type {
  Submission,
  CreateSubmissionPayload,
  SubmissionStats,
  UploadedFile,
} from "@/types/submission";
import type {
  ShareLink,
  CreateShareLinkPayload,
  ResolvedShare,
} from "@/types/share";
import type { AppNotification } from "@/types/notification";
import type { Plan, Subscription, Invoice, PlanName, BillingInterval } from "@/types/billing";

export const orgs = {
  list: () => api.get<Organization[]>("/organizations"),
  get: (id: string) => api.get<Organization>(`/organizations/${id}`),
  create: (body: { name: string; slug?: string; branding?: Organization["branding"] }) =>
    api.post<Organization>("/organizations", body),
  update: (id: string, body: { name?: string; branding?: Organization["branding"] }) =>
    api.patch<Organization>(`/organizations/${id}`, body),
  remove: (id: string) => api.delete(`/organizations/${id}`),
  uploadLogo: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.upload<Organization>(`/organizations/${id}/logo`, fd, "PATCH");
  },
  invite: (id: string, body: { email: string; role: Exclude<OrgRole, "owner"> }) =>
    api.post<{ invitation: Invitation; token: string }>(
      `/organizations/${id}/invitations`,
      body,
    ),
  listInvitations: (id: string) =>
    api.get<Invitation[]>(`/organizations/${id}/invitations`),
  revokeInvitation: (id: string, invId: string) =>
    api.delete(`/organizations/${id}/invitations/${invId}`),
  acceptInvitation: (token: string) =>
    api.post<Organization>("/organizations/invitations/accept", { token }),
  setMemberRole: (id: string, userId: string, role: Exclude<OrgRole, "owner">) =>
    api.patch<Organization>(`/organizations/${id}/members/${userId}`, { role }),
  setMemberPermissions: (id: string, userId: string, permissions: OrgPermission[]) =>
    api.patch<Organization>(`/organizations/${id}/members/${userId}/permissions`, {
      permissions,
    }),
  removeMember: (id: string, userId: string) =>
    api.delete(`/organizations/${id}/members/${userId}`),
  listGroups: (id: string) => api.get<OrgGroup[]>(`/organizations/${id}/groups`),
  createGroup: (id: string, body: { name: string; memberIds?: string[] }) =>
    api.post<OrgGroup>(`/organizations/${id}/groups`, body),
  updateGroup: (id: string, groupId: string, body: { name?: string; memberIds?: string[] }) =>
    api.patch<OrgGroup>(`/organizations/${id}/groups/${groupId}`, body),
  deleteGroup: (id: string, groupId: string) =>
    api.delete(`/organizations/${id}/groups/${groupId}`),
};

export const forms = {
  list: (orgId: string, status?: FormStatus) =>
    api.get<FormDoc[]>(
      `/forms?orgId=${orgId}${status ? `&status=${status}` : ""}`,
    ),
  get: (formId: string) => api.get<FormDoc>(`/forms/${formId}`),
  create: (body: CreateFormPayload) => api.post<FormDoc>("/forms", body),
  update: (formId: string, body: UpdateFormPayload) =>
    api.patch<FormDoc>(`/forms/${formId}`, body),
  remove: (formId: string) => api.delete(`/forms/${formId}`),
  publish: (formId: string) => api.post<FormDoc>(`/forms/${formId}/publish`),
  close: (formId: string) => api.post<FormDoc>(`/forms/${formId}/close`),
  notify: (formId: string) =>
    api.post<{ notified: number; audienceType: "organization" | "groups"; recipients: number }>(
      `/forms/${formId}/notify`,
    ),
  history: (formId: string) =>
    api.get<FormHistoryEntry[]>(`/forms/${formId}/history`),
  restore: (formId: string, version: number) =>
    api.post<FormDoc>(`/forms/${formId}/history/${version}/restore`),
  listComments: (formId: string) =>
    api.get<FormComment[]>(`/forms/${formId}/comments`),
  addComment: (formId: string, body: { body: string; questionId?: string }) =>
    api.post<FormComment>(`/forms/${formId}/comments`, body),
  resolveComment: (formId: string, commentId: string) =>
    api.patch<FormComment>(`/forms/${formId}/comments/${commentId}/resolve`),
  deleteComment: (formId: string, commentId: string) =>
    api.delete(`/forms/${formId}/comments/${commentId}`),
};

export const submissions = {
  list: (formId: string, page = 1, limit = 20) =>
    api.get<Paginated<Submission>>(
      `/submissions?formId=${formId}&page=${page}&limit=${limit}`,
    ),
  get: (id: string) => api.get<Submission>(`/submissions/${id}`),
  create: (body: CreateSubmissionPayload) =>
    api.post<Submission>("/submissions", body),
  remove: (id: string) => api.delete(`/submissions/${id}`),
  stats: (formId: string) =>
    api.get<SubmissionStats>(`/submissions/stats?formId=${formId}`),
  files: (id: string) => api.get<UploadedFile[]>(`/submissions/${id}/files`),
  uploadFile: (formId: string, questionId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("formId", formId);
    fd.append("questionId", questionId);
    return api.upload<UploadedFile>("/submissions/files", fd);
  },
};

export const share = {
  list: (formId: string) => api.get<ShareLink[]>(`/share?formId=${formId}`),
  create: (body: CreateShareLinkPayload) => api.post<ShareLink>("/share", body),
  revoke: (linkId: string) => api.delete(`/share/${linkId}`),
  resolve: (token: string) => api.get<ResolvedShare>(`/share/t/${token}`),
  submit: (token: string, body: { answers: CreateSubmissionPayload["answers"]; respondent?: CreateSubmissionPayload["respondent"] }) =>
    api.post<Submission>(`/share/t/${token}/submit`, body),
};

export const notifications = {
  list: (page = 1, limit = 20, unreadOnly = false) =>
    api.get<Paginated<AppNotification>>(
      `/notifications?page=${page}&limit=${limit}${unreadOnly ? "&unreadOnly=true" : ""}`,
    ),
  unreadCount: () => api.get<{ count: number }>("/notifications/unread-count"),
  markAllRead: () => api.patch<{ updated: number }>("/notifications/read-all"),
  markRead: (id: string) => api.patch<AppNotification>(`/notifications/${id}/read`),
  remove: (id: string) => api.delete(`/notifications/${id}`),
};

export const billing = {
  plans: () => api.get<Plan[]>("/billing/plans"),
  subscription: (orgId: string) =>
    api.get<Subscription>(`/billing/subscription?orgId=${orgId}`),
  change: (orgId: string, plan: PlanName, interval: BillingInterval) =>
    api.post<Subscription>("/billing/subscription/change", { orgId, plan, interval }),
  cancel: (orgId: string, atPeriodEnd = true) =>
    api.post<Subscription>("/billing/subscription/cancel", { orgId, atPeriodEnd }),
  invoices: (orgId: string) => api.get<Invoice[]>(`/billing/invoices?orgId=${orgId}`),
};

export const users = {
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.upload("/users/avatar", fd, "PATCH");
  },
};

export const auth = {
  logout: () => api.post("/auth/logout"),
};
