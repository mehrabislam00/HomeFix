import Link from "next/link"
import { Search } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"

export function WelcomeBanner({
  firstName,
  dateLabel,
}: {
  firstName: string
  dateLabel: string
}) {
  return (
    <BlurFade y={16}>
      <section className="relative flex flex-col gap-6 overflow-hidden rounded-[2rem] bg-forest px-6 py-8 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_30px_70px_-36px_rgb(38_58_50/0.6)] sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-16 size-[360px] rounded-full bg-sage/30 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 size-[260px] rounded-full bg-muted-sage/15 blur-3xl" />
          <div className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.08)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)] [background-size:24px_24px]" />
        </div>

        <div className="relative">
          <p className="text-sm text-white/70">{dateLabel}</p>
          <h1 className="mt-1 font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome back, {firstName}!
          </h1>
          <p className="mt-2 text-base text-white/75">
            Here&apos;s what&apos;s happening with your home services.
          </p>
        </div>

        <Button
          className={cn(
            btn.lg,
            "shine relative shrink-0 self-start overflow-hidden bg-ivory text-forest hover:bg-white sm:self-auto"
          )}
          asChild
        >
          <Link href="/services">
            <Search aria-hidden className="size-4" />
            Book a service
          </Link>
        </Button>
      </section>
    </BlurFade>
  )
}