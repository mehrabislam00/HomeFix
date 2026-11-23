import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import {
  ServiceCard,
  type FeaturedService,
} from "@/components/home/service-card"
import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"

export function TopRatedServices({
  services,
  error,
}: {
  services: FeaturedService[]
  error?: string
}) {
  return (
    <section
      id="top-rated"
      className="relative scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-32 -z-10 overflow-x-clip"
      >
        <div className="absolute top-1/3 -left-24 size-[380px] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 size-[420px] rounded-full bg-muted-sage/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-2 sm:px-4">
        <BlurFade inView className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sage-deep">Featured</p>
            <h2 className="mt-2 font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
              Top-rated services
            </h2>
          </div>
          <Button
            className={cn(
              btn.md,
              btn.outline,
              "shrink-0 bg-surface hover:bg-field"
            )}
            asChild
          >
            <Link href="/services">
              Browse all
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </BlurFade>

        {error ? (
          <p
            role="alert"
            className="mt-8 text-sm font-medium text-status-rejected-fg"
          >
            {error}
          </p>
        ) : services.length ? (
          <ul className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {services.map(({ id, ...service }, i) => (
              <li key={id} className="flex">
                <BlurFade
                  inView
                  delay={(i % 3) * 0.08}
                  y={16}
                  className="flex w-full"
                >
                  <ServiceCard {...service} />
                </BlurFade>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-sm text-ink-soft">
            No approved services are available right now.
          </p>
        )}
      </div>
    </section>
  )
}
