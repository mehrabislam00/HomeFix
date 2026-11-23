import type { Metadata } from "next"
import { ReceiptText, Wallet } from "lucide-react"

import { ApiError } from "@/components/Dashboard/api-error"
import { PageHeader } from "@/components/Dashboard/page-header"
import { PaymentsList } from "@/components/Dashboard/payments-list"
import { StatCard } from "@/components/Dashboard/stat-card"
import { getTechnicianPayments } from "@/lib/Action/payment-actions"
import { formatBDT } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Payment History — HomeFix Technician",
}

export default async function TechnicianPaymentsPage() {
  let result: Awaited<ReturnType<typeof getTechnicianPayments>>
  try {
    result = await getTechnicianPayments()
  } catch (error) {
    console.error("Unable to load technician payment history.", error)
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payment History"
        description="Verified customer payments for bookings on your services. These are payments to HomeFix, not technician payouts."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          label="Customer payments to HomeFix"
          value={formatBDT(result.statistics.totalRevenue)}
          icon={Wallet}
          tone="green"
          delay={0.05}
        />
        <StatCard
          label="Paid bookings"
          value={result.statistics.totalPayments}
          icon={ReceiptText}
          delay={0.1}
        />
      </div>
      <PaymentsList payments={result.payments} owner="technician" />
    </div>
  )
}
