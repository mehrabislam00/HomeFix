import type { Metadata } from "next"
import { Clock, ReceiptText, Wallet } from "lucide-react"

import { getCustomerBookings } from "@/lib/Action/booking-actions"
import { getCustomerPayments } from "@/lib/Action/payment-actions"
import { formatBDT } from "@/lib/utils"
import { PageHeader } from "@/components/Dashboard/page-header"
import { StatCard } from "@/components/Dashboard/stat-card"
import { PaymentsList } from "@/components/Dashboard/payments-list"
import { ApiError } from "@/components/Dashboard/api-error"
import type { Booking } from "@/lib/dashboard-data"

export const metadata: Metadata = { title: "Payment History — HomeFix" }

const Payments = async () => {
  let payments: Awaited<ReturnType<typeof getCustomerPayments>>
  let bookings: Booking[]
  try {
    ;[payments, bookings] = await Promise.all([
      getCustomerPayments(),
      getCustomerBookings(),
    ])
  } catch (error) {
    console.error("Unable to load customer payment data.", error)
    return (
      <ApiError
        message={
          error instanceof Error
            ? error.message
            : "Please try again in a moment."
        }
      />
    )
  }
  const awaiting = bookings.filter(
    (booking) =>
      ["accepted", "in_progress", "completed"].includes(booking.status) &&
      booking.paymentStatus === "unpaid"
  ).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment History"
        description="All payments you've made on HomeFix."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total paid"
          value={formatBDT(payments.statistics.totalRevenue)}
          icon={Wallet}
          tone="green"
          delay={0.05}
        />
        <StatCard
          label="Payments"
          value={payments.statistics.totalPayments}
          icon={ReceiptText}
          delay={0.1}
        />
        <StatCard
          label="Awaiting payment"
          value={awaiting}
          hint={awaiting ? "Payment due" : "Nothing due"}
          icon={Clock}
          tone="amber"
          delay={0.15}
        />
      </div>

      <PaymentsList payments={payments.payments} />
    </div>
  )
}

export default Payments
