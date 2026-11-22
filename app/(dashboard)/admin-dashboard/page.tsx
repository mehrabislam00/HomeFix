import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import { CalendarCheck, ClipboardCheck, Users, Wallet, Wrench } from "lucide-react"

import { RecentAdminBookings } from "@/components/Admin/recent-admin-bookings"
import { RecentSubmissions } from "@/components/Admin/recent-submissions"
import { RecentUsers } from "@/components/Admin/recent-users"
import { StatusChart } from "@/components/Admin/status-chart"
import { SampleDataNotice } from "@/components/Dashboard/sample-data-notice"
import { StatCard } from "@/components/Dashboard/stat-card"
import { WelcomeBanner } from "@/components/Dashboard/welcome-banner"
import { Button } from "@/components/ui/button"
import {
  countByStatus,
  getAdminBookings,
  getAdminServices,
  getAdminTransactions,
  summarizeTransactions,
} from "@/lib/admin-data"
import { getAdminProfile, getAdminUsers } from "@/lib/Action/admin-actions"
import { btn } from "@/lib/button-styles"
import { firstName } from "@/lib/dashboard-data"
import { cn, formatBDT } from "@/lib/utils"

export const metadata: Metadata = { title: "Overview — HomeFix Admin" }

const Overview = async () => {
  const [profile, { users }, services, bookings, transactions] =
    await Promise.all([
      getAdminProfile(),
      getAdminUsers(),
      getAdminServices(),
      getAdminBookings(),
      getAdminTransactions(),
    ])
  const name = profile.ok ? firstName(profile.customer.name) : "there"

  const customers = users.filter((u) => u.role === "customer").length
  const technicians = users.filter((u) => u.role === "technician").length
  const pending = services.filter((s) => s.approval === "pending").length
  const completed = bookings.filter((b) => b.status === "completed").length
  const { revenue, count: paidCount } = summarizeTransactions(
    transactions,
    bookings
  )

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner
        firstName={name}
        dateLabel={format(new Date(), "EEEE, MMMM d")}
        subtitle="Here's what's happening across HomeFix today."
        action={
          pending ? (
            <Button
              className={cn(
                btn.lg,
                "shine relative shrink-0 self-start overflow-hidden bg-ivory text-forest hover:bg-white sm:self-auto"
              )}
              asChild
            >
              <Link href="/admin-dashboard/approvals">
                <ClipboardCheck aria-hidden className="size-4" />
                Review {pending} {pending === 1 ? "service" : "services"}
              </Link>
            </Button>
          ) : (
            <span aria-hidden />
          )
        }
      />

      <SampleDataNotice>
        Users are live. Services, bookings and transactions below are sample
        data until those APIs are connected.
      </SampleDataNotice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.length}
          hint={`${customers} customers · ${technicians} technicians`}
          icon={Users}
          delay={0.05}
        />
        <StatCard
          label="Total services"
          value={services.length}
          hint={`${pending} pending approval`}
          icon={Wrench}
          tone="amber"
          delay={0.1}
        />
        <StatCard
          label="Total bookings"
          value={bookings.length}
          hint={`${completed} completed`}
          icon={CalendarCheck}
          tone="blue"
          delay={0.15}
        />
        <StatCard
          label="Revenue"
          value={formatBDT(revenue)}
          hint={`${paidCount} ${paidCount === 1 ? "transaction" : "transactions"}`}
          icon={Wallet}
          tone="green"
          delay={0.2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatusChart data={countByStatus(bookings)} />
        <RecentSubmissions services={services} />
        <RecentUsers users={users} />
        <RecentAdminBookings bookings={bookings} />
      </div>
    </div>
  )
}

export default Overview