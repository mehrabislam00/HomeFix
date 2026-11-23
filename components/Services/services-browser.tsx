"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SearchX } from "lucide-react"

import {
  ServiceCard,
  type FeaturedService,
} from "@/components/home/service-card"

import { BlurFade } from "@/components/magic/blur-fade"
import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import { serviceCategories } from "@/lib/services-data"
import { cn } from "@/lib/utils"
import { ServicesFilters, SortKey } from "./services-filters"

const sorters: Record<
  SortKey,
  (a: FeaturedService, b: FeaturedService) => number
> = {
  "top-rated": (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  "most-reviewed": (a, b) => b.reviews - a.reviews,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
}

/**
 * Search, filter and sort the listing. Initial `?q=` / `?category=` values come from the
 * server page (hero search + category links); changes are mirrored back into the URL
 * without a navigation so the view stays shareable.
 */
export function ServicesBrowser({
  services,
  initialQuery = "",
  initialCategory = "all",
}: {
  services: FeaturedService[]
  initialQuery?: string
  initialCategory?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<SortKey>("top-rated")

  function syncUrl(q: string, cat: string) {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (cat !== "all") params.set("category", cat)
    const qs = params.toString()
    window.history.replaceState(
      null,
      "",
      qs ? `?${qs}` : window.location.pathname
    )
  }

  function navigateCategory(q: string, cat: string) {
    const params = new URLSearchParams()
    if (q.trim()) params.set("q", q.trim())
    if (cat !== "all") params.set("category", cat)
    const qs = params.toString()
    router.push(qs ? `/services?${qs}` : "/services")
  }

  const results = useMemo(() => {
    const label = serviceCategories.find((c) => c.slug === category)?.label
    const needle = query.trim().toLowerCase()
    return services
      .filter((s) => category === "all" || s.category === label)
      .filter(
        (s) =>
          !needle ||
          [s.title, s.description, s.category, s.technician].some((f) =>
            f.toLowerCase().includes(needle)
          )
      )
      .sort(sorters[sort])
  }, [services, query, category, sort])

  function reset() {
    setQuery("")
    setCategory("all")
    syncUrl("", "all")
  }

  return (
    <div>
      <ServicesFilters
        query={query}
        onQueryChange={(v) => {
          setQuery(v)
          syncUrl(v, category)
        }}
        sort={sort}
        onSortChange={setSort}
        category={category}
        onCategoryChange={(slug) => {
          setCategory(slug)
          navigateCategory(query, slug)
        }}
      />

      <p aria-live="polite" className="mt-6 text-sm font-medium text-ink-soft">
        {results.length} {results.length === 1 ? "service" : "services"} found
      </p>

      {results.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {results.map(({ id, ...service }, i) => (
            <li key={id} className="flex">
              <BlurFade
                fade={false}
                delay={Math.min(i, 5) * 0.06}
                y={16}
                className="flex w-full"
              >
                <ServiceCard {...service} />
              </BlurFade>
            </li>
          ))}
        </ul>
      ) : (
        <div className="glass-card relative mt-4 flex flex-col items-center rounded-[1.75rem] px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-pale-sage text-forest ring-1 ring-forest/10">
            <SearchX aria-hidden className="size-7" strokeWidth={1.75} />
          </span>
          <h2 className="mt-5 font-[family-name:var(--font-manrope)] text-xl font-bold text-forest">
            No services match your search
          </h2>
          <p className="mt-2 max-w-sm text-sm text-ink-soft">
            Try a different keyword or category, or clear your filters to see
            every approved service.
          </p>
          <Button
            onClick={reset}
            className={cn(
              btn.md,
              btn.outline,
              "mt-6 bg-surface hover:bg-field"
            )}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
