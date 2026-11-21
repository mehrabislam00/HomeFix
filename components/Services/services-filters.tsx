"use client"

import { Search, SlidersHorizontal } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { serviceCategories } from "@/lib/services-data"
import { cn } from "@/lib/utils"

export type SortKey = "top-rated" | "price-asc" | "price-desc" | "most-reviewed"

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "top-rated", label: "Top rated" },
  { value: "most-reviewed", label: "Most reviewed" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

export function ServicesFilters({
  query,
  onQueryChange,
  sort,
  onSortChange,
  category,
  onCategoryChange,
}: {
  query: string
  onQueryChange: (v: string) => void
  sort: SortKey
  onSortChange: (v: SortKey) => void
  category: string
  onCategoryChange: (slug: string) => void
}) {
  return (
    <div>
      {/* Search + sort on a frosted bar */}
      <div className="glass-card relative flex flex-col gap-2 rounded-[1.75rem] p-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-forest"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search services"
            placeholder="Search services…"
            className="h-12 w-full rounded-2xl border border-transparent bg-surface pr-4 pl-11 text-base text-ink transition outline-none placeholder:text-ink-soft/60 focus-visible:border-sage focus-visible:ring-4 focus-visible:ring-sage/20"
          />
        </div>

        <div className="flex items-center gap-2 sm:pr-1">
          <SlidersHorizontal
            aria-hidden
            className="ml-2 hidden size-4 text-ink-soft sm:block"
          />
          <Select
            value={sort}
            onValueChange={(v) => onSortChange(v as SortKey)}
            items={sortOptions}
          >
            <SelectTrigger
              aria-label="Sort services"
              className="h-12 w-full rounded-2xl border-line-strong bg-surface px-4 text-sm font-medium text-ink shadow-[0_1px_2px_rgb(38_58_50/0.06)] hover:bg-field sm:w-[200px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Category chips — scroll sideways on small screens */}
      <div
        role="group"
        aria-label="Filter by category"
        className="-mx-6 mt-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-6 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {serviceCategories.map(({ slug, label }) => {
          const active = category === slug
          return (
            <button
              key={slug}
              type="button"
              aria-pressed={active}
              onClick={() => onCategoryChange(slug)}
              className={cn(
                "inline-flex h-11 shrink-0 items-center rounded-full border px-5 text-sm leading-none font-semibold transition-all duration-200",
                "hover:-translate-y-px active:translate-y-0 active:scale-[0.98]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                active
                  ? "border-forest bg-forest text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_8px_18px_-8px_rgb(38_58_50/0.55)]"
                  : "border-line-strong bg-surface text-forest hover:border-sage hover:bg-pale-sage"
              )}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}