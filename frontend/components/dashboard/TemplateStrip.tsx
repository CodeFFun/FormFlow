"use client";

import { useRouter } from "next/navigation";
import { MessageSquare, Star, CalendarCheck, ClipboardList, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const templates = [
  { key: "blank", label: "Blank form", icon: Plus, tint: "bg-indigo-50 text-indigo-600" },
  { key: "feedback", label: "Feedback survey", icon: MessageSquare, tint: "bg-teal-50 text-teal-600" },
  { key: "nps", label: "Satisfaction (NPS)", icon: Star, tint: "bg-amber-50 text-amber-600" },
  { key: "rsvp", label: "Event RSVP", icon: CalendarCheck, tint: "bg-coral-50 text-coral-600" },
  { key: "intake", label: "Intake form", icon: ClipboardList, tint: "bg-indigo-50 text-indigo-600" },
];

export function TemplateStrip() {
  const router = useRouter();
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {templates.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => router.push("/forms/new")}
            className="flex w-36 shrink-0 flex-col items-start gap-3 rounded-xl border border-ink-100 bg-white p-4 text-left transition-shadow hover:shadow-md"
          >
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", t.tint)}>
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink-900">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
