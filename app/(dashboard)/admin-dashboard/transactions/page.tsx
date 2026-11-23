import type { Metadata } from "next"
import { Clock, ReceiptText, TrendingUp, Wallet } from "lucide-react"

import { TransactionsTable } from "@/components/Admin/transactions-table"
import { ApiError } from "@/components/Dashboard/api-error"
import { PageHeader } from "@/components/Dashboard/page-header"
import { StatCard } from "@/components/Dashboard/stat-card"
import {
  getAdminBookings,
  getAdminTransactions,
} from "@/lib/Action/admin-actions"
import { summarizeTransactions } from "@/lib/admin-data"
import { formatBDT } from "@/lib/utils"

export const metadata: Metadata = { title: "Payments — HomeFix Admin" }

const Transactions = async () => {
  let paymentResult: Awaited<ReturnType<typeof getAdminTransactions>>
  let bookings: Awaited<ReturnType<typeof getAdminBookings>>
  try {
    ;[paymentResult, bookings] = await Promise.all([
      getAdminTransactions(),
      getAdminBookings(),
    ])
  } catch (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Payments"
          description="Verified customer payments collected by HomeFix."
        />
        <ApiError
          message={
            error instanceof Error ? error.message : "Unable to load payments."
          }
        />
      </div>
    )
  }
  const { transactions } = paymentResult
  const summary = summarizeTransactions(transactions, bookings)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Verified customer payments collected by HomeFix."
      />
      {!paymentResult.available && (
        <p
          role="status"
          className="rounded-2xl border border-status-requested-fg/15 bg-status-requested-bg px-4 py-3 text-sm font-medium text-status-requested-fg"
        >
          {paymentResult.message ??
            "Payment records are temporarily unavailable. Please try again later."}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Collected revenue"
          value={
            paymentResult.available
              ? formatBDT(paymentResult.statistics.totalRevenue)
              : "Unavailable"
          }
          icon={Wallet}
          tone="green"
          delay={0.05}
        />
        <StatCard
          label="Verified payments"
          value={
            paymentResult.available
              ? paymentResult.statistics.totalPayments
              : "Unavailable"
          }
          icon={ReceiptText}
          delay={0.1}
        />
        <StatCard
          label="Average payment"
          value={
            paymentResult.available && paymentResult.statistics.totalPayments
              ? formatBDT(
                  paymentResult.statistics.totalRevenue /
                    paymentResult.statistics.totalPayments
                )
              : paymentResult.available
                ? formatBDT(0)
                : "Unavailable"
          }
          icon={TrendingUp}
          tone="blue"
          delay={0.15}
        />
        <StatCard
          label="Awaiting payment"
          value={
            paymentResult.available
              ? formatBDT(summary.awaitingAmount)
              : "Unavailable"
          }
          hint={
            paymentResult.available
              ? `${summary.awaitingJobs} completed ${summary.awaitingJobs === 1 ? "job" : "jobs"}`
              : paymentResult.message
          }
          icon={Clock}
          tone="amber"
          delay={0.2}
        />
      </div>

      <TransactionsTable transactions={transactions} />
    </div>
  )
}

export default Transactions
