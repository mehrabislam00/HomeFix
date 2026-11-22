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

const actions: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Explore services", href: "/services", icon: Search },
  {
    label: "View my bookings",
    href: "/dashboard/bookings",
    icon: CalendarCheck,
  },
  { label: "Payment history", href: "/dashboard/payments", icon: CreditCard },
  { label: "Update profile", href: "/dashboard/profile", icon: User },
]

export function QuickActions() {
  return (
    <BlurFade fade={false} delay={0.18} y={16} className="h-full">
      <section className="glass-card relative h-full rounded-[1.75rem] p-5 sm:p-7">
        <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
          Quick actions
        </h2>
        <ul className="mt-5 flex flex-col gap-3">
          {actions.map(({ label, href, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex items-center gap-3 rounded-2xl border border-line-strong/60 bg-surface p-3 transition-all duration-200 hover:-translate-y-px hover:border-sage hover:bg-pale-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage motion-reduce:transition-none motion-reduce:hover:translate-y-0"
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