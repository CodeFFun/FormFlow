"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import type { Plan, BillingInterval } from "@/types/billing";

export interface UpgradeModalProps {
  plan: Plan | null;
  interval: BillingInterval;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UpgradeModal({
  plan,
  interval,
  loading,
  onClose,
  onConfirm,
}: UpgradeModalProps) {
  if (!plan) return null;
  const price = interval === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <Modal
      open={Boolean(plan)}
      onClose={onClose}
      title={`Switch to ${plan.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} loading={loading}>
            {price === 0 ? "Switch plan" : "Confirm & pay"}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm text-ink-500">
        <p>
          You&apos;re switching to the{" "}
          <span className="font-medium capitalize text-ink-900">{plan.name}</span>{" "}
          plan, billed {interval}.
        </p>
        <div className="flex items-center justify-between rounded-md bg-ink-50 px-4 py-3">
          <span className="capitalize text-ink-900">{plan.name} · {interval}</span>
          <span className="font-serif text-lg text-ink-900">
            {price === 0
              ? "Free"
              : `${formatCurrency(price, plan.currency)}/${interval === "yearly" ? "yr" : "mo"}`}
          </span>
        </div>
        <p className="text-xs text-ink-300">
          Payment is simulated — no real charge is made.
        </p>
      </div>
    </Modal>
  );
}
