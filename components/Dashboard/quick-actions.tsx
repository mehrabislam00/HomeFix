import Link from "next/link"
import {
  ArrowUpRight,
  CalendarCheck,
  CreditCard,
  Search,
  User,
  type LucideIcon,
} from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"

export type QuickAction = { label: string; href: string; icon: LucideIcon }

export const customerQuickActions: QuickAction[] = [
  { label: "Explore services", href: "/services", icon: Search },
  {
    label: "View my bookings",
    href: "/customer-dashboard/bookings",
    icon: CalendarCheck,
  },
  {
    label: "Payment history",
    href: "/customer-dashboard/payments",
    icon: CreditCard,
  },
  {
    label: "Update profile",
    href: "/customer-dashboard/profile",
    icon: User,
  },
]

export function QuickActions({
  actions = customerQuickActions,
  description = "Jump to what you need.",
}: {
  actions?: QuickAction[]
  description?: string
}) {
  return (
    <BlurFade fade={false} delay={0.18} y={16} className="h-full">
      <section className="glass-card relative h-full rounded-[1.75rem] p-5 sm:p-7">
        <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
          Quick actions
        </h2>
        <p className="mt-1 text-sm text-ink-soft">{description}</p>
        <ul className="mt-5 flex flex-col gap-3">
          {actions.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-3 rounded-2xl border border-white/80 bg-white/60 p-3 transition-all duration-200 hover:-translate-y-px hover:border-sage/60 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-forest ring-1 ring-forest/10 transition-colors duration-300 group-hover:bg-forest group-hover:text-white group-hover:ring-forest">
                  <Icon
                    aria-hidden
                    strokeWidth={1.75}
                    className="size-[18px]"
                  />
                </span>
                <span className="flex-1 text-sm font-semibold text-forest">
                  {label}
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="size-4 text-ink-muted transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-forest motion-reduce:transition-none"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </BlurFade>
  )
}