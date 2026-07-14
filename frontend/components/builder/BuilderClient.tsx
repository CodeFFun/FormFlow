"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ListChecks, Settings2, FilePlus2 } from "lucide-react";
import { forms as formService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useOrg } from "@/components/providers/OrgProvider";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useToast } from "@/components/ui/Toast";
import { genId, typeHasOptions } from "@/lib/questionTypes";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { BuilderNavbar } from "./BuilderNavbar";
import { QuestionTypePanel } from "./QuestionTypePanel";
import { QuestionBlock } from "./QuestionBlock";
import { FormSettingsPanel } from "./FormSettingsPanel";
import { cn } from "@/lib/utils";
import type {
  FormDoc,
  Question,
  QuestionType,
  FormSettings,
  FormAudience,
  FormStatus,
  UpdateFormPayload,
} from "@/types/form";

const DEFAULT_SETTINGS: FormSettings = {
  allowMultipleSubmissions: false,
  requireLogin: false,
  showProgressBar: true,
};

export function BuilderClient({ initialForm }: { initialForm: FormDoc }) {
  const router = useRouter();
  const { currentOrg } = useOrg();
  const { success, error: toastError } = useToast();

  const [title, setTitle] = useState(initialForm.title);
  const [description, setDescription] = useState(initialForm.description ?? "");
  const [questions, setQuestions] = useState<Question[]>(
    initialForm.questions ?? [],
  );
  const [settings, setSettings] = useState<FormSettings>({
    ...DEFAULT_SETTINGS,
    ...initialForm.settings,
  });
  const [audience, setAudience] = useState<FormAudience>(
    initialForm.audience ?? { type: "organization" },
  );
  const [status, setStatus] = useState<FormStatus>(initialForm.status);
  const [tab, setTab] = useState<"build" | "settings">("build");
  const [publishing, setPublishing] = useState(false);

  const save = useCallback(
    (payload: UpdateFormPayload) => formService.update(initialForm._id, payload),
    [initialForm._id],
  );
  const { status: saveStatus, schedule, flush } = useAutoSave(save);

  const persist = useCallback(
    (overrides?: Partial<UpdateFormPayload>) => {
      schedule({
        title,
        description,
        questions,
        settings,
        audience,
        ...overrides,
      });
    },
    [schedule, title, description, questions, settings, audience],
  );

  function updateTitle(value: string) {
    setTitle(value);
    schedule({ title: value, description, questions, settings, audience });
  }

  function setQuestionsAndSave(next: Question[]) {
    const reindexed = next.map((q, i) => ({ ...q, position: i }));
    setQuestions(reindexed);
    schedule({ title, description, questions: reindexed, settings, audience });
  }

  function addQuestion(type: QuestionType) {
    const q: Question = {
      id: genId(),
      type,
      title: "",
      required: false,
      position: questions.length,
      ...(typeHasOptions(type)
        ? {
            options: [
              { id: genId("o"), label: "Option 1", value: "Option 1" },
              { id: genId("o"), label: "Option 2", value: "Option 2" },
            ],
          }
        : {}),
    };
    setQuestionsAndSave([...questions, q]);
    setTab("build");
  }

  function updateQuestion(q: Question) {
    setQuestionsAndSave(questions.map((x) => (x.id === q.id ? q : x)));
  }

  function deleteQuestion(id: string) {
    setQuestionsAndSave(questions.filter((q) => q.id !== id));
  }

  function duplicateQuestion(id: string) {
    const idx = questions.findIndex((q) => q.id === id);
    if (idx < 0) return;
    const copy: Question = {
      ...questions[idx],
      id: genId(),
      options: questions[idx].options?.map((o) => ({ ...o, id: genId("o") })),
    };
    const next = [...questions];
    next.splice(idx + 1, 0, copy);
    setQuestionsAndSave(next);
  }

  function moveQuestion(id: string, dir: -1 | 1) {
    const idx = questions.findIndex((q) => q.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[idx], next[target]] = [next[target], next[idx]];
    setQuestionsAndSave(next);
  }

  function changeSettings(next: FormSettings) {
    setSettings(next);
    schedule({ title, description, questions, settings: next, audience });
  }

  function changeAudience(next: FormAudience) {
    setAudience(next);
    schedule({ title, description, questions, settings, audience: next });
  }

  async function publish() {
    if (questions.length === 0) {
      toastError("Add at least one question before publishing.");
      return;
    }
    setPublishing(true);
    try {
      await flush();
      const updated = await formService.publish(initialForm._id);
      setStatus(updated.status);
      success("Form published 🎉");
      router.push(`/forms/${initialForm._id}/share`);
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not publish.");
    } finally {
      setPublishing(false);
    }
  }

  async function closeForm() {
    setPublishing(true);
    try {
      const updated = await formService.close(initialForm._id);
      setStatus(updated.status);
      success("Form closed to new responses.");
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not close form.");
    } finally {
      setPublishing(false);
    }
  }

  const groups = useMemo(() => currentOrg?.groups ?? [], [currentOrg]);

  return (
    <div>
      <BuilderNavbar
        formId={initialForm._id}
        title={title}
        status={status}
        saveStatus={saveStatus}
        publishing={publishing}
        onTitleChange={updateTitle}
        onPublish={publish}
        onClose={closeForm}
      />

      <div className="mb-5 flex gap-2">
        {(["build", "settings"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              if (t === "settings") void flush();
              setTab(t);
            }}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium capitalize",
              tab === t
                ? "bg-indigo-600 text-white"
                : "text-ink-500 hover:bg-ink-100",
            )}
          >
            {t === "build" ? (
              <ListChecks className="h-4 w-4" />
            ) : (
              <Settings2 className="h-4 w-4" />
            )}
            {t}
          </button>
        ))}
      </div>

      {tab === "build" ? (
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-ink-100 bg-white p-4">
              <QuestionTypePanel onAdd={addQuestion} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <textarea
                className="w-full resize-none rounded-xl border border-ink-100 bg-white p-4 text-sm text-ink-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                placeholder="Add a form description (optional)"
                rows={2}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  persist({ description: e.target.value });
                }}
              />
            </div>

            {questions.length === 0 ? (
              <EmptyState
                icon={FilePlus2}
                title="No questions yet"
                description="Pick a question type from the left to get started."
              />
            ) : (
              questions.map((q, i) => (
                <QuestionBlock
                  key={q.id}
                  question={q}
                  index={i}
                  total={questions.length}
                  onChange={updateQuestion}
                  onDelete={() => deleteQuestion(q.id)}
                  onDuplicate={() => duplicateQuestion(q.id)}
                  onMove={(dir) => moveQuestion(q.id, dir)}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl">
          <FormSettingsPanel
            settings={settings}
            audience={audience}
            groups={groups}
            onSettingsChange={changeSettings}
            onAudienceChange={changeAudience}
          />
        </div>
      )}
    </div>
  );
}
