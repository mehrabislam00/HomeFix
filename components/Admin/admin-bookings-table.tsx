"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { CalendarCheck, Eye } from "lucide-react"

import { EmptyState } from "@/components/Dashboard/empty-state"
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from "@/components/Dashboard/status-badge"
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STATUS_ORDER,
  type AdminBooking,
} from "@/lib/admin-data"
import { cn, formatBDT } from "@/lib/utils"
import { DetailRows, DetailSheet } from "./detail-sheet"
import { rowClass, tdClass, thClass, TableCard } from "./table-card"
import { FilterSelect, SearchInput } from "./table-toolbar"

const statusOptions = [
  { value: "all", label: "All statuses" },
  ...BOOKING_STATUS_ORDER.map((s) => ({ value: s, label: BOOKING_STATUS_LABEL[s] })),
]
const paymentOptions = [
  { value: "all", label: "All payments" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
]

const formatDate = (iso: string) => format(parseISO(iso), "MMM d, yyyy")

export function AdminBookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [payment, setPayment] = useState("all")
  const [selected, setSelected] = useState<AdminBooking | null>(null)

  const needle = query.trim().toLowerCase().replace(/^#/, "")
  const visible = bookings.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (payment === "all" || b.paymentStatus === payment) &&
      (!needle ||
        [b.id, b.serviceTitle, b.customer, b.technician].some((v) =>
          v.toLowerCase().includes(needle)
        ))
  )

  return (
    <>
      <TableCard
        toolbar={
          <>
            <SearchInput
              value={query}
              onChange={setQuery}
              label="Search bookings"
              placeholder="Search by customer, technician, service or ID..."
            />
            <FilterSelect value={status} onChange={setStatus} options={statusOptions} label="Filter by status" />
            <FilterSelect value={payment} onChange={setPayment} options={paymentOptions} label="Filter by payment" />
          </>
        }
      >
        <p aria-live="polite" className="sr-only">
          {visible.length} bookings
        </p>
        {visible.length ? (
          <table className="w-full min-w-[960px] border-collapse">
            <thead className="bg-pale-sage/60">
              <tr>
                <th scope="col" className={thClass}>Booking</th>
                <th scope="col" className={thClass}>Customer</th>
                <th scope="col" className={thClass}>Technician</th>
                <th scope="col" className={thClass}>Date</th>
                <th scope="col" className={thClass}>Amount</th>
                <th scope="col" className={thClass}>Status</th>
                <th scope="col" className={thClass}>Payment</th>
                <th scope="col" className={cn(thClass, "text-right")}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b.id} className={rowClass}>
                  <td className={tdClass}>
                    <p className="font-semibold text-forest">{b.serviceTitle}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">#{b.id}</p>
                  </td>
                  <td className={tdClass}>{b.customer}</td>
                  <td className={tdClass}>{b.technician}</td>
                  <td className={cn(tdClass, "whitespace-nowrap")}>{formatDate(b.date)}</td>
                  <td className={cn(tdClass, "font-semibold text-forest tabular-nums")}>{formatBDT(b.amount)}</td>
                  <td className={tdClass}><BookingStatusBadge status={b.status} /></td>
                  <td className={tdClass}><PaymentStatusBadge status={b.paymentStatus} /></td>
                  <td className={cn(tdClass, "text-right")}>
                    <button
                      type="button"
                      onClick={() => setSelected(b)}
                      aria-label={`View booking ${b.id}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-forest/10 hover:text-forest focus-visible:outline-2 focus-visible:outline-sage"
                    >
                      <Eye aria-hidden className="size-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-4 pt-0 sm:p-5 sm:pt-0">
            <EmptyState
              icon={CalendarCheck}
              title="No bookings found"
              description="Try a different search or filter."
            />
          </div>
        )}
      </TableCard>

      <DetailSheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected ? `Booking #${selected.id}` : "Booking"}
      >
        {selected && (
          <>
            <p className="font-[family-name:var(--font-manrope)] text-lg font-extrabold text-forest">
              {selected.serviceTitle}
            </p>
            <DetailRows
              rows={[
                { label: "Customer", value: selected.customer },
                { label: "Technician", value: selected.technician },
                { label: "Date", value: formatDate(selected.date) },
                { label: "Amount", value: formatBDT(selected.amount) },
                { label: "Status", value: <BookingStatusBadge status={selected.status} /> },
                { label: "Payment", value: <PaymentStatusBadge status={selected.paymentStatus} /> },
              ]}
            />
          </>
        )}
      </DetailSheet>
    </>
  )
}