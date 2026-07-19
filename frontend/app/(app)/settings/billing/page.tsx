"use client";

import { useState } from "react";
import useSWR from "swr";
import { billing as billingService } from "@/lib/services";
import { ApiError } from "@/lib/api";
import { useOrg } from "@/components/providers/OrgProvider";
import { CurrentPlanCard } from "@/components/settings/billing/CurrentPlanCard";
import { PlanComparisonCards } from "@/components/settings/billing/PlanComparisonCards";
import { InvoiceHistory } from "@/components/settings/billing/InvoiceHistory";
import { UpgradeModal } from "@/components/settings/billing/UpgradeModal";
import { Button } from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { Lock } from "lucide-react";
import type { Plan, BillingInterval } from "@/types/billing";

export default function BillingSettingsPage() {
  const { currentOrg, isOwner, isAdmin, loading } = useOrg();
  const { success, error: toastError } = useToast();
  const canView = isOwner || isAdmin;
  const orgId = currentOrg?._id;

  const { data: plans } = useSWR("/billing/plans", () => billingService.plans());
  const { data: subscription, mutate: mutateSub } = useSWR(
    orgId && canView ? ["subscription", orgId] : null,
    () => billingService.subscription(orgId as string),
  );
  const { data: invoices } = useSWR(
    orgId && canView ? ["invoices", orgId] : null,
    () => billingService.invoices(orgId as string),
  );

  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [selected, setSelected] = useState<Plan | null>(null);
  const [changing, setChanging] = useState(false);
  const [canceling, setCanceling] = useState(false);

  if (loading) return <LoadingState />;

  if (!canView) {
    return (
      <EmptyState
        icon={Lock}
        title="Owners & admins only"
        description="You don't have access to billing for this organization."
      />
    );
  }

  async function confirmChange() {
    if (!orgId || !selected) return;
    setChanging(true);
    try {
      await billingService.change(orgId, selected.name, interval);
      success(`Switched to the ${selected.name} plan.`);
      setSelected(null);
      void mutateSub();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not change plan.");
    } finally {
      setChanging(false);
    }
  }

  async function cancel() {
    if (!orgId) return;
    setCanceling(true);
    try {
      await billingService.cancel(orgId, true);
      success("Subscription will cancel at the period end.");
      void mutateSub();
    } catch (err) {
      toastError(err instanceof ApiError ? err.message : "Could not cancel.");
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className="space-y-8">
      {subscription && <CurrentPlanCard subscription={subscription} />}

      {plans ? (
        <PlanComparisonCards
          plans={plans}
          currentPlan={subscription?.plan.name}
          interval={interval}
          onIntervalChange={setInterval}
          onSelect={setSelected}
        />
      ) : (
        <LoadingState label="Loading plans…" />
      )}

      {subscription &&
        subscription.plan.name !== "free" &&
        !subscription.cancelAtPeriodEnd &&
        isOwner && (
          <div className="flex justify-end">
            <Button variant="ghost" onClick={cancel} loading={canceling}>
              Cancel subscription
            </Button>
          </div>
        )}

      {invoices && <InvoiceHistory invoices={invoices} />}

      <UpgradeModal
        plan={selected}
        interval={interval}
        loading={changing}
        onClose={() => setSelected(null)}
        onConfirm={confirmChange}
      />
    </div>
  );
}
