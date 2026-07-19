"use client";

import { useMemo, useState } from "react";
import { useOnlineGuard } from "@/hooks/useOnlineGuard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { QuestionCard } from "./QuestionCard";
import { FillProgressBar } from "./FillProgressBar";
import { FormIntroCard } from "./FormIntroCard";
import { SubmissionConfirmation } from "./SubmissionConfirmation";
import { validateAnswers, buildAnswers, isEmpty } from "@/lib/validateAnswers";
import { ApiError } from "@/lib/api";
import type { FormDoc } from "@/types/form";
import type { Answer, AnswerValue, Respondent } from "@/types/submission";

export interface FillFormProps {
  form: FormDoc;
  orgName?: string;
  logoUrl?: string;
  collectRespondent?: boolean;
  allowFileUpload?: boolean;
  onSubmit: (answers: Answer[], respondent?: Respondent) => Promise<void>;
}

export function FillForm({
  form,
  orgName,
  logoUrl,
  collectRespondent = false,
  allowFileUpload = true,
  onSubmit,
}: FillFormProps) {
  const questions = useMemo(
    () => [...(form.questions ?? [])].sort((a, b) => a.position - b.position),
    [form.questions],
  );

  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerValue | undefined>>(
    {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [respondent, setRespondent] = useState<Respondent>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const offline = useOnlineGuard();

  const answeredCount = questions.filter((q) => !isEmpty(answers[q.id])).length;

  function setAnswer(id: string, value: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function handleSubmit() {
    const validation = validateAnswers(questions, answers);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      const firstId = questions.find((q) => validation[q.id])?.id;
      if (firstId) {
        document
          .getElementById(`q-${firstId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = buildAnswers(questions, answers);
      const resp =
        collectRespondent && (respondent.email || respondent.name)
          ? respondent
          : undefined;
      await onSubmit(payload, resp);
      setDone(true);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Could not submit your response.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <SubmissionConfirmation
        message={form.settings?.confirmationMessage}
        orgName={orgName}
      />
    );
  }

  if (!started) {
    return (
      <FormIntroCard
        form={form}
        orgName={orgName}
        logoUrl={logoUrl}
        onStart={() => setStarted(true)}
      />
    );
  }

  return (
    <div>
      {form.settings?.showProgressBar && (
        <FillProgressBar answered={answeredCount} total={questions.length} />
      )}

      <div className="mt-4 space-y-4">
        {collectRespondent && (
          <div className="rounded-xl border border-ink-100 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg text-ink-900">About you</h2>
            <p className="mt-0.5 text-sm text-ink-500">Optional — helps us follow up.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="r-name">Name</Label>
                <Input
                  id="r-name"
                  className="mt-1.5"
                  value={respondent.name ?? ""}
                  onChange={(e) =>
                    setRespondent((r) => ({ ...r, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="r-email">Email</Label>
                <Input
                  id="r-email"
                  type="email"
                  className="mt-1.5"
                  value={respondent.email ?? ""}
                  onChange={(e) =>
                    setRespondent((r) => ({ ...r, email: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        )}

        {questions.map((q, i) => (
          <div key={q.id} id={`q-${q.id}`}>
            <QuestionCard
              question={q}
              index={i}
              value={answers[q.id]}
              onChange={(v) => setAnswer(q.id, v)}
              error={errors[q.id]}
              formId={form._id}
              allowFileUpload={allowFileUpload}
            />
          </div>
        ))}

        {submitError && (
          <p className="rounded-md bg-coral-50 px-4 py-3 text-sm text-coral-600">
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-between pb-12">
          <p className="text-xs text-ink-300">
            {Object.keys(errors).length > 0
              ? "Please fix the highlighted questions."
              : ""}
          </p>
          <Button
            size="lg"
            onClick={handleSubmit}
            loading={submitting}
            disabled={offline}
          >
            Submit response
          </Button>
        </div>
      </div>
    </div>
  );
}
