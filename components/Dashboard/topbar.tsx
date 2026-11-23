"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import {
  AlertCircle,
  Bell,
  BellOff,
  BriefcaseBusiness,
  CalendarCheck,
  CheckCheck,
  CircleCheck,
  House,
  LayoutGrid,
  LogOut,
  LoaderCircle,
  Menu,
  Search,
  User,
  X,
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
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/Action/notification-actions"
import type { NotificationType } from "@/lib/notification-types"
import { NOTIFICATIONS_UPDATED_EVENT } from "@/lib/notification-types"
import { dashboardConfig, type DashboardVariant } from "@/lib/dashboard-config"
import { initialsOf } from "@/lib/dashboard-data"
import { cn } from "@/lib/utils"
import { SidebarContent, type DashboardUser } from "./sidebar"

const popoverClass =
  "gap-0 rounded-3xl border border-white/70 bg-white/75 p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_2px_4px_rgb(38_58_50/0.05),0_28px_60px_-22px_rgb(38_58_50/0.5)] ring-0 backdrop-blur-2xl backdrop-saturate-150 duration-200 data-open:slide-in-from-top-2"

const itemClass =
  "group flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-medium text-ink transition-colors duration-200 hover:bg-forest/10 hover:text-forest focus-visible:bg-forest/10 focus-visible:outline-2 focus-visible:outline-sage"

const iconClass =
  "size-[18px] text-sage-deep transition-colors group-hover:text-forest"

function UserAvatar({
  user,
  className,
}: {
  user: DashboardUser
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

function Notifications() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyFeed = useCallback(
    (result: Awaited<ReturnType<typeof getNotifications>>) => {
      if (result.ok) {
        setItems(result.feed.notifications)
        setUnreadCount(result.feed.unreadCount)
        setError(null)
      } else {
        setError(result.error)
      }
      setLoading(false)
    },
    []
  )

  useEffect(() => {
    let active = true
    const load = () => {
      if (document.visibilityState !== "visible") return
      void getNotifications().then((result) => {
        if (active) applyFeed(result)
      })
    }
    load()
    const interval = window.setInterval(load, 45_000)
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, load)
    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, load)
    }
  }, [applyFeed])

  const refresh = () => {
    void getNotifications().then(applyFeed)
  }

  const openNotification = async (item: NotificationItem) => {
    if (!item.readAt) {
      setBusy(true)
      const result = await markNotificationAsRead(item.id)
      setBusy(false)
      if (!result.ok) {
        setError(result.error)
        return
      }
      const readAt = new Date().toISOString()
      setItems((current) =>
        current.map((notification) =>
          notification.id === item.id
            ? { ...notification, readAt }
            : notification
        )
      )
      setUnreadCount((count) => Math.max(0, count - 1))
      window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT))
    }
    setOpen(false)
    if (item.href) router.push(item.href)
  }

  const markAllRead = async () => {
    if (!unreadCount || busy) return
    setBusy(true)
    const result = await markAllNotificationsAsRead()
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    const readAt = new Date().toISOString()
    setItems((current) =>
      current.map((item) => (item.readAt ? item : { ...item, readAt }))
    )
    setUnreadCount(0)
    setError(null)
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT))
  }

  const dismiss = async (item: NotificationItem) => {
    setBusy(true)
    const result = await deleteNotification(item.id)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setItems((current) => current.filter(({ id }) => id !== item.id))
    if (!item.readAt) setUnreadCount((count) => Math.max(0, count - 1))
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT))
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) refresh()
      }}
    >
      <PopoverTrigger
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        className="relative flex size-11 items-center justify-center rounded-full border border-white/70 bg-white/60 text-forest transition-all duration-200 outline-none hover:bg-white focus-visible:ring-4 focus-visible:ring-sage/40 active:scale-95 motion-reduce:active:scale-100"
      >
        <Bell aria-hidden strokeWidth={1.75} className="size-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-5 items-center justify-center rounded-full border-2 border-ivory bg-forest px-1 text-[10px] leading-4 font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={14}
        className={cn(
          popoverClass,
          "w-[min(25rem,calc(100vw-1.5rem))] overflow-hidden p-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-forest/10 px-4 py-3">
          <div>
            <p className="font-[family-name:var(--font-manrope)] text-sm font-bold text-forest">
              Notifications
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {unreadCount ? `${unreadCount} unread` : "Your latest updates"}
            </p>
          </div>
          <button
            type="button"
            disabled={!unreadCount || busy}
            onClick={() => void markAllRead()}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-forest/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck aria-hidden className="size-3.5" />
            Mark all read
          </button>
        </div>
        {error && (
          <div
            role="alert"
            className="mx-3 mt-3 flex items-center justify-between gap-2 rounded-xl bg-status-rejected-bg px-3 py-2 text-xs text-status-rejected-fg"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void refresh()}
              className="shrink-0 font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-ink-soft">
            <LoaderCircle aria-hidden className="size-4 animate-spin" />
            Loading notifications
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-9 text-center">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-pale-sage text-forest ring-1 ring-forest/10">
              <BellOff aria-hidden strokeWidth={1.75} className="size-6" />
            </span>
            <p className="mt-3 text-sm font-semibold text-forest">
              You&apos;re all caught up
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Booking and account updates will appear here.
            </p>
          </div>
        ) : (
          <div className="max-h-[min(60vh,32rem)] overflow-y-auto p-2">
            {items.map((item) => {
              const content = (
                <>
                  <NotificationIcon type={item.type} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className="min-w-0 flex-1 text-sm leading-5 font-semibold text-forest">
                        {item.title}
                      </span>
                      {!item.readAt && (
                        <span
                          aria-label="Unread"
                          className="mt-1.5 size-2 shrink-0 rounded-full bg-sage-deep"
                        />
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-ink-soft">
                      {item.message}
                    </span>
                    <time
                      dateTime={item.createdAt}
                      className="mt-1.5 block text-[11px] font-medium text-ink-muted"
                    >
                      {notificationTime(item.createdAt)}
                    </time>
                  </span>
                </>
              )
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex items-start gap-3 rounded-2xl p-3 pr-9 transition-colors",
                    item.readAt
                      ? "hover:bg-forest/[0.04]"
                      : "bg-pale-sage/60 hover:bg-pale-sage"
                  )}
                >
                  {item.href ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void openNotification(item)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-sage"
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      {content}
                    </div>
                  )}
                  <button
                    type="button"
                    aria-label={`Dismiss ${item.title}`}
                    disabled={busy}
                    onClick={() => void dismiss(item)}
                    className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full text-ink-muted opacity-100 transition-all hover:bg-white hover:text-forest focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-sage sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const Icon =
    type === "payment_completed"
      ? CircleCheck
      : type === "payment_issue"
        ? AlertCircle
        : type === "payment_processing"
          ? LoaderCircle
          : type.startsWith("service")
            ? BriefcaseBusiness
            : type === "booking_created" || type.startsWith("booking")
              ? CalendarCheck
              : type === "account_update"
                ? AlertCircle
                : Bell
  return (
    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-sage-deep ring-1 ring-forest/10">
      <Icon aria-hidden strokeWidth={1.8} className="size-[17px]" />
    </span>
  )
}

function notificationTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Recently"
    : formatDistanceToNow(date, { addSuffix: true })
}

function AccountMenu({
  user,
  variant,
}: {
  user: DashboardUser
  variant: DashboardVariant
}) {
  const pathname = usePathname()
  const { basePath } = dashboardConfig[variant]
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
          "rounded-full transition-transform duration-150 outline-none focus-visible:ring-4 focus-visible:ring-sage/40 active:scale-95 motion-reduce:active:scale-100",
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
          <Link href={basePath} onClick={close} className={itemClass}>
            <LayoutGrid aria-hidden strokeWidth={1.75} className={iconClass} />
            Overview
          </Link>
          <Link
            href={`${basePath}/profile`}
            onClick={close}
            className={itemClass}
          >
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

export function Topbar({
  user,
  variant = "customer",
}: {
  user: DashboardUser
  variant?: DashboardVariant
}) {
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
          <SidebarContent
            user={user}
            variant={variant}
            onNavigate={() => setOpen(false)}
          />
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
        <AccountMenu user={user} variant={variant} />
      </div>
    </header>
  )
}
