import { CalendarCheck } from "lucide-react"

import { EmptyState } from "@/components/Dashboard/empty-state"
import { OverviewPanel } from "./overview-panel"

export function StatusChart({
  data,
}: {
  data: { status: string; label: string; count: number }[]
}) {
  const max = Math.max(...data.map((d) => d.count), 0)
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <OverviewPanel
      title="Bookings by status"
      description={`${total} ${total === 1 ? "booking" : "bookings"} across the platform.`}
      href="/admin-dashboard/all-bookings"
      linkLabel="All bookings"
    >
      {total === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings yet"
          description="Bookings will be charted here by status."
        />
      ) : (
        <ul
          aria-label="Bookings by status"
          className="flex h-56 items-stretch gap-2 sm:gap-3"
        >
          {data.map(({ status, label, count }) => (
            <li
              key={status}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-xs font-semibold text-forest tabular-nums">
                {count}
              </span>
              <div className="flex min-h-0 w-full flex-1 items-end">
                <div
                  aria-hidden
                  style={{ height: `${max ? Math.max((count / max) * 100, 3) : 3}%` }}
                  className="w-full rounded-t-xl bg-gradient-to-b from-sage to-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] transition-[height] duration-500 motion-reduce:transition-none"
                />
              </div>
              <span className="w-full truncate text-center text-[11px] text-ink-soft">
                {label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </OverviewPanel>
  )
}