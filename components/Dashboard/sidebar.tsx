"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CalendarCheck,
  CreditCard,
  House,
  LayoutGrid,
  LogOut,
  User,
  type LucideIcon,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { initialsOf } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import logo from "@/assets/Logo.png"
import { signOut } from "@/lib/Action/auth-actions"

export type DashboardUser = {
  name: string
  role: string
  image?: string
  email?: string
}

const nav: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "My Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
  { label: "Payment History", href: "/dashboard/payments", icon: CreditCard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
]

export const isActive = (pathname: string, href: string) =>
  href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

const linkBase =
  "group relative flex h-11 items-center gap-3 rounded-2xl px-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage motion-reduce:transition-none"

export function SidebarContent({
  user,
  onNavigate,
}: {
  user: DashboardUser
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="HomeFix home"
        className="flex items-center gap-2 rounded-2xl px-2 pt-1 focus-visible:outline-2 focus-visible:outline-sage"
      >
        <Image
          src={logo}
          alt="HomeFix"
          priority
          className="h-11 w-auto object-contain"
        />
      </Link>
      <p className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-forest/[0.07] px-3 py-1 text-[11px] font-semibold tracking-wide text-forest uppercase">
        <span aria-hidden className="size-1.5 rounded-full bg-sage" />
        Customer Dashboard
      </p>

      {/* Navigation */}
      <p className="mt-7 px-3 text-[11px] font-semibold tracking-wider text-ink-muted uppercase">
        Menu
      </p>
      <nav aria-label="Dashboard" className="mt-2 flex flex-col gap-1">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                linkBase,
                active
                  ? "border border-white/80 bg-white/70 font-semibold text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_10px_20px_-14px_rgb(38_58_50/0.5)]"
                  : "border border-transparent text-ink-soft hover:bg-forest/[0.07] hover:text-forest"
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute top-3 bottom-3 -left-1.5 w-1 rounded-full bg-forest"
                />
              )}
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                  active
                    ? "bg-forest text-white"
                    : "bg-pale-sage/70 text-sage-deep group-hover:bg-forest/10 group-hover:text-forest"
                )}
              >
                <Icon aria-hidden strokeWidth={1.75} className="size-[17px]" />
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

      <div aria-hidden className="mx-3 my-4 h-px bg-forest/10" />
      <Link
        href="/"
        onClick={onNavigate}
        className={cn(
          linkBase,
          "border border-transparent text-ink-soft hover:bg-forest/[0.07] hover:text-forest"
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-pale-sage/70 text-sage-deep transition-colors group-hover:bg-forest/10 group-hover:text-forest">
          <House aria-hidden strokeWidth={1.75} className="size-[17px]" />
        </span>
        Back to site
      </Link>

      {/* User */}
      <div className="glass-card relative mt-auto flex items-center gap-3 rounded-2xl p-3">
        <Avatar size="lg" className="ring-2 ring-white">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-sage text-xs font-semibold text-white">
            {initialsOf(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-forest">
            {user.name}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">{user.role}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-status-rejected-bg hover:text-status-rejected-fg focus-visible:outline-2 focus-visible:outline-sage"
          >
            <LogOut aria-hidden className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}