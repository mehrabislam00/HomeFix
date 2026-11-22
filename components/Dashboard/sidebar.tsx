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

const nav: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutGrid },
  { label: "My Bookings", href: "/dashboard/bookings", icon: CalendarCheck },
  { label: "Payment History", href: "/dashboard/payments", icon: CreditCard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
]

const isActive = (pathname: string, href: string) =>
  href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`)

const linkBase =
  "relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"

export function SidebarContent({
  user,
  onNavigate,
}: {
  user: { name: string; role: string; image?: string }
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="HomeFix home"
        className="flex items-center gap-2 px-2 pt-1"
      >
        <Image
          src={logo}
          alt="HomeFix"
          priority
          className="h-12 w-auto object-contain"
        />
        <span className="-ml-2 text-[11px] leading-tight font-medium text-ink-soft">
          Customer
          <br />
          Dashboard
        </span>
      </Link>

      <nav aria-label="Dashboard" className="mt-6 flex flex-col gap-1">
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
                  ? "bg-pale-sage font-semibold text-forest shadow-[inset_0_1px_0_rgb(255_255_255/0.8)]"
                  : "text-ink-soft hover:bg-forest/10 hover:text-forest"
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute top-2.5 bottom-2.5 -left-3 w-1 rounded-r-full bg-forest"
                />
              )}
              <Icon aria-hidden strokeWidth={1.75} className="size-[18px]" />
              {label}
            </Link>
          )
        })}
        <Link
          href="/"
          onClick={onNavigate}
          className={cn(
            linkBase,
            "text-ink-soft hover:bg-forest/10 hover:text-forest"
          )}
        >
          <House aria-hidden strokeWidth={1.75} className="size-[18px]" />
          Back to site
        </Link>
      </nav>

      <div className="glass-card relative mt-auto flex items-center gap-3 rounded-2xl p-3">
        <Avatar size="lg">
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
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-forest/10 hover:text-forest focus-visible:outline-2 focus-visible:outline-sage"
          >
            <LogOut aria-hidden className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}