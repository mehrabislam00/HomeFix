import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import {
  CalendarCheck,
  ClipboardCheck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react"

import { RecentAdminBookings } from "@/components/Admin/recent-admin-bookings"
import { RecentSubmissions } from "@/components/Admin/recent-submissions"
import { RecentUsers } from "@/components/Admin/recent-users"
import { StatusChart } from "@/components/Admin/status-chart"
import { ApiError } from "@/components/Dashboard/api-error"
import { StatCard } from "@/components/Dashboard/stat-card"
import { WelcomeBanner } from "@/components/Dashboard/welcome-banner"
import { Button } from "@/components/ui/button"
import { countByStatus } from "@/lib/admin-data"
import type { AdminDashboardStats, AdminReport } from "@/lib/admin-data"
import {
  getAdminBookings,
  getAdminDashboardStats,
  getAdminProfile,
  getAdminReports,
  getAdminServices,
  getAdminUsers,
} from "@/lib/Action/admin-actions"
import { btn } from "@/lib/button-styles"
import { firstName } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Overview — HomeFix Admin" }

const Overview = async () => {
  const [
    profileResult,
    usersResult,
    servicesResult,
    bookingsResult,
    statsResult,
    reportsResult,
  ] = await Promise.allSettled([
    getAdminProfile(),
    getAdminUsers(),
    getAdminServices(),
    getAdminBookings(),
    getAdminDashboardStats(),
    getAdminReports(),
  ])
  const profile =
    profileResult.status === "fulfilled" ? profileResult.value : null
  const usersData =
    usersResult.status === "fulfilled" ? usersResult.value : null
  const services =
    servicesResult.status === "fulfilled" ? servicesResult.value : null
  const bookings =
    bookingsResult.status === "fulfilled" ? bookingsResult.value : null
  const stats: AdminDashboardStats | null =
    statsResult.status === "fulfilled" ? statsResult.value : null
  const reports: AdminReport | null =
    reportsResult.status === "fulfilled" ? reportsResult.value : null
  const users = usersData?.users ?? []
  const name = profile?.ok ? firstName(profile.customer.name) : "there"
  const pending = stats?.services.pending ?? 0
  const usersUnavailable = !usersData?.live
  const usersError =
    usersData?.error ??
    (usersResult.status === "rejected" && usersResult.reason instanceof Error
      ? usersResult.reason.message
      : "The user list could not be loaded.")

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

      {usersUnavailable && (
        <ApiError title="Unable to load users" message={usersError} />
      )}

      {stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total users"
            value={stats.users.total}
            hint={`${stats.users.customers} customers · ${stats.users.technicians} technicians`}
            icon={Users}
            delay={0.05}
          />
          <StatCard
            label="Total services"
            value={stats.services.total}
            hint={`${pending} pending approval`}
            icon={Wrench}
            tone="amber"
            delay={0.1}
          />
          <StatCard
            label="Total bookings"
            value={stats.bookings.total}
            hint={`${stats.bookings.completed} completed`}
            icon={CalendarCheck}
            tone="blue"
            delay={0.15}
          />
          <StatCard
            label="Revenue"
            value={stats.payments.available ? "—" : "Unavailable"}
            hint={
              stats.payments.message ??
              "Payment reporting is not available yet."
            }
            icon={Wallet}
            tone="green"
            delay={0.2}
          />
        </div>
      ) : (
        <ApiError
          title="Unable to load dashboard statistics"
          message={
            statsResult.status === "rejected" &&
            statsResult.reason instanceof Error
              ? statsResult.reason.message
              : "The dashboard statistics could not be loaded."
          }
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {reports ? (
          <StatusChart data={countByStatus(reports.bookingStatuses)} />
        ) : (
          <ApiError
            title="Unable to load booking reports"
            message={
              reportsResult.status === "rejected" &&
              reportsResult.reason instanceof Error
                ? reportsResult.reason.message
                : "Booking reports could not be loaded."
            }
          />
        )}
        {services ? (
          <RecentSubmissions services={services} />
        ) : (
          <ApiError
            title="Unable to load services"
            message={
              servicesResult.status === "rejected" &&
              servicesResult.reason instanceof Error
                ? servicesResult.reason.message
                : "Services could not be loaded."
            }
          />
        )}
        <RecentUsers users={users} />
        {bookings ? (
          <RecentAdminBookings bookings={bookings} />
        ) : (
          <ApiError
            title="Unable to load bookings"
            message={
              bookingsResult.status === "rejected" &&
              bookingsResult.reason instanceof Error
                ? bookingsResult.reason.message
                : "Bookings could not be loaded."
            }
          />
        )}
        <section className="glass-card rounded-[1.75rem] p-5 sm:p-7">
          <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
            Most booked services
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Service demand based on completed booking records.
          </p>
          {reports?.mostBookedServices.length ? (
            <ol className="mt-5 flex flex-col gap-3">
              {reports.mostBookedServices.slice(0, 5).map((service) => (
                <li
                  key={service._id}
                  className="flex items-center justify-between gap-4 border-b border-forest/10 pb-3 last:border-0"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-forest">
                      {service.serviceTitle}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {service.category}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-forest">
                    {service.bookingCount} bookings
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-5 text-sm text-ink-soft">
              No booking reports are available yet.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

export default Overview
