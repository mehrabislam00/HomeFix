import Image from "next/image"
import { format, parseISO } from "date-fns"
import { ClipboardCheck } from "lucide-react"

import { EmptyState } from "@/components/Dashboard/empty-state"
import { ServiceApprovalBadge } from "@/components/Dashboard/status-badge"
import type { AdminService } from "@/lib/admin-data"
import { OverviewPanel } from "./overview-panel"

export function RecentSubmissions({ services }: { services: AdminService[] }) {
  const recent = [...services]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 4)

  return (
    <OverviewPanel
      title="Recent service submissions"
      description="Latest listings from technicians."
      href="/admin-dashboard/approvals"
      linkLabel="Review"
      delay={0.14}
    >
      {recent.length ? (
        <ul className="flex flex-col gap-1.5">
          {recent.map((service) => (
            <li
              key={service.id}
              className="flex items-center gap-3 rounded-3xl border border-transparent p-2 transition-colors duration-200 hover:border-white/80 hover:bg-white/60"
            >
              <div className="relative size-12 shrink-0 overflow-hidden rounded-2xl ring-1 ring-forest/10">
                <Image
                  src={service.image}
                  alt=""
                  fill
                  sizes="48px"
                  unoptimized={typeof service.image === "string"}
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-[family-name:var(--font-manrope)] text-sm font-bold text-forest">
                  {service.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-soft">
                  {service.submittedAt
                    ? format(parseISO(service.submittedAt), "MMM d, yyyy")
                    : "Date unavailable"}
                </p>
              </div>
              <ServiceApprovalBadge
                status={service.approval}
                className="shrink-0"
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={ClipboardCheck}
          title="No submissions yet"
          description="New technician services will appear here."
        />
      )}
    </OverviewPanel>
  )
}
