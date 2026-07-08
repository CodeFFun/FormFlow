import { FormModel, FormDocument } from "../models/form.model";
import {
  FormAudience,
  FormSettings,
  FormStatus,
  Question,
} from "../types/forms.types";

export const createForm = async (
  data: Pick<FormDocument, "orgId" | "title" | "createdBy"> & {
    description?: string;
    questions?: Question[];
    settings?: Partial<FormSettings>;
    audience?: FormAudience;
    status?: FormStatus;
  }
): Promise<FormDocument> => {
  return FormModel.create(data);
};

export const findFormById = async (id: string): Promise<FormDocument | null> => {
  return FormModel.findById(id).lean<FormDocument>().exec();
};

export const findFormsByOrg = async (
  orgId: string,
  status?: FormStatus
): Promise<FormDocument[]> => {
  const filter: Record<string, unknown> = { orgId };
  if (status) {
    filter.status = status;
  }
  return FormModel.find(filter).sort({ updatedAt: -1 }).lean<FormDocument[]>().exec();
};

export const updateForm = async (
  id: string,
  update: Partial<
    Pick<
      FormDocument,
      "title" | "description" | "questions" | "settings" | "audience" | "status"
    >
  >
): Promise<FormDocument | null> => {
  return FormModel.findByIdAndUpdate(id, update, { new: true })
    .lean<FormDocument>()
    .exec();
};

export const deleteForm = async (id: string): Promise<FormDocument | null> => {
  return FormModel.findByIdAndDelete(id).lean<FormDocument>().exec();
};
