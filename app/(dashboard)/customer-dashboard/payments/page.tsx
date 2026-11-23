import type { Metadata } from "next"
import { Clock, ReceiptText, Wallet } from "lucide-react"

import { getPayments } from "@/lib/dashboard-data"
import { getCustomerBookings } from "@/lib/Action/booking-actions"
import { formatBDT } from "@/lib/utils"
import { PageHeader } from "@/components/Dashboard/page-header"
import { StatCard } from "@/components/Dashboard/stat-card"
import { PaymentsList } from "@/components/Dashboard/payments-list"
import { ApiError } from "@/components/Dashboard/api-error"
import type { Booking } from "@/lib/dashboard-data"

export const metadata: Metadata = { title: "Payment History — HomeFix" }

const Payments = async () => {
  const payments = await getPayments()
  let bookings: Booking[]
  try {
    bookings = await getCustomerBookings()
  } catch (error) {
    console.error("Unable to load payment booking data.", error)
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
  const total = payments.reduce((sum, p) => sum + p.amount, 0)
  const awaiting = bookings.filter(
    (b) => b.status === "completed" && b.paymentStatus === "unpaid"
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
          value={formatBDT(total)}
          icon={Wallet}
          tone="green"
          delay={0.05}
        />
        <StatCard
          label="Payments"
          value={payments.length}
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

      <PaymentsList payments={payments} />
    </div>
  )
}

export default Payments
