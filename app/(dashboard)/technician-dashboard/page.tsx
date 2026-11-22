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

import { SampleDataNotice } from "@/components/Dashboard/sample-data-notice"
import { QuickActions, type QuickAction } from "@/components/Dashboard/quick-actions"
import { StatCard } from "@/components/Dashboard/stat-card"
import { WelcomeBanner } from "@/components/Dashboard/welcome-banner"
import { CompletionRate } from "@/components/Technician/completion-rate"
import { EarningsSummaryCard } from "@/components/Technician/earnings-summary"
import { JobSection } from "@/components/Technician/job-section"
import { Button } from "@/components/ui/button"
import { getTechnicianProfile } from "@/lib/Action/users"
import { firstName } from "@/lib/dashboard-data"
import { btn } from "@/lib/button-styles"
import {
  completionRate,
  getEarnings,
  getJobRequests,
  getTechnicianServices,
  summarizeEarnings,
} from "@/lib/technician-data"
import { cn, formatBDT } from "@/lib/utils"

export const metadata: Metadata = { title: "Overview — HomeFix Technician" }

const quickActions: QuickAction[] = [
  { label: "Add a new service", href: "/technician-dashboard/add-service", icon: CirclePlus },
  { label: "Manage my services", href: "/technician-dashboard/my-services", icon: Wrench },
  { label: "Respond to requests", href: "/technician-dashboard/requests", icon: ListChecks },
  { label: "Update profile", href: "/technician-dashboard/profile", icon: User },
]

const Overview = async () => {
  const [profile, services, jobs, earnings] = await Promise.all([
    getTechnicianProfile(),
    getTechnicianServices(),
    getJobRequests(),
    getEarnings(),
  ])
  const name = profile.ok ? firstName(profile.customer.name) : "there"

  const count = (status: string) => jobs.filter((j) => j.status === status).length
  const pending = count("requested")
  const summary = summarizeEarnings(jobs)
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

      <SampleDataNotice>
        Jobs, services and earnings below are sample data until the technician
        APIs are connected. Your profile is live.
      </SampleDataNotice>

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
          label="Paid earnings"
          value={formatBDT(summary.paid)}
          hint={`${summary.paidJobs} paid ${summary.paidJobs === 1 ? "job" : "jobs"}`}
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