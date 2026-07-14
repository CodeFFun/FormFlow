"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  FileText,
  BarChart3,
  Share2,
  Trash2,
  PencilLine,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FormStatusBadge } from "@/components/forms/FormStatusBadge";
import { formatDate } from "@/lib/utils";
import type { FormDoc } from "@/types/form";

export interface FormCardProps {
  form: FormDoc;
  isManager: boolean;
  onDelete?: (form: FormDoc) => void;
}

export function FormCard({ form, isManager, onDelete }: FormCardProps) {
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const primaryHref = isManager
    ? `/forms/${form._id}`
    : `/forms/${form._id}/fill`;

  return (
    <Card className="group relative flex flex-col transition-shadow hover:shadow-md">
      <Link href={primaryHref} className="flex-1 p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <FileText className="h-5 w-5" />
          </span>
          <FormStatusBadge status={form.status} />
        </div>
        <h3 className="mt-4 line-clamp-1 font-serif text-lg text-ink-900">
          {form.title || "Untitled form"}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-ink-500">
          {form.description || "No description"}
        </p>
        <div className="mt-4 flex items-center gap-3 text-xs text-ink-500">
          <span>{form.questions?.length ?? 0} questions</span>
          <span aria-hidden>·</span>
          <span>Updated {formatDate(form.updatedAt)}</span>
        </div>
      </Link>

      {isManager && (
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setMenu((v) => !v);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 opacity-0 transition hover:bg-ink-100 group-hover:opacity-100"
            aria-label="Form actions"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-ink-100 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => router.push(`/forms/${form._id}`)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-900 hover:bg-ink-50"
                >
                  <PencilLine className="h-4 w-4" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/forms/${form._id}/responses`)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-900 hover:bg-ink-50"
                >
                  <BarChart3 className="h-4 w-4" /> Responses
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/forms/${form._id}/share`)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-900 hover:bg-ink-50"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenu(false);
                      onDelete(form);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-coral-600 hover:bg-coral-50"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
