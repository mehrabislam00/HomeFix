"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

/** Right-hand drawer used by the admin tables to show one record in full. */
export function DetailSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[min(92vw,26rem)] gap-0 border-white/60 bg-ivory/90 p-0 backdrop-blur-2xl"
      >
        <SheetHeader className="border-b border-forest/10 p-5">
          <SheetTitle className="font-[family-name:var(--font-manrope)] text-lg font-extrabold tracking-tight text-forest">
            {title}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-5 overflow-y-auto p-5">{children}</div>
      </SheetContent>
    </Sheet>
  )
}

export function DetailRows({
  rows,
}: {
  rows: { label: string; value: React.ReactNode }[]
}) {
  return (
    <dl className="flex flex-col gap-3.5 text-sm">
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex items-center justify-between gap-4 border-b border-forest/10 pb-3 last:border-b-0 last:pb-0"
        >
          <dt className="shrink-0 text-ink-soft">{label}</dt>
          <dd className="min-w-0 text-right font-semibold break-words text-forest">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  )
}