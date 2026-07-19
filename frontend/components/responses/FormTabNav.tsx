"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PencilLine, Inbox, BarChart3, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormTabNavProps {
  formId: string;
  title?: string;
}

export function FormTabNav({ formId, title }: FormTabNavProps) {
  const pathname = usePathname();
  const base = `/forms/${formId}`;
  const tabs = [
    { href: base, label: "Edit", icon: PencilLine, exact: true },
    { href: `${base}/responses`, label: "Responses", icon: Inbox },
    { href: `${base}/analytics`, label: "Analytics", icon: BarChart3 },
    { href: `${base}/settings`, label: "Settings", icon: Settings2 },
  ];

  return (
    <div className="mb-6 border-b border-ink-100">
      {title && (
        <h1 className="mb-3 font-serif text-2xl text-ink-900">{title}</h1>
      )}
      <nav className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const active = t.exact
            ? pathname === t.href
            : pathname.startsWith(t.href);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-ink-500 hover:text-ink-900",
              )}
            >
              <Icon className="h-4 w-4" /> {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
