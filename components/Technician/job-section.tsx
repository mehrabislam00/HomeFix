import Link from "next/link"
import { ArrowRight, ListChecks, type LucideIcon } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { EmptyState } from "@/components/Dashboard/empty-state"
import type { JobRequest } from "@/lib/technician-data"
import { JobRow } from "./job-row"

/** Glass card with a compact list of jobs (recent requests, upcoming jobs…). */
export function JobSection({
  title,
  description,
  href,
  linkLabel = "View all",
  jobs,
  emptyTitle,
  emptyDescription,
  emptyIcon = ListChecks,
  delay = 0.1,
}: {
  title: string
  description: string
  href: string
  linkLabel?: string
  jobs: JobRequest[]
  emptyTitle: string
  emptyDescription: string
  emptyIcon?: LucideIcon
  delay?: number
}) {
  return (
    <BlurFade fade={false} delay={delay} y={16}>
      <section className="glass-card relative rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
              {title}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{description}</p>
          </div>
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-sage-deep transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            {linkLabel}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>
        <div className="mt-5 flex flex-col gap-1.5">
          {jobs.length ? (
            jobs.slice(0, 4).map((job) => (
              <JobRow key={job.id} job={job} compact />
            ))
          ) : (
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
            />
          )}
        </div>
      </section>
    </BlurFade>
  )
}