import { format, parseISO } from "date-fns"
import { CreditCard, ReceiptText } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import type { Payment } from "@/lib/dashboard-data"
import { formatBDT } from "@/lib/utils"
import { EmptyState } from "./empty-state"
import { PaymentStatusBadge } from "./status-badge"

export function PaymentsList({ payments }: { payments: Payment[] }) {
  return (
    <BlurFade fade={false} delay={0.1} y={16}>
      <section className="glass-card relative rounded-[1.75rem] p-4 sm:p-6">
        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Payments for completed jobs will appear here."
          />
        ) : (
          <ul className="flex flex-col gap-1">
            {payments.map((p) => (
              <li
                key={p.id}
                className="group/row -mx-2 flex items-center gap-4 rounded-2xl px-2 py-4 transition-colors hover:bg-white/60"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-forest ring-1 ring-forest/10 transition-transform duration-300 group-hover/row:scale-105">
                  <ReceiptText
                    aria-hidden
                    strokeWidth={1.75}
                    className="size-5"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-[family-name:var(--font-manrope)] text-base font-bold text-forest">
                    {p.serviceTitle}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">
                    {format(parseISO(p.paidAt), "MMM d, yyyy")} · {p.method}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <strong className="font-[family-name:var(--font-manrope)] text-lg font-extrabold text-forest tabular-nums">
                    {formatBDT(p.amount)}
                  </strong>
                  <PaymentStatusBadge status="paid" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlurFade>
  )
}