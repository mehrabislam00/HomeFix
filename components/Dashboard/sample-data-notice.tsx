import { Info } from "lucide-react"

/** Shown on screens that still render sample data instead of live API data. */
export function SampleDataNotice({
  children = "You're viewing sample data. Actions on this page connect once the backend is ready.",
}: {
  children?: React.ReactNode
}) {
  return (
    <p
      role="note"
      className="flex items-start gap-2.5 rounded-2xl border border-status-requested-fg/15 bg-status-requested-bg px-4 py-3 text-sm font-medium text-status-requested-fg"
    >
      <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}