"use client"

import { useEffect, useRef, useState } from "react"
import { BadgeCheck, Check, Copy, MapPin, Phone, TriangleAlert, X } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

/** Shared footprint so Contact ⇄ number never changes the card's size. */
const slot = "h-11 w-full sm:w-[220px]"

/**
 * `phone` must come from the technician's profile. It is never rendered until the
 * visitor asks for it: desktop reveals it on click (with copy), mobile opens the dialer.
 * Without a phone, no Contact control is shown.
 */
export function TechnicianCard({
  name,
  area,
  phone,
}: {
  name: string
  area: string
  phone?: string
}) {
  const [revealed, setRevealed] = useState(false)
  const [notice, setNotice] = useState<{
    message: string
    status: "success" | "error"
  } | null>(null)
  const contactRef = useRef<HTMLButtonElement>(null)
  const copyRef = useRef<HTMLButtonElement>(null)
  const wasRevealed = useRef(false)

  // auto-dismiss the toast
  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 2500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  // keep keyboard focus on the control that replaced the previous one
  useEffect(() => {
    if (revealed) copyRef.current?.focus()
    else if (wasRevealed.current) contactRef.current?.focus()
    wasRevealed.current = revealed
  }, [revealed])

  async function copyPhone() {
    if (!phone) return
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable")
      await navigator.clipboard.writeText(phone)
      setNotice({ message: "Phone number copied!", status: "success" })
    } catch {
      setNotice({ message: "Couldn’t copy. Select the number to copy it.", status: "error" })
    }
  }

  const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined

  return (
    <div className="glass-card relative flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      {/* Toast */}
      <div aria-live="polite" className="pointer-events-none absolute right-4 bottom-full z-10 mb-3">
        {notice && (
          <div className="flex animate-in items-center gap-2 rounded-xl border border-forest/10 bg-surface/95 px-3 py-2 text-sm text-forest shadow-lg backdrop-blur-md duration-200 fade-in-0 slide-in-from-bottom-1">
            {notice.status === "success" ? (
              <Check aria-hidden className="size-4 text-status-success-fg" />
            ) : (
              <TriangleAlert aria-hidden className="size-4 text-status-amber-fg" />
            )}
            {notice.message}
          </div>
        )}
      </div>

      {/* Identity */}
      <div className="flex min-w-0 items-center gap-4">
        <span className="relative shrink-0">
          <Avatar size="lg" className="size-14 ring-2 ring-white">
            <AvatarFallback className="bg-sage text-base font-semibold text-white">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <span
            aria-hidden
            className="absolute right-0 bottom-0 size-3.5 rounded-full border-2 border-white bg-status-success-fg"
          />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-xs text-ink-soft">Your technician</p>
          <p className="mt-1 flex items-center gap-1.5 font-[family-name:var(--font-manrope)] text-lg font-bold text-forest">
            <span className="truncate">{name}</span>
            <BadgeCheck aria-label="Verified technician" className="size-4 shrink-0 text-sage" />
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <MapPin aria-hidden className="size-3.5" />
            {area}
          </p>
        </div>
      </div>

      {/* Contact — number is only rendered after the desktop reveal */}
      {phone && (
        <div className="shrink-0">
          {/* Mobile: straight to the native dialer */}
          <a
            href={phoneHref}
            aria-label={`Call ${name}`}
            className={cn(btn.md, contactStyle, slot, "md:hidden")}
          >
            <Phone aria-hidden className="size-4" />
            Contact
          </a>

          {/* Desktop: Contact → number (same footprint) */}
          <div className={cn(slot, "hidden md:block")}>
            {revealed ? (
              <div
                onKeyDown={(e) => e.key === "Escape" && setRevealed(false)}
                className="flex h-full animate-in items-center gap-1 rounded-xl border border-forest/10 bg-pale-sage pr-1 pl-1 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] duration-200 fade-in-0 zoom-in-95"
              >
                <button
                  ref={copyRef}
                  type="button"
                  onClick={copyPhone}
                  aria-label={`Copy ${name}'s phone number: ${phone}`}
                  className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-forest tabular-nums transition-colors hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-sage"
                >
                  <span className="truncate">{phone}</span>
                  <Copy
                    aria-hidden
                    className="ml-auto size-4 shrink-0 text-sage-deep transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => setRevealed(false)}
                  aria-label="Hide phone number"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-forest/10 hover:text-forest focus-visible:outline-2 focus-visible:outline-sage"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </div>
            ) : (
              <button
                ref={contactRef}
                type="button"
                onClick={() => setRevealed(true)}
                aria-label={`Show ${name}'s phone number`}
                className={cn(btn.md, contactStyle, "h-full w-full animate-in duration-200 fade-in-0 zoom-in-95")}
              >
                <Phone aria-hidden className="size-4" />
                Contact
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const contactStyle =
  "border border-forest/10 bg-pale-sage text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] hover:bg-forest hover:text-white"