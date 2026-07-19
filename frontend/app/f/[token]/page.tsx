"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { Unlink, Lock } from "lucide-react";
import { share as shareService } from "@/lib/services";
import { FillForm } from "@/components/fill/FillForm";
import { TrustBar } from "@/components/fill/TrustBar";
import { OfflineBanner } from "@/components/fill/OfflineBanner";
import { LoadingState } from "@/components/ui/Spinner";
import type { Answer, Respondent } from "@/types/submission";

function FillStateScreen({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Unlink;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-xl border border-ink-100 bg-white p-10 text-center shadow-sm">
        <span className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-500">
          <Icon className="h-7 w-7" />
        </span>
        <h1 className="font-serif text-2xl text-ink-900">{title}</h1>
        <p className="mt-2 text-sm text-ink-500">{description}</p>
      </div>
    </div>
  );
}

export default function PublicFillPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useSWR(
    token ? ["share-token", token] : null,
    () => shareService.resolve(token),
    { shouldRetryOnError: false },
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label="Loading form…" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <FillStateScreen
        icon={Unlink}
        title="This link isn't available"
        description="The link may have expired, been revoked, or already been used. Ask the sender for a new one."
      />
    );
  }

  const { form } = data;

  if (form.status === "closed" || form.status === "archived") {
    return (
      <FillStateScreen
        icon={Lock}
        title="This form is closed"
        description="It's no longer accepting responses. Thanks for stopping by."
      />
    );
  }

  async function submit(answers: Answer[], respondent?: Respondent) {
    await shareService.submit(token, { answers, respondent });
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <OfflineBanner />
      <div className="mx-auto max-w-2xl px-4 py-8">
        <FillForm
          form={form}
          collectRespondent={data.share.type === "magic_link"}
          allowFileUpload={false}
          onSubmit={submit}
        />
        <TrustBar />
      </div>
    </div>
  );
}
