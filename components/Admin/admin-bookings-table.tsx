"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { CalendarCheck, Eye, Loader2 } from "lucide-react"

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
import { getAdminBooking } from "@/lib/Action/admin-actions"
import { btn } from "@/lib/button-styles"
import { cn, formatBDT } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DetailRows, DetailSheet } from "./detail-sheet"
import { rowClass, tdClass, thClass, TableCard } from "./table-card"
import { FilterSelect, SearchInput } from "./table-toolbar"

const statusOptions = [
  { value: "all", label: "All statuses" },
  ...BOOKING_STATUS_ORDER.map((s) => ({
    value: s,
    label: BOOKING_STATUS_LABEL[s],
  })),
]
const paymentOptions = [
  { value: "all", label: "All payments" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Unpaid" },
]

const formatDate = (iso: string) =>
  iso ? format(parseISO(iso), "MMM d, yyyy") : "Date not set"

export function AdminBookingsTable({
  bookings,
  onUpdate,
}: {
  bookings: AdminBooking[]
  onUpdate: (
    id: string,
    values: Record<string, unknown>
  ) => Promise<{ ok: true } | { ok: false; error: string }>
}) {
  const [items, setItems] = useState(bookings)
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [payment, setPayment] = useState("all")
  const [selected, setSelected] = useState<AdminBooking | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  const needle = query.trim().toLowerCase().replace(/^#/, "")
  const visible = items.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (payment === "all" || b.paymentStatus === payment) &&
      (!needle ||
        [b.id, b.serviceTitle, b.customer, b.technician].some((v) =>
          v.toLowerCase().includes(needle)
        ))
  )

  async function openBooking(booking: AdminBooking) {
    setSelected(booking)
    setError("")
    setNotice("")
    try {
      setSelected(await getAdminBooking(booking.id))
    } catch (detailError) {
      setError(
        detailError instanceof Error
          ? detailError.message
          : "Unable to load booking details."
      )
    }
  }

  async function saveBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selected) return
    const formData = new FormData(event.currentTarget)
    const date = String(formData.get("date") ?? "")
    const status = String(formData.get("status") ?? "")
    const finalAmountValue = String(formData.get("finalAmount") ?? "")
    const finalAmount =
      finalAmountValue === "" ? undefined : Number(finalAmountValue)
    if (
      finalAmount !== undefined &&
      (!Number.isFinite(finalAmount) || finalAmount < 0)
    ) {
      setError("Enter a valid final amount.")
      return
    }
    const values: Record<string, unknown> = {
      status: status === "in_progress" ? "in-progress" : status,
      customerPhone: String(formData.get("customerPhone") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      problemDescription: String(
        formData.get("problemDescription") ?? ""
      ).trim(),
      ...(date ? { preferredDate: date } : {}),
      ...(finalAmount !== undefined ? { finalAmount } : {}),
    }

    setBusy(true)
    setError("")
    setNotice("")
    try {
      const result = await onUpdate(selected.id, values)
      if (!result.ok) {
        setError(result.error)
        return
      }
      const updated: AdminBooking = {
        ...selected,
        date,
        status: status as AdminBooking["status"],
        customerPhone: values.customerPhone as string,
        address: values.address as string,
        problemDescription: values.problemDescription as string,
        ...(finalAmount !== undefined
          ? { finalAmount, amount: finalAmount }
          : {}),
      }
      setSelected(updated)
      setItems((current) =>
        current.map((booking) =>
          booking.id === updated.id ? updated : booking
        )
      )
      setNotice("Booking details were updated.")
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update this booking."
      )
    } finally {
      setBusy(false)
    }
  }

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
            <FilterSelect
              value={status}
              onChange={setStatus}
              options={statusOptions}
              label="Filter by status"
            />
            <FilterSelect
              value={payment}
              onChange={setPayment}
              options={paymentOptions}
              label="Filter by payment"
            />
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
                <th scope="col" className={thClass}>
                  Booking
                </th>
                <th scope="col" className={thClass}>
                  Customer
                </th>
                <th scope="col" className={thClass}>
                  Technician
                </th>
                <th scope="col" className={thClass}>
                  Date
                </th>
                <th scope="col" className={thClass}>
                  Amount
                </th>
                <th scope="col" className={thClass}>
                  Status
                </th>
                <th scope="col" className={thClass}>
                  Payment
                </th>
                <th scope="col" className={cn(thClass, "text-right")}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b.id} className={rowClass}>
                  <td className={tdClass}>
                    <p className="font-semibold text-forest">
                      {b.serviceTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">#{b.id}</p>
                  </td>
                  <td className={tdClass}>{b.customer}</td>
                  <td className={tdClass}>{b.technician}</td>
                  <td className={cn(tdClass, "whitespace-nowrap")}>
                    {formatDate(b.date)}
                  </td>
                  <td
                    className={cn(
                      tdClass,
                      "font-semibold text-forest tabular-nums"
                    )}
                  >
                    {formatBDT(b.amount)}
                  </td>
                  <td className={tdClass}>
                    <BookingStatusBadge status={b.status} />
                  </td>
                  <td className={tdClass}>
                    <PaymentStatusBadge status={b.paymentStatus} />
                  </td>
                  <td className={cn(tdClass, "text-right")}>
                    <button
                      type="button"
                      onClick={() => void openBooking(b)}
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
            <p aria-live="polite" className="sr-only">
              {busy ? "Saving booking changes" : ""}
            </p>
            <p className="font-[family-name:var(--font-manrope)] text-lg font-extrabold text-forest">
              {selected.serviceTitle}
            </p>
            <DetailRows
              rows={[
                { label: "Customer", value: selected.customer },
                { label: "Technician", value: selected.technician },
                { label: "Date", value: formatDate(selected.date) },
                { label: "Amount", value: formatBDT(selected.amount) },
                {
                  label: "Status",
                  value: <BookingStatusBadge status={selected.status} />,
                },
                {
                  label: "Payment",
                  value: <PaymentStatusBadge status={selected.paymentStatus} />,
                },
              ]}
            />
            <form
              key={`${selected.id}:${selected.status}:${selected.date}:${selected.customerPhone ?? ""}`}
              className="flex flex-col gap-3"
              onSubmit={saveBooking}
            >
              <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
                Status
                <select
                  name="status"
                  defaultValue={selected.status}
                  className="h-10 rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                >
                  {BOOKING_STATUS_ORDER.map((value) => (
                    <option key={value} value={value}>
                      {BOOKING_STATUS_LABEL[value]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
                Preferred date
                <input
                  name="date"
                  type="date"
                  defaultValue={selected.date}
                  className="h-10 rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
                Final amount (BDT)
                <input
                  name="finalAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={selected.finalAmount ?? ""}
                  className="h-10 rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
                Customer phone
                <input
                  name="customerPhone"
                  defaultValue={selected.customerPhone ?? ""}
                  className="h-10 rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
                Address
                <input
                  name="address"
                  defaultValue={selected.address ?? ""}
                  className="h-10 rounded-xl border border-forest/15 bg-white px-3 text-sm text-ink"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-soft">
                Problem description
                <textarea
                  name="problemDescription"
                  defaultValue={selected.problemDescription ?? ""}
                  className="min-h-20 rounded-xl border border-forest/15 bg-white px-3 py-2 text-sm text-ink"
                />
              </label>
              {error && (
                <p role="alert" className="text-sm text-status-rejected-fg">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="text-sm text-status-success-fg">
                  {notice}
                </p>
              )}
              <Button
                type="submit"
                className={cn(btn.lg, btn.primary)}
                disabled={busy}
              >
                {busy && (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                )}
                Save booking
              </Button>
            </form>
          </>
        )}
      </DetailSheet>
    </>
  )
}
