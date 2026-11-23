import { RetryButton } from "./retry-button"

export function ApiError({
  message,
  title = "Unable to load live data",
}: {
  message: string
  title?: string
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-status-rejected-fg/20 bg-status-rejected-bg p-5 text-sm text-status-rejected-fg"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1">{message}</p>
      <RetryButton />
    </div>
  )
}
