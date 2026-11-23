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
  const [paymentResult, bookingsResult] = await Promise.allSettled([
    getAdminTransactions(),
    getAdminBookings(),
  ])
  const paymentData =
    paymentResult.status === "fulfilled" ? paymentResult.value : null
  const bookings =
    bookingsResult.status === "fulfilled" ? bookingsResult.value : []
  const transactions = paymentData?.transactions ?? []
  const summary = summarizeTransactions(transactions, bookings)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Payments"
        description="Verified customer payments collected by HomeFix."
      />
      {paymentResult.status === "rejected" && (
        <ApiError
          title="Unable to load payments"
          message={
            paymentResult.reason instanceof Error
              ? paymentResult.reason.message
              : "Unable to load payment records."
          }
        />
      )}
      {bookingsResult.status === "rejected" && (
        <ApiError
          title="Unable to load booking summaries"
          message={
            bookingsResult.reason instanceof Error
              ? bookingsResult.reason.message
              : "Unable to load bookings for payment summaries."
          }
        />
      )}
      {paymentData && !paymentData.available && (
        <p
          role="status"
          className="rounded-2xl border border-status-requested-fg/15 bg-status-requested-bg px-4 py-3 text-sm font-medium text-status-requested-fg"
        >
          {paymentData.message ??
            "Payment records are temporarily unavailable. Please try again later."}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Collected revenue"
          value={
            paymentData?.available
              ? formatBDT(paymentData.statistics.totalRevenue)
              : "Unavailable"
          }
          icon={Wallet}
          tone="green"
          delay={0.05}
        />
        <StatCard
          label="Verified payments"
          value={
            paymentData?.available
              ? paymentData.statistics.totalPayments
              : "Unavailable"
          }
          icon={ReceiptText}
          delay={0.1}
        />
        <StatCard
          label="Average payment"
          value={
            paymentData?.available && paymentData.statistics.totalPayments
              ? formatBDT(
                  paymentData.statistics.totalRevenue /
                    paymentData.statistics.totalPayments
                )
              : paymentData?.available
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
            paymentData?.available && bookingsResult.status === "fulfilled"
              ? formatBDT(summary.awaitingAmount)
              : "Unavailable"
          }
          hint={
            paymentData?.available && bookingsResult.status === "fulfilled"
              ? `${summary.awaitingJobs} completed ${summary.awaitingJobs === 1 ? "job" : "jobs"}`
              : paymentData?.message
          }
          icon={Clock}
          tone="amber"
          delay={0.2}
        />
      </div>

      {paymentData && <TransactionsTable transactions={transactions} />}
    </div>
  )
}

export default Transactions
