import Image from "next/image"
import Link from "next/link"
import { ArrowRight, BadgeCheck } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"
import teamImg from "@/assets/about-team.jpg"

export function AboutHero() {
  return (
    <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-6 pt-12 pb-10 sm:px-10 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:pt-16">
      {/* Copy */}
      <div className="flex flex-col items-start">
        <BlurFade>
          <p className="text-sm font-semibold text-sage-deep">About HomeFix</p>
        </BlurFade>
        <BlurFade delay={0.08} blur={8} className="mt-3">
          <h1 className="font-[family-name:var(--font-manrope)] text-5xl leading-[1.04] font-extrabold tracking-tight text-forest sm:text-6xl">
            Your home, our
            <br />
            <span className="shiny-text">responsibility.</span>
          </h1>
        </BlurFade>
        <BlurFade delay={0.16} blur={6}>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-soft">
            HomeFix is a marketplace that connects homeowners with skilled
            technicians for appliance repair, electrical work, plumbing and
            everyday maintenance — with clear pricing and a booking flow you can
            follow from request to payment.
          </p>
        </BlurFade>
        <BlurFade delay={0.24} className="mt-8">
          <div className="flex flex-wrap gap-3">
            <Button
              className={cn(
                btn.lg,
                btn.primary,
                "shine relative overflow-hidden"
              )}
              asChild
            >
              <Link href="/services">
                Explore Services
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              className={cn(btn.lg, btn.outline, "bg-surface hover:bg-field")}
              asChild
            >
              <Link href="/become-a-technician">Join as Technician</Link>
            </Button>
          </div>
        </BlurFade>
      </div>

      {/* Visual: sage plate like the home hero, with one floating glass chip */}
      <BlurFade fade={false} delay={0.15} y={18}>
        <div className="relative">
          <div className="rounded-[2.5rem] border border-white/70 bg-pale-sage/80 p-3 shadow-[0_30px_60px_-30px_rgb(38_58_50/0.35)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-card-tint ring-1 ring-forest/10">
              <Image
                src={teamImg}
                alt="A HomeFix technician greeting a homeowner at the door"
                fill
                priority
                placeholder="blur"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest/35 to-transparent"
              />
            </div>
          </div>

          <BlurFade
            fade={false}
            delay={0.55}
            y={12}
            className="absolute -bottom-5 left-6"
          >
            <div className="liquid-glass relative flex items-center gap-3 rounded-2xl px-4 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-status-success-bg shadow-[inset_0_1px_0_rgb(255_255_255/0.7)]">
                <BadgeCheck aria-hidden className="size-5 text-forest" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-forest">
                  Approved technicians only
                </p>
                <p className="text-xs text-ink-soft">
                  Reviewed by the HomeFix team
                </p>
              </div>
            </div>
          </BlurFade>
        </div>
      </BlurFade>
    </section>
  )
}