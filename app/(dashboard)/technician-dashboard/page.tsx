import type { Metadata } from "next"
import Link from "next/link"
import { format } from "date-fns"
import {
  CalendarCheck,
  CircleCheck,
  CirclePlus,
  Hammer,
  ListChecks,
  User,
  Wallet,
  Wrench,
} from "lucide-react"

import {
  QuickActions,
  type QuickAction,
} from "@/components/Dashboard/quick-actions"
import { ApiError } from "@/components/Dashboard/api-error"
import { StatCard } from "@/components/Dashboard/stat-card"
import { WelcomeBanner } from "@/components/Dashboard/welcome-banner"

import { Button } from "@/components/ui/button"
import { getTechnicianProfile } from "@/lib/Action/technician-actions"
import { firstName } from "@/lib/dashboard-data"
import { btn } from "@/lib/button-styles"
import {
  completionRate,
  summarizeEarnings,
} from "@/lib/technician-data"
import { getTechnicianServices } from "@/lib/Action/service-actions"
import { getTechnicianBookings } from "@/lib/Action/booking-actions"
import { getTechnicianPayments } from "@/lib/Action/payment-actions"
import { cn, formatBDT } from "@/lib/utils"
import { JobSection } from "@/components/Technician/job-section"
import { EarningsSummaryCard } from "@/components/Technician/earnings-summary"
import { CompletionRate } from "@/components/Technician/completion-rate"
import type { JobRequest, TechnicianService } from "@/lib/technician-data"

export const metadata: Metadata = { title: "Overview — HomeFix Technician" }

const quickActions: QuickAction[] = [
  {
    label: "Add a new service",
    href: "/technician-dashboard/add-service",
    icon: CirclePlus,
  },
  {
    label: "Manage my services",
    href: "/technician-dashboard/my-services",
    icon: Wrench,
  },
  {
    label: "Respond to requests",
    href: "/technician-dashboard/requests",
    icon: ListChecks,
  },
  {
    label: "Update profile",
    href: "/technician-dashboard/profile",
    icon: User,
  },
]

const Overview = async () => {
  const [profileResult, servicesResult, jobsResult, paymentResult] =
    await Promise.allSettled([
      getTechnicianProfile(),
      getTechnicianServices(),
      getTechnicianBookings(),
      getTechnicianPayments(),
    ])

  if (
    profileResult.status === "rejected" &&
    servicesResult.status === "rejected" &&
    jobsResult.status === "rejected" &&
    paymentResult.status === "rejected"
  ) {
    const error = [
      profileResult.reason,
      servicesResult.reason,
      jobsResult.reason,
      paymentResult.reason,
    ].find((reason) => reason instanceof Error)
    console.error("Unable to load technician dashboard data.", error)
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

  const profile =
    profileResult.status === "fulfilled" ? profileResult.value : null
  const services: TechnicianService[] =
    servicesResult.status === "fulfilled" ? servicesResult.value : []
  const jobs: JobRequest[] =
    jobsResult.status === "fulfilled" ? jobsResult.value : []
  const paymentData =
    paymentResult.status === "fulfilled"
      ? paymentResult.value
      : {
          payments: [],
          statistics: {
            totalPayments: 0,
            totalRevenue: 0,
            currency: "BDT",
            byStatus: {},
          },
        }
  const earnings = paymentData.payments.map((payment) => ({
    id: payment.id,
    jobId: payment.bookingId,
    serviceTitle: payment.serviceTitle,
    customerName: payment.customerName ?? "Customer",
    amount: payment.amount,
    paidAt: payment.paidAt,
  }))
  const name =
    profile?.ok ? firstName(profile.customer.name) : "there"

  const count = (status: string) =>
    jobs.filter((j) => j.status === status).length
  const pending = count("requested")
  const summary = {
    ...summarizeEarnings(jobs),
    customerPaymentsToHomeFix: paymentData.statistics.totalRevenue,
    paidBookings: paymentData.statistics.totalPayments,
  }
  const approved = services.filter((s) => s.approval === "approved").length
  const upcoming = jobs
    .filter((j) => j.status === "accepted")
    .sort((a, b) => a.date.localeCompare(b.date))
  const recent = jobs
    .filter((j) => j.status === "requested")
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner
        firstName={name}
        dateLabel={format(new Date(), "EEEE, MMMM d")}
        subtitle={
          pending
            ? `You have ${pending} new ${pending === 1 ? "request" : "requests"} waiting for a reply.`
            : "No new requests right now — great job staying on top."
        }
        action={
          <Button
            className={cn(
              btn.lg,
              "shine relative shrink-0 self-start overflow-hidden bg-ivory text-forest hover:bg-white sm:self-auto"
            )}
            asChild
          >
            <Link href="/technician-dashboard/add-service">
              <CirclePlus aria-hidden className="size-4" />
              Add service
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total services"
          value={services.length}
          hint={`${approved} approved`}
          icon={Wrench}
          delay={0.05}
        />
        <StatCard
          label="Pending requests"
          value={pending}
          hint={pending ? "Awaiting your reply" : "All caught up"}
          icon={ListChecks}
          tone="blue"
          delay={0.1}
        />
        <StatCard
          label="Accepted bookings"
          value={count("accepted")}
          icon={CalendarCheck}
          delay={0.15}
        />
        <StatCard
          label="In-progress jobs"
          value={count("in_progress")}
          icon={Hammer}
          tone="amber"
          delay={0.2}
        />
        <StatCard
          label="Completed jobs"
          value={count("completed")}
          icon={CircleCheck}
          tone="green"
          delay={0.25}
        />
        <StatCard
          label="Customer payments to HomeFix"
          value={formatBDT(summary.customerPaymentsToHomeFix)}
          hint={`${summary.paidBookings} verified ${summary.paidBookings === 1 ? "payment" : "payments"}`}
          icon={Wallet}
          tone="green"
          delay={0.3}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <JobSection
            title="Recent booking requests"
            description="Customers waiting for your reply."
            href="/technician-dashboard/requests"
            linkLabel="Manage"
            jobs={recent}
            emptyTitle="No requests yet"
            emptyDescription="Requests from customers will appear here."
          />
          <JobSection
            title="Upcoming jobs"
            description="Accepted jobs on your schedule."
            href="/technician-dashboard/requests"
            delay={0.14}
            jobs={upcoming}
            emptyIcon={CalendarCheck}
            emptyTitle="Nothing scheduled"
            emptyDescription="Accepted jobs will be listed here by date."
          />
        </div>
        <div className="flex flex-col gap-6">
          <EarningsSummaryCard summary={summary} recent={earnings} />
          <CompletionRate percent={completionRate(jobs)} />
          <QuickActions
            actions={quickActions}
            description="Jump to what you need."
          />
        </div>
      </div>
    </div>
  )
}

export default Overview
