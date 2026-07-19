import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { FormDoc } from "@/types/form";

export interface FormIntroCardProps {
  form: FormDoc;
  orgName?: string;
  logoUrl?: string;
  onStart: () => void;
}

export function FormIntroCard({ form, orgName, logoUrl, onStart }: FormIntroCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-100 bg-white shadow-sm">
      <div className="h-2 bg-indigo-600" />
      <div className="p-8 text-center">
        {(logoUrl || orgName) && (
          <div className="mb-4 flex justify-center">
            <Avatar name={orgName} src={logoUrl} size="lg" />
          </div>
        )}
        <h1 className="font-serif text-3xl text-ink-900">
          {form.title || "Untitled form"}
        </h1>
        {form.description && (
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-500">
            {form.description}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-ink-500">
          <span>{form.questions?.length ?? 0} questions</span>
          {form.settings?.maxResponses && (
            <>
              <span aria-hidden>·</span>
              <span>Limited responses</span>
            </>
          )}
        </div>
        <Button size="lg" className="mt-8" onClick={onStart}>
          Start
        </Button>
      </div>
    </div>
  );
}
