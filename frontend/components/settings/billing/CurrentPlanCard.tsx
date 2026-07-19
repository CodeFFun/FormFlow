import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Subscription } from "@/types/billing";

const planLabels: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
};

export function CurrentPlanCard({ subscription }: { subscription: Subscription }) {
  const planName = planLabels[subscription.plan.name] ?? subscription.plan.name;
  return (
    <Card>
      <CardBody className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-2xl text-ink-900">{planName} plan</h3>
            <Badge tone={subscription.status === "active" ? "teal" : "amber"}>
              {subscription.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {subscription.plan.interval === "yearly" ? "Billed yearly" : "Billed monthly"}
            {subscription.currentPeriodEnd && (
              <>
                {" · "}
                {subscription.cancelAtPeriodEnd ? "Ends" : "Renews"}{" "}
                {formatDate(subscription.currentPeriodEnd)}
              </>
            )}
          </p>
        </div>
        {subscription.cancelAtPeriodEnd && (
          <Badge tone="coral">Cancels at period end</Badge>
        )}
      </CardBody>
    </Card>
  );
}
