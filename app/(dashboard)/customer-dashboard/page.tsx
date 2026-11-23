import type { Metadata } from "next"
import { format } from "date-fns"
import { CalendarCheck, CircleCheck, Clock, Wallet } from "lucide-react"

import { ACTIVE_STATUSES, firstName } from "@/lib/dashboard-data"
import { getCustomerProfile } from "@/lib/Action/customer-actions"
import { getCustomerBookings } from "@/lib/Action/booking-actions"
import type { Booking } from "@/lib/dashboard-data"
import { WelcomeBanner } from "@/components/Dashboard/welcome-banner"
import { StatCard } from "@/components/Dashboard/stat-card"
import { RecentBookings } from "@/components/Dashboard/recent-bookings"
import { QuickActions } from "@/components/Dashboard/quick-actions"
import { ApiError } from "@/components/Dashboard/api-error"
import { redirect } from "next/navigation"

export const metadata: Metadata = { title: "Dashboard — HomeFix" }

const Dashboard = async () => {
  const profile = await getCustomerProfile()
  if (!profile.ok && profile.unauthorized) {
    redirect(profile.redirectTo ?? "/login")
  }
  if (!profile.ok) {
    return (
      <p
        role="alert"
        className="rounded-2xl border border-status-rejected-fg/20 bg-status-rejected-bg p-5 text-sm font-medium text-status-rejected-fg"
      >
        {profile.error}
      </p>
    )
  }
  let bookings: Booking[]
  try {
    bookings = await getCustomerBookings()
  } catch (error) {
    console.error("Unable to load customer dashboard bookings.", error)
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
  const customer = profile.customer

  const active = bookings.filter((b) =>
    ACTIVE_STATUSES.includes(b.status)
  ).length
  const completed = bookings.filter((b) => b.status === "completed").length
  const pendingPayments = bookings.filter(
    (b) => b.status === "completed" && b.paymentStatus === "unpaid"
  ).length
  const recent = [...bookings].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner
        firstName={firstName(customer.name)}
        dateLabel={format(new Date(), "EEEE, MMMM d")}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total bookings"
          value={bookings.length}
          icon={CalendarCheck}
          delay={0.05}
        />
        <StatCard
          label="Active bookings"
          value={active}
          icon={Clock}
          tone="blue"
          delay={0.1}
        />
        <StatCard
          label="Completed"
          value={completed}
          icon={CircleCheck}
          tone="green"
          delay={0.15}
        />
        <StatCard
          label="Pending payments"
          value={pendingPayments}
          hint={pendingPayments ? "Payment due" : "All settled"}
          icon={Wallet}
          tone="amber"
          delay={0.2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <RecentBookings bookings={recent} />
        <QuickActions />
      </div>
    </div>
  )
}

export default Dashboard
