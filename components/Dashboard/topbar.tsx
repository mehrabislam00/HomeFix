"use client"

import { Bell, Menu, Search } from "lucide-react"


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { initialsOf } from "@/lib/dashboard-data"
import { useState } from "react"
import { SidebarContent } from "./sidebar"

export function Topbar({
  user,
}: {
  user: { name: string; role: string; image?: string }
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-ivory/80 px-4 backdrop-blur-xl sm:px-6">
      {/* Mobile / tablet sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              aria-label="Open menu"
              className="size-10 shrink-0 rounded-xl border border-line-strong/60 bg-surface p-0 text-forest hover:bg-forest/10 lg:hidden"
            >
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent
          side="left"
          className="w-[min(86vw,20rem)] gap-0 border-line bg-ivory p-3"
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
        className="relative w-full max-w-md"
      >
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-soft"
        />
        <input
          name="q"
          type="search"
          aria-label="Search services"
          placeholder="Search services…"
          className="h-11 w-full rounded-full border border-line-strong/70 bg-surface pr-4 pl-11 text-sm text-ink shadow-[0_1px_2px_rgb(38_58_50/0.05)] transition outline-none placeholder:text-ink-soft/60 focus-visible:border-sage focus-visible:ring-4 focus-visible:ring-sage/20"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications: UI only until a notifications source exists */}
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-10 items-center justify-center rounded-full text-forest transition-colors hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-sage"
        >
          <Bell aria-hidden className="size-[18px]" />
        </button>
        <Avatar size="lg">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-sage text-xs font-semibold text-white">
            {initialsOf(user.name)}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}