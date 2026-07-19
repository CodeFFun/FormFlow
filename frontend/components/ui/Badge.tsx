import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "neutral"
  | "indigo"
  | "teal"
  | "coral"
  | "amber";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const tones: Record<BadgeTone, string> = {
  neutral: "bg-ink-100 text-ink-500",
  indigo: "bg-indigo-50 text-indigo-700",
  teal: "bg-teal-50 text-teal-600",
  coral: "bg-coral-50 text-coral-600",
  amber: "bg-amber-50 text-amber-600",
};

export function Badge({
  className,
  tone = "neutral",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
