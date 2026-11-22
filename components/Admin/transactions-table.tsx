"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { ReceiptText } from "lucide-react"

import { EmptyState } from "@/components/Dashboard/empty-state"
import { PaymentStatusBadge } from "@/components/Dashboard/status-badge"
import type { AdminTransaction } from "@/lib/admin-data"
import { cn, formatBDT } from "@/lib/utils"
import { rowClass, tdClass, thClass, TableCard } from "./table-card"
import { SearchInput } from "./table-toolbar"

export function TransactionsTable({
  transactions,
}: {
  transactions: AdminTransaction[]
}) {
  const [query, setQuery] = useState("")
  const needle = query.trim().toLowerCase().replace(/^#/, "")
  const visible = transactions.filter(
    (t) =>
      !needle ||
      [t.id, t.bookingId, t.customer, t.serviceTitle, t.technician].some((v) =>
        v.toLowerCase().includes(needle)
      )
  )

  return (
    <TableCard
      toolbar={
        <SearchInput
          value={query}
          onChange={setQuery}
          label="Search transactions"
          placeholder="Search transaction, booking or customer..."
        />
      }
    >
      <p aria-live="polite" className="sr-only">
        {visible.length} transactions
      </p>
      {visible.length ? (
        <table className="w-full min-w-[880px] border-collapse">
          <thead className="bg-pale-sage/60">
            <tr>
              <th scope="col" className={thClass}>Transaction ID</th>
              <th scope="col" className={thClass}>Customer</th>
              <th scope="col" className={thClass}>Service / Booking</th>
              <th scope="col" className={thClass}>Technician</th>
              <th scope="col" className={thClass}>Date</th>
              <th scope="col" className={thClass}>Amount</th>
              <th scope="col" className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => (
              <tr key={t.id} className={rowClass}>
                <td className={cn(tdClass, "font-mono text-xs")}>{t.id}</td>
                <td className={cn(tdClass, "font-semibold text-forest")}>{t.customer}</td>
                <td className={tdClass}>
                  <p className="text-ink">{t.serviceTitle}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">#{t.bookingId}</p>
                </td>
                <td className={tdClass}>{t.technician}</td>
                <td className={cn(tdClass, "whitespace-nowrap")}>
                  {format(parseISO(t.paidAt), "MMM d, yyyy")}
                </td>
                <td className={cn(tdClass, "font-semibold text-forest tabular-nums")}>
                  {formatBDT(t.amount)}
                </td>
                <td className={tdClass}><PaymentStatusBadge status="paid" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-4 pt-0 sm:p-5 sm:pt-0">
          <EmptyState
            icon={ReceiptText}
            title="No transactions found"
            description={
              transactions.length
                ? "Try a different search."
                : "Confirmed payments will be listed here."
            }
          />
        </div>
      )}
    </TableCard>
  )
}