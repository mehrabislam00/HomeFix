"use client"

import { useState } from "react"
import Image from "next/image"
import { format, parseISO } from "date-fns"
import { Check, CircleCheck, ClipboardCheck, Clock, Loader2, X } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { EmptyState } from "@/components/Dashboard/empty-state"
import { SegmentedFilter } from "@/components/Dashboard/segmented-filter"
import { ServiceApprovalBadge } from "@/components/Dashboard/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type {
  AdminService,
  ServiceDecision,
  ServiceDecisionResult,
} from "@/lib/admin-data"
import { btn } from "@/lib/button-styles"
import { initialsOf } from "@/lib/dashboard-data"
import { cn, formatBDT } from "@/lib/utils"

const tabs = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const

/**
 * Review queue. `onDecision` is the seam for the real approval API: pass a server
 * action returning { ok }. Without it, decisions only update this page's state.
 */
export function ApprovalsList({
  services,
  onDecision,
}: {
  services: AdminService[]
  onDecision?: (id: string, decision: ServiceDecision) => Promise<ServiceDecisionResult>
}) {
  const [items, setItems] = useState(services)
  const [tab, setTab] = useState<string>("pending")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const count = (key: string) =>
    key === "all" ? items.length : items.filter((s) => s.approval === key).length
  const visible = items.filter((s) => tab === "all" || s.approval === tab)

  async function decide(service: AdminService, decision: ServiceDecision) {
    setBusyId(service.id)
    setError("")
    setNotice("")
    try {
      const result = onDecision
        ? await onDecision(service.id, decision)
        : ({ ok: true } as const)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setItems((current) =>
        current.map((s) => (s.id === service.id ? { ...s, approval: decision } : s))
      )
      setNotice(`"${service.title}" was ${decision}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save that decision.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <SegmentedFilter
        label="Filter services"
        items={tabs.map(({ key, label }) => ({ key, label, count: count(key) }))}
        value={tab}
        onChange={setTab}
      />

      <div aria-live="polite" className="mt-4 empty:hidden">
        {error && (
          <p role="alert" className="rounded-2xl border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-sm font-medium text-status-rejected-fg">
            {error}
          </p>
        )}
        {notice && !error && (
          <p role="status" className="inline-flex items-center gap-2 rounded-full bg-status-success-bg px-3 py-1.5 text-sm font-medium text-status-success-fg">
            <CircleCheck aria-hidden className="size-4" />
            {notice}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {visible.length ? (
          visible.map((service, i) => {
            const busy = busyId === service.id
            return (
              <BlurFade key={service.id} fade={false} delay={Math.min(i, 5) * 0.05} y={12}>
                <article className="glass-card group relative flex flex-col overflow-hidden rounded-[1.75rem] sm:flex-row">
                  <div className="relative h-44 shrink-0 sm:h-auto sm:w-52">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 208px, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-xs font-semibold text-sage-deep">{service.category}</span>
                      <ServiceApprovalBadge status={service.approval} />
                    </div>
                    <div>
                      <h3 className="font-[family-name:var(--font-manrope)] text-lg font-bold tracking-tight text-forest">
                        {service.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{service.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-soft">
                      <span className="flex items-center gap-2">
                        <Avatar size="sm" className="size-7">
                          <AvatarFallback className="bg-sage text-[10px] font-semibold text-white">
                            {initialsOf(service.technician)}
                          </AvatarFallback>
                        </Avatar>
                        <strong className="font-semibold text-ink">{service.technician}</strong>
                      </span>
                      <span>
                        <strong className="font-semibold text-ink">{formatBDT(service.price)}</strong> /visit
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock aria-hidden className="size-3.5" />
                        Submitted {format(parseISO(service.submittedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    {service.approval === "pending" && (
                      <div className="mt-auto flex flex-wrap gap-2 border-t border-forest/10 pt-4">
                        <Button
                          type="button"
                          disabled={busy}
                          onClick={() => decide(service, "rejected")}
                          className={cn(btn.md, btn.outline, "bg-white/70 text-status-rejected-fg hover:bg-status-rejected-bg")}
                        >
                          <X aria-hidden className="size-4" />
                          Reject
                        </Button>
                        <Button
                          type="button"
                          disabled={busy}
                          onClick={() => decide(service, "approved")}
                          className={cn(btn.md, btn.primary)}
                        >
                          {busy ? (
                            <Loader2 aria-hidden className="size-4 animate-spin" />
                          ) : (
                            <Check aria-hidden className="size-4" />
                          )}
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              </BlurFade>
            )
          })
        ) : (
          <div className="glass-card relative rounded-[1.75rem] p-4 sm:p-6">
            <EmptyState
              icon={ClipboardCheck}
              title={tab === "pending" ? "Nothing to review" : "No services here"}
              description={
                tab === "pending"
                  ? "New technician submissions will appear here for approval."
                  : "Nothing matches this filter yet."
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}