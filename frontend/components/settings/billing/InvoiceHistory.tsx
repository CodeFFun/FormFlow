import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/types/billing";

const tones: Record<InvoiceStatus, "teal" | "amber" | "neutral" | "coral"> = {
  paid: "teal",
  open: "amber",
  void: "neutral",
  uncollectible: "coral",
};

export function InvoiceHistory({ invoices }: { invoices: Invoice[] }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-serif text-lg text-ink-900">Invoice history</h3>
      </CardHeader>
      <CardBody className="p-0">
        {invoices.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-500">
            No invoices yet.
          </p>
        ) : (
          <div className="divide-y divide-ink-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">
                    {formatDate(inv.issuedAt)}
                  </p>
                  <p className="text-xs text-ink-500">
                    {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                  </p>
                </div>
                <Badge tone={tones[inv.status]}>{inv.status}</Badge>
                <span className="w-20 text-right text-sm font-medium text-ink-900">
                  {formatCurrency(inv.amount, inv.currency)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
