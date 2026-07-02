import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { key: "organization", label: "Organization" },
  { key: "branding", label: "Branding" },
  { key: "team", label: "Invite team" },
] as const;

export type OnboardingStep = (typeof steps)[number]["key"];

export function OnboardingStepper({ current }: { current: OnboardingStep }) {
  const currentIndex = steps.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  done && "bg-teal-600 text-white",
                  active && "bg-indigo-600 text-white",
                  !done && !active && "bg-ink-100 text-ink-500",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  active ? "text-ink-900" : "text-ink-500",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "h-0.5 w-8 sm:w-12",
                  i < currentIndex ? "bg-teal-600" : "bg-ink-100",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
