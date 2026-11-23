import { format, parseISO } from "date-fns"
import { Landmark, ReceiptText } from "lucide-react"
import Link from "next/link"

import { BlurFade } from "@/components/magic/blur-fade"
import type { Earning, EarningsSummary } from "@/lib/technician-data"
import { cn, formatBDT } from "@/lib/utils"
import { btn } from "@/lib/button-styles"

export function EarningsSummaryCard({
  summary,
  recent,
}: {
  summary: EarningsSummary
  recent: Earning[]
}) {
  const figures = [
    {
      label: "Customer payments to HomeFix",
      value: summary.customerPaymentsToHomeFix,
    },
    {
      label: "Completed bookings unpaid",
      value: summary.unpaidCompletedAmount,
    },
  ]
  return (
    <BlurFade fade={false} delay={0.14} y={16}>
      <section className="glass-card relative rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-forest ring-1 ring-forest/10">
            <Landmark aria-hidden strokeWidth={1.75} className="size-[18px]" />
          </span>
          <div>
            <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
              Customer payment activity
            </h2>
            <p className="text-sm text-ink-soft">
              {summary.paidBookings} verified{" "}
              {summary.paidBookings === 1 ? "payment" : "payments"}
            </p>
          </div>
        </div>

        <dl className="mt-5 flex flex-col gap-3 border-t border-forest/10 pt-5 text-sm">
          {figures.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3"
            >
              <dt className="text-ink-soft">{label}</dt>
              <dd className="font-[family-name:var(--font-manrope)] text-base font-extrabold text-forest tabular-nums">
                {formatBDT(value)}
              </dd>
            </div>
          ))}
        </dl>

        {recent.length > 0 && (
          <div className="mt-5 border-t border-forest/10 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-forest">
              Recent verified payments
            </h3>
            <ul className="flex flex-col gap-1">
              {recent.slice(0, 3).map((e) => (
                <li
                  key={e.id}
                  className="group/row -mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-white/60"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-forest ring-1 ring-forest/10">
                    <ReceiptText
                      aria-hidden
                      strokeWidth={1.75}
                      className="size-4 transition-transform duration-300 group-hover/row:-rotate-6 motion-reduce:transition-none"
                    />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-semibold text-forest">
                      {e.serviceTitle}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-soft">
                      {e.customerName} · {format(parseISO(e.paidAt), "MMM d")}
                    </p>
                  </div>
                  <strong className="text-sm font-extrabold text-status-success-fg tabular-nums">
                    {formatBDT(e.amount)}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          href="/technician-dashboard/payments"
          className={cn(btn.md, btn.secondary, "mt-4 w-full")}
        >
          View payment history
        </Link>
      </section>
    </BlurFade>
  )
}
