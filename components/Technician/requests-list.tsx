"use client"

import { useState } from "react"
import { ListChecks } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { AuthError } from "@/components/auth/auth-submit"
import { EmptyState } from "@/components/Dashboard/empty-state"

import {
  REQUEST_TABS,
  type JobAction,
  type JobActionResult,
  type JobRequest,
} from "@/lib/technician-data"
import { JobRow } from "./job-row"
import { SegmentedFilter } from "../Dashboard/segmented-filter"

const emptyCopy: Record<string, { title: string; description: string }> = {
  new: {
    title: "No pending requests",
    description: "New booking requests from customers will appear here.",
  },
  accepted: {
    title: "No accepted jobs",
    description: "Jobs you accept will wait here until you start them.",
  },
  in_progress: {
    title: "Nothing in progress",
    description: "Jobs you've started will show up here.",
  },
  completed: {
    title: "No completed jobs yet",
    description: "Finished jobs and their final amounts appear here.",
  },
  closed: {
    title: "No closed requests",
    description: "Rejected and cancelled requests are kept here.",
  },
}

/**
 * Tabbed job list. `onAction` is the seam for the real booking API: pass a
 * server action that returns `{ ok }`. Without it the job buttons stay disabled.
 */
export function RequestsList({
  jobs,
  onAction,
}: {
  jobs: JobRequest[]
  onAction?: (jobId: string, action: JobAction) => Promise<JobActionResult>
}) {
  const [tab, setTab] = useState<string>(REQUEST_TABS[0].key)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const byTab = (key: string) => {
    const statuses: readonly string[] =
      REQUEST_TABS.find((t) => t.key === key)?.statuses ?? []
    return jobs.filter((j) => statuses.includes(j.status))
  }
  const visible = byTab(tab)

  async function handleAction(job: JobRequest, action: JobAction) {
    if (!onAction) return
    setBusyId(job.id)
    setError("")
    try {
      const result = await onAction(job.id, action)
      if (!result.ok) setError(result.error)
    } catch {
      setError("Unable to update this job. Please try again.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <SegmentedFilter
        label="Filter requests"
        value={tab}
        onChange={(key) => {
          setTab(key)
          setError("")
        }}
        items={REQUEST_TABS.map(({ key, label }) => ({
          key,
          label,
          count: byTab(key).length,
        }))}
      />

      <p aria-live="polite" className="sr-only">
        {visible.length} requests
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <AuthError message={error} />
        {visible.length ? (
          visible.map((job, i) => (
            <BlurFade
              key={job.id}
              fade={false}
              delay={Math.min(i, 5) * 0.05}
              y={12}
            >
              <JobRow
                job={job}
                onAction={onAction ? handleAction : undefined}
                busy={busyId === job.id}
              />
            </BlurFade>
          ))
        ) : (
          <div className="glass-card relative rounded-[1.75rem] p-4 sm:p-6">
            <EmptyState icon={ListChecks} {...emptyCopy[tab]} />
          </div>
        )}
      </div>
    </div>
  )
}