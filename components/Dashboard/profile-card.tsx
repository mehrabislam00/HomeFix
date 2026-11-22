import { format, parseISO } from "date-fns"
import { Mail, ShieldCheck } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { initialsOf, type Customer } from "@/lib/dashboard-data"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileCard({ customer }: { customer: Customer }) {
  const memberSince = customer.memberSince
    ? format(parseISO(customer.memberSince), "MMM d, yyyy")
    : "Not available"
  const updatedAt = customer.profileUpdatedAt
    ? format(parseISO(customer.profileUpdatedAt), "MMM d, yyyy")
    : "Not available"

  return (
    <BlurFade fade={false} delay={0.05} y={16}>
      <section className="glass-card relative overflow-hidden rounded-[1.75rem] p-6 text-center sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sage/25 to-transparent"
        />
        <Avatar
          size="lg"
          className="relative mx-auto size-28 rounded-full bg-sage text-4xl font-extrabold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_16px_32px_-14px_rgb(38_58_50/0.55)] ring-4 ring-white"
        >
          {customer.image && (
            <AvatarImage src={customer.image} alt={customer.name} />
          )}
          <AvatarFallback className="bg-sage font-[family-name:var(--font-manrope)] text-4xl font-extrabold text-white">
            {initialsOf(customer.name)}
          </AvatarFallback>
        </Avatar>
        <h2 className="mt-5 font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
          {customer.name}
        </h2>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-ink-soft">
          <Mail aria-hidden className="size-3.5" />
          <span className="truncate">{customer.email}</span>
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <Badge
            variant="outline"
            className="h-6 gap-1.5 rounded-full border-transparent bg-pale-sage px-2.5 text-xs font-semibold text-forest"
          >
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            {customer.role.charAt(0).toUpperCase() + customer.role.slice(1)}
          </Badge>
          <Badge
            variant="outline"
            className={`h-6 gap-1.5 rounded-full border-transparent px-2.5 text-xs font-semibold ${
              customer.emailVerified
                ? "bg-status-success-bg text-status-success-fg"
                : "bg-status-cancelled-bg text-status-cancelled-fg"
            }`}
          >
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            {customer.emailVerified ? "Email verified" : "Email pending"}
          </Badge>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
          {customer.bio || "No bio provided."}
        </p>

        <dl className="mt-6 flex flex-col gap-3 border-t border-forest/10 pt-5 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-soft">Member since</dt>
            <dd className="font-semibold text-forest">{memberSince}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-ink-soft">Profile updated</dt>
            <dd className="font-semibold text-forest">{updatedAt}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
          <ShieldCheck aria-hidden className="size-3.5 text-sage-deep" />
          Email and role are managed by HomeFix.
        </p>
      </section>
    </BlurFade>
  )
}