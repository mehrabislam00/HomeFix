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
}: {
  services: FeaturedService[]
}) {
  return (
    <section
      id="top-rated"
      className="relative scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14"
    >
      {/* Soft sage light-pools so the frosted cards have something to blur.
          Not clipped vertically (-bottom-32 + -z-10) so the glow fades out under the next section
          instead of ending in a hard edge; overflow-x-clip prevents horizontal scroll. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-32 -z-10 overflow-x-clip"
      >
        <div className="absolute top-1/3 -left-24 size-[380px] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 size-[420px] rounded-full bg-muted-sage/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-2 sm:px-4">
        {/* Heading */}
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

        {/* Cards */}
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
      </div>
    </section>
  )
}
