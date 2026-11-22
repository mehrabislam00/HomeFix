"use client"

import { ChevronDown, Search } from "lucide-react"

const controlClass =
  "h-11 rounded-full border border-white/70 bg-white/60 text-sm text-ink transition-all duration-200 outline-none focus-visible:border-sage focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-sage/20"

export function SearchInput({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
}) {
  return (
    <div className="group relative min-w-0 flex-1">
      <Search
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft transition-colors group-focus-within:text-forest"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className={`${controlClass} w-full pr-4 pl-11 placeholder:text-ink-soft/60`}
      />
    </div>
  )
}

export function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label: string
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className={`${controlClass} w-full appearance-none pr-10 pl-4 sm:w-auto`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-soft"
      />
    </div>
  )
}