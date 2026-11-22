"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bell,
  BellOff,
  House,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  User,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { signOut } from "@/lib/Action/auth-actions"
import { initialsOf } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { SidebarContent, type DashboardUser } from "./sidebar"

const popoverClass =
  "gap-0 rounded-3xl border border-white/70 bg-white/75 p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_2px_4px_rgb(38_58_50/0.05),0_28px_60px_-22px_rgb(38_58_50/0.5)] ring-0 backdrop-blur-2xl backdrop-saturate-150 duration-200 data-open:slide-in-from-top-2"

const itemClass =
  "group flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-medium text-ink transition-colors duration-200 hover:bg-forest/10 hover:text-forest focus-visible:bg-forest/10 focus-visible:outline-2 focus-visible:outline-sage"

const iconClass =
  "size-[18px] text-sage-deep transition-colors group-hover:text-forest"

function UserAvatar({ user, className }: { user: DashboardUser; className?: string }) {
  return (
    <Avatar size="lg" className={className}>
      {user.image && <AvatarImage src={user.image} alt={user.name} />}
      <AvatarFallback className="bg-sage text-xs font-semibold text-white">
        {initialsOf(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}

/** Notifications: no notifications source exists yet, so this shows an honest empty state. */
function Notifications() {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Notifications"
        className="relative flex size-11 items-center justify-center rounded-full border border-white/70 bg-white/60 text-forest transition-all duration-200 outline-none hover:bg-white focus-visible:ring-4 focus-visible:ring-sage/40 active:scale-95 motion-reduce:active:scale-100"
      >
        <Bell aria-hidden strokeWidth={1.75} className="size-[18px]" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={14}
        className={cn(popoverClass, "w-[min(20rem,calc(100vw-1.5rem))]")}
      >
        <p className="px-3 pt-2 font-[family-name:var(--font-manrope)] text-sm font-bold text-forest">
          Notifications
        </p>
        <div className="flex flex-col items-center px-4 py-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-pale-sage text-forest ring-1 ring-forest/10">
            <BellOff aria-hidden strokeWidth={1.75} className="size-6" />
          </span>
          <p className="mt-3 text-sm font-semibold text-forest">
            You&apos;re all caught up
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            Booking updates will appear here.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function AccountMenu({ user }: { user: DashboardUser }) {
  const pathname = usePathname()
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const open = openedOn === pathname
  const close = () => setOpenedOn(null)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => setOpenedOn(next ? pathname : null)}
    >
      <PopoverTrigger
        aria-label="Open account menu"
        className={cn(
          "rounded-full outline-none transition-transform duration-150 focus-visible:ring-4 focus-visible:ring-sage/40 active:scale-95 motion-reduce:active:scale-100",
          open && "ring-4 ring-sage/30"
        )}
      >
        <UserAvatar user={user} className="size-11 ring-2 ring-white" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={14}
        className={cn(popoverClass, "w-[min(18rem,calc(100vw-1.5rem))]")}
      >
        <div className="flex items-center gap-3 px-3 py-3">
          <UserAvatar user={user} className="size-11" />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-[family-name:var(--font-manrope)] text-sm font-bold text-forest">
              {user.name}
            </p>
            <p className="mt-1 truncate text-xs text-ink-soft">
              {user.email ?? user.role}
            </p>
          </div>
        </div>
        <div aria-hidden className="mx-2 h-px bg-forest/10" />
        <nav aria-label="Account" className="mt-2 flex flex-col gap-0.5">
          <Link href="/dashboard" onClick={close} className={itemClass}>
            <LayoutGrid aria-hidden strokeWidth={1.75} className={iconClass} />
            Overview
          </Link>
          <Link href="/dashboard/profile" onClick={close} className={itemClass}>
            <User aria-hidden strokeWidth={1.75} className={iconClass} />
            My Profile
          </Link>
          <Link href="/" onClick={close} className={itemClass}>
            <House aria-hidden strokeWidth={1.75} className={iconClass} />
            Back to site
          </Link>
        </nav>
        <div aria-hidden className="mx-2 my-2 h-px bg-forest/10" />
        <form action={signOut}>
          <button
            type="submit"
            className={cn(
              itemClass,
              "hover:bg-status-rejected-bg hover:text-status-rejected-fg focus-visible:bg-status-rejected-bg"
            )}
          >
            <LogOut
              aria-hidden
              strokeWidth={1.75}
              className="size-[18px] text-ink-soft transition-colors group-hover:text-status-rejected-fg"
            />
            Log out
          </button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export function Topbar({ user }: { user: DashboardUser }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="liquid-glass sticky top-3 z-30 mx-3 mt-3 flex h-[68px] items-center gap-3 rounded-[1.75rem] px-3 sm:mx-6 sm:px-4">
      {/* Mobile / tablet drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              aria-label="Open menu"
              className="size-11 shrink-0 rounded-full border border-white/70 bg-white/60 p-0 text-forest hover:bg-white lg:hidden"
            >
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent
          side="left"
          className="w-[min(88vw,20rem)] gap-0 border-white/60 bg-ivory/85 p-3 backdrop-blur-2xl"
        >
          <SheetHeader className="sr-only p-0">
            <SheetTitle>Dashboard menu</SheetTitle>
          </SheetHeader>
          <SidebarContent user={user} onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <form
        action="/services"
        role="search"
        className="group relative w-full max-w-md"
      >
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft transition-colors group-focus-within:text-forest"
        />
        <input
          name="q"
          type="search"
          aria-label="Search services"
          placeholder="Search services…"
          className="h-11 w-full rounded-full border border-white/70 bg-white/60 pr-4 pl-11 text-sm text-ink transition-all duration-200 outline-none placeholder:text-ink-soft/60 focus-visible:border-sage focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-sage/20"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <Notifications />
        <AccountMenu user={user} />
      </div>
    </header>
  )
}