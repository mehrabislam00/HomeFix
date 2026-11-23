"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, LogOut, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { authClient } from "@/lib/auth-client"
import { invalidateCurrentProfileCache } from "@/lib/Action/users"
import { getUnreadNotificationCount } from "@/lib/Action/notification-actions"
import type { SessionUser } from "@/lib/auth-session"
import { dashboardHref } from "@/lib/dashboard-config"
import { initialsOf } from "@/lib/dashboard-data"
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notification-types"
import { cn } from "@/lib/utils"

const itemClass =
  "group flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-medium text-ink transition-colors duration-200 hover:bg-forest/10 hover:text-forest focus-visible:bg-forest/10 focus-visible:outline-2 focus-visible:outline-sage"

function UserAvatar({
  user,
  className,
}: {
  user: SessionUser
  className?: string
}) {
  return (
    <Avatar size="lg" className={className}>
      {user.image && <AvatarImage src={user.image} alt={user.name} />}
      <AvatarFallback className="bg-sage text-xs font-semibold text-white">
        {initialsOf(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}

/**
 * Avatar button + liquid-glass dropdown. Outside click, Escape and focus handling come from
 * Popover; it also closes after navigating (open state is tied to the pathname it opened on).
 */
export function UserMenu({ user }: { user: SessionUser }) {
  const pathname = usePathname()
  const [openedOn, setOpenedOn] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const open = openedOn === pathname
  const dashboard = dashboardHref(user.role)

  const refreshUnreadCount = useCallback(async () => {
    const result = await getUnreadNotificationCount()
    if (result.ok) setUnreadCount(result.unreadCount)
  }, [])

  useEffect(() => {
    let active = true
    const refresh = async () => {
      if (document.visibilityState !== "visible") return
      const result = await getUnreadNotificationCount()
      if (active && result.ok) setUnreadCount(result.unreadCount)
    }
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void refresh()
    }
    void refresh()
    const interval = window.setInterval(refresh, 30_000)
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, handleVisibility)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, handleVisibility)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [user.role])

  async function handleSignOut() {
    setSigningOut(true)
    setSignOutError("")

    try {
      try {
        await invalidateCurrentProfileCache()
      } catch (error) {
        console.error("Unable to clear the signed-in profile cache.", error)
      }

      const { error } = await authClient.signOut()
      if (error) {
        setSignOutError(error.message || "Unable to log out.")
        return
      }
      setOpenedOn(null)
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Unable to log out."
      )
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpenedOn(next ? pathname : null)
        if (next) void refreshUnreadCount()
      }}
    >
      <PopoverTrigger
        aria-label="Open account menu"
        className={cn(
          "relative rounded-full transition-transform duration-150 outline-none active:scale-90 motion-reduce:active:scale-100",
          "focus-visible:ring-4 focus-visible:ring-sage/40",
          open && "ring-4 ring-sage/30"
        )}
      >
        <UserAvatar user={user} className="size-10 ring-2 ring-white/80" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={14}
        className="w-[min(18rem,calc(100vw-1.5rem))] gap-0 rounded-3xl border border-white/70 bg-white/70 p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),inset_0_-1px_0_rgb(38_58_50/0.05),0_2px_4px_rgb(38_58_50/0.05),0_28px_60px_-22px_rgb(38_58_50/0.5)] ring-0 backdrop-blur-2xl backdrop-saturate-150 duration-200 data-open:slide-in-from-top-2"
      >
        {/* Identity */}
        <div className="flex items-center gap-3 px-3 pt-3 pb-3">
          <UserAvatar user={user} className="size-11" />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-[family-name:var(--font-manrope)] text-sm font-bold text-forest">
              {user.name}
            </p>
            <p className="mt-1 truncate text-xs text-ink-soft">{user.email}</p>
          </div>
        </div>

        <div aria-hidden className="mx-2 h-px bg-forest/10" />

        <nav aria-label="Account" className="mt-2 flex flex-col gap-0.5">
          <Link
            href={dashboard}
            onClick={() => setOpenedOn(null)}
            className={itemClass}
          >
            <LayoutGrid
              aria-hidden
              strokeWidth={1.75}
              className="size-[18px] text-sage-deep transition-colors group-hover:text-forest"
            />
            Dashboard
            {unreadCount > 0 && (
              <span
                aria-label={`${unreadCount} unread notifications`}
                className="ml-auto inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white shadow-sm transition-[opacity,transform] duration-200 motion-reduce:transition-none"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <Link
            href={`${dashboard}/profile`}
            onClick={() => setOpenedOn(null)}
            className={itemClass}
          >
            <User
              aria-hidden
              strokeWidth={1.75}
              className="size-[18px] text-sage-deep transition-colors group-hover:text-forest"
            />
            My Profile
          </Link>
        </nav>

        <div aria-hidden className="mx-2 my-2 h-px bg-forest/10" />

        {signOutError && (
          <p role="alert" className="px-3 pb-2 text-xs text-status-rejected-fg">
            {signOutError}
          </p>
        )}
        <div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className={cn(
              itemClass,
              "hover:bg-status-rejected-bg hover:text-status-rejected-fg focus-visible:bg-status-rejected-bg disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            <LogOut
              aria-hidden
              strokeWidth={1.75}
              className="size-[18px] text-ink-soft transition-colors group-hover:text-status-rejected-fg"
            />
            {signingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
