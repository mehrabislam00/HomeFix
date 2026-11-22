import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"

/** Titled glass card for the admin overview, with a "view all" link. */
export function OverviewPanel({
  title,
  description,
  href,
  linkLabel,
  delay = 0.1,
  children,
}: {
  title: string
  description: string
  href: string
  linkLabel: string
  delay?: number
  children: React.ReactNode
}) {
  return (
    <BlurFade fade={false} delay={delay} y={16} className="h-full">
      <section className="glass-card relative h-full rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
              {title}
            </h2>
            <p className="mt-1 text-sm text-ink-soft">{description}</p>
          </div>
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-sage-deep transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            {linkLabel}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>
        <div className="mt-5">{children}</div>
      </section>
    </BlurFade>
  )
}