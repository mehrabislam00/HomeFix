"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Menu } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { LiquidGlass } from "@/components/liquid-glass"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import type { SessionUser } from "@/lib/auth-session"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"
import logo from "@/assets/Logo.png"
import { UserMenu } from "./user-menu"

const links = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
]

/** Home only matches "/", other links also match their sub-routes (e.g. /services/ac-repair). */
const isActive = (pathname: string, href: string) =>
  href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`)

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect

export function Navbar() {
  const pathname = usePathname()
  const { data: session, isPending } = authClient.useSession()
  const user: SessionUser | null = session
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? undefined,
      }
    : null
  const reduce = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // Active pill: positioned from offsetLeft/offsetWidth relative to the link track itself.
  // These are layout offsets (not getBoundingClientRect / page coordinates), so scroll
  // position, the fixed header and page height can never affect where the pill starts.
  const trackRef = useRef<HTMLUListElement>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null)

  useIsoLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const activeHref = links.find((l) => isActive(pathname, l.href))?.href
      const el = activeHref ? linkRefs.current[activeHref] : null
      if (!el || !el.offsetWidth) return setPill(null)
      setPill((prev) =>
        prev && prev.left === el.offsetLeft && prev.width === el.offsetWidth
          ? prev
          : { left: el.offsetLeft, width: el.offsetWidth }
      )
    }
    measure()
    // re-measure if the track resizes (breakpoint change, fonts loading)
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => ro.disconnect()
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      {/* Fixed to the viewport — always visible, glass stays live while scrolling */}
      <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6">
        <LiquidGlass
          data-scrolled={scrolled}
          radius={28}
          className="liquid-glass relative mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-3 sm:h-20 sm:px-6"
        >
          <nav className="contents" aria-label="Main">
            {/* Logo only */}
            <Link
              href="/"
              aria-label="HomeFix home"
              className="flex shrink-0 items-center"
            >
              <Image
                src={logo}
                alt="HomeFix"
                priority
                className="h-12 w-auto object-contain sm:h-16"
              />
            </Link>

            {/* Center links — inner glass track */}
            <ul
              ref={trackRef}
              className="relative hidden items-center gap-1 rounded-full border border-white/60 bg-white/40 p-1 shadow-[inset_0_1px_1px_rgb(255_255_255/0.9),inset_0_-1px_1px_rgb(38_58_50/0.06)] md:flex"
            >
              {/* Sliding forest-glass pill (behind the labels) */}
              {pill && (
                <motion.span
                  aria-hidden
                  initial={false}
                  animate={{ x: pill.left, width: pill.width }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                          mass: 0.9,
                        }
                  }
                  className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-full bg-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_6px_14px_-6px_rgb(38_58_50/0.6)]"
                />
              )}
              {links.map(({ label, href }) => {
                const active = isActive(pathname, href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      ref={(el) => {
                        linkRefs.current[href] = el
                      }}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative z-10 inline-flex h-10 items-center rounded-full px-5 text-sm leading-none font-medium transition-colors duration-200",
                        active
                          ? // until the pill is measured (first paint) the link paints its own background
                            cn(
                              "text-white",
                              !pill &&
                                "bg-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_6px_14px_-6px_rgb(38_58_50/0.6)]"
                            )
                          : "text-ink-soft hover:bg-forest/10 hover:text-forest hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]"
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {isPending ? (
                <div
                  aria-label="Loading account"
                  role="status"
                  className="size-10 animate-pulse rounded-full bg-forest/10"
                />
              ) : user ? (
                <>
                  <Button
                    className={cn(
                      btn.md,
                      "hidden border border-forest/10 bg-pale-sage text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] hover:bg-forest hover:text-white sm:inline-flex"
                    )}
                    asChild
                  >
                    <Link href="/dashboard">
                      <LayoutGrid aria-hidden className="size-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <UserMenu user={user} />
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className={cn(
                      btn.md,
                      btn.ghost,
                      "hidden hover:bg-forest/10 hover:text-forest hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.35)] sm:inline-flex"
                    )}
                    asChild
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button className={cn(btn.md, btn.primary)} asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}

              {/* Mobile menu */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      aria-label="Open menu"
                      className="size-10 rounded-xl border border-white/60 bg-white/40 p-0 text-forest hover:bg-forest/10 md:hidden"
                    >
                      <Menu className="size-5" />
                    </Button>
                  }
                />
                <SheetContent
                  side="right"
                  className="w-[min(86vw,22rem)] gap-0 border-line bg-ivory p-0"
                >
                  <SheetHeader className="border-b border-line p-5">
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <Image
                      src={logo}
                      alt="HomeFix"
                      className="h-12 w-auto self-start object-contain"
                    />
                  </SheetHeader>
                  <ul className="flex flex-col gap-1 p-3">
                    {links.map(({ label, href }) => {
                      const active = isActive(pathname, href)
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex h-12 items-center rounded-xl px-4 text-base font-medium transition-colors",
                              active
                                ? "bg-forest text-white"
                                : "text-ink hover:bg-forest/10 hover:text-forest"
                            )}
                          >
                            {label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                  {!isPending && !user && (
                    <div className="mt-auto flex flex-col gap-2 border-t border-line p-5">
                      <Button
                        className={cn(
                          btn.lg,
                          btn.outline,
                          "bg-surface hover:bg-field"
                        )}
                        asChild
                      >
                        <Link href="/login" onClick={() => setOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button className={cn(btn.lg, btn.primary)} asChild>
                        <Link href="/register" onClick={() => setOpen(false)}>
                          Get Started
                        </Link>
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </LiquidGlass>
      </header>

      {/* Spacer: the bar is out of the flow now, so reserve its height — no content hides underneath */}
      <div aria-hidden className="h-[72px] sm:h-20" />
    </>
  )
}