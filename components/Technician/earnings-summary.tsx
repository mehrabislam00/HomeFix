import { format, parseISO } from "date-fns"
import { Landmark, ReceiptText } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import type { Earning, EarningsSummary } from "@/lib/technician-data"
import { formatBDT } from "@/lib/utils"

/** Earnings snapshot: paid / pending / available, plus the latest payouts. */
export function EarningsSummaryCard({
  summary,
  recent,
}: {
  summary: EarningsSummary
  recent: Earning[]
}) {
  const figures = [
    { label: "Paid earnings", value: summary.paid },
    { label: "Pending payment", value: summary.pending },
    { label: "Available balance", value: summary.available },
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
              Earnings
            </h2>
            <p className="text-sm text-ink-soft">
              {summary.paidJobs} paid {summary.paidJobs === 1 ? "job" : "jobs"}
            </p>
          </div>
        </div>

        <dl className="mt-5 flex flex-col gap-3 border-t border-forest/10 pt-5 text-sm">
          {figures.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <dt className="text-ink-soft">{label}</dt>
              <dd className="font-[family-name:var(--font-manrope)] text-base font-extrabold text-forest tabular-nums">
                {formatBDT(value)}
              </dd>
            </div>
          ))}
        </dl>

        {recent.length > 0 && (
          <ul className="mt-5 flex flex-col gap-1 border-t border-forest/10 pt-4">
            {recent.slice(0, 3).map((e) => (
              <li
                key={e.id}
                className="group/row -mx-2 flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-white/60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-forest ring-1 ring-forest/10">
                  <ReceiptText aria-hidden strokeWidth={1.75} className="size-4 transition-transform duration-300 group-hover/row:-rotate-6 motion-reduce:transition-none" />
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
                  +{formatBDT(e.amount)}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </BlurFade>
  )
}