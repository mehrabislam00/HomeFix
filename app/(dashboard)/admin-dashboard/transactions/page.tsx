import type { Metadata } from "next"
import { Clock, ReceiptText, TrendingUp, Wallet } from "lucide-react"

import { TransactionsTable } from "@/components/Admin/transactions-table"
import { PageHeader } from "@/components/Dashboard/page-header"
import { SampleDataNotice } from "@/components/Dashboard/sample-data-notice"
import { StatCard } from "@/components/Dashboard/stat-card"
import {
  getAdminBookings,
  getAdminTransactions,
  summarizeTransactions,
} from "@/lib/admin-data"
import { formatBDT } from "@/lib/utils"

export const metadata: Metadata = { title: "Transactions — HomeFix Admin" }

const Transactions = async () => {
  const [transactions, bookings] = await Promise.all([
    getAdminTransactions(),
    getAdminBookings(),
  ])
  const summary = summarizeTransactions(transactions, bookings)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Transactions"
        description="Every confirmed payment on HomeFix."
      />
      <SampleDataNotice />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total revenue" value={formatBDT(summary.revenue)} icon={Wallet} tone="green" delay={0.05} />
        <StatCard label="Transactions" value={summary.count} icon={ReceiptText} delay={0.1} />
        <StatCard label="Average payment" value={formatBDT(summary.average)} icon={TrendingUp} tone="blue" delay={0.15} />
        <StatCard
          label="Awaiting payment"
          value={formatBDT(summary.awaitingAmount)}
          hint={`${summary.awaitingJobs} completed ${summary.awaitingJobs === 1 ? "job" : "jobs"}`}
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