"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { cn, formatCurrency } from "@/lib/utils";
import type { Plan, PlanName, BillingInterval } from "@/types/billing";

export interface PlanComparisonCardsProps {
  plans: Plan[];
  currentPlan?: PlanName;
  interval: BillingInterval;
  onIntervalChange: (interval: BillingInterval) => void;
  onSelect: (plan: Plan) => void;
}

function featureList(plan: Plan): string[] {
  const out: string[] = [];
  if (plan.limits.forms != null)
    out.push(`${plan.limits.forms} forms`);
  if (plan.limits.responsesPerMonth != null)
    out.push(`${plan.limits.responsesPerMonth.toLocaleString()} responses / mo`);
  if (plan.limits.members != null)
    out.push(`${plan.limits.members} team members`);
  for (const [key, val] of Object.entries(plan.features ?? {})) {
    if (val === true) out.push(key.replace(/_/g, " "));
  }
  return out.length ? out : ["Core form building"];
}

export function PlanComparisonCards({
  plans,
  currentPlan,
  interval,
  onIntervalChange,
  onSelect,
}: PlanComparisonCardsProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-3">
        <span className="text-sm text-ink-500">Monthly</span>
        <Toggle
          checked={interval === "yearly"}
          onChange={(v) => onIntervalChange(v ? "yearly" : "monthly")}
        />
        <span className="text-sm text-ink-500">
          Yearly <span className="text-teal-600">(2 months free)</span>
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const price =
            interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
          const isCurrent = plan.name === currentPlan;
          const featured = plan.name === "pro";
          return (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col rounded-xl border bg-white p-6",
                featured ? "border-indigo-600 shadow-md" : "border-ink-100",
              )}
            >
              {featured && (
                <span className="mb-2 inline-flex w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  Most popular
                </span>
              )}
              <h3 className="font-serif text-xl capitalize text-ink-900">
                {plan.name}
              </h3>
              <p className="mt-2">
                <span className="font-serif text-3xl text-ink-900">
                  {price === 0 ? "Free" : formatCurrency(price, plan.currency)}
                </span>
                {price > 0 && (
                  <span className="text-sm text-ink-500">
                    /{interval === "yearly" ? "yr" : "mo"}
                  </span>
                )}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {featureList(plan).map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-500">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    <span className="capitalize">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6"
                variant={featured ? "primary" : "outline"}
                disabled={isCurrent}
                onClick={() => onSelect(plan)}
              >
                {isCurrent ? "Current plan" : "Choose plan"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
