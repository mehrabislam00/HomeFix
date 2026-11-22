import type { BookingStatus, PaymentStatus } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

const tones = {
  blue: "bg-status-requested-bg text-status-requested-fg",
  indigo: "bg-status-accepted-bg text-status-accepted-fg",
  amber: "bg-status-amber-bg text-status-amber-fg",
  green: "bg-status-success-bg text-status-success-fg",
  red: "bg-status-rejected-bg text-status-rejected-fg",
  gray: "bg-status-cancelled-bg text-status-cancelled-fg",
} as const

const bookingMap: Record<
  BookingStatus,
  { label: string; tone: keyof typeof tones }
> = {
  requested: { label: "Requested", tone: "blue" },
  accepted: { label: "Accepted", tone: "indigo" },
  in_progress: { label: "In progress", tone: "amber" },
  completed: { label: "Completed", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
  cancelled: { label: "Cancelled", tone: "gray" },
}

const paymentMap: Record<
  PaymentStatus,
  { label: string; tone: keyof typeof tones }
> = {
  unpaid: { label: "Unpaid", tone: "amber" },
  paid: { label: "Paid", tone: "green" },
}

function Pill({
  label,
  tone,
  className,
}: {
  label: string
  tone: keyof typeof tones
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs leading-none font-semibold whitespace-nowrap",
        tones[tone],
        className
      )}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full bg-current opacity-80"
      />
      {label}
    </span>
  )
}

export const BookingStatusBadge = ({
  status,
  className,
}: {
  status: BookingStatus
  className?: string
}) => <Pill {...bookingMap[status]} className={className} />

export const PaymentStatusBadge = ({
  status,
  className,
}: {
  status: PaymentStatus
  className?: string
}) => <Pill {...paymentMap[status]} className={className} />