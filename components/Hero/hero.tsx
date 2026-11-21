import Link from "next/link";
import { ArrowRight, Search, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HeroVisual } from "@/components/Hero/hero-visual";
import { BlurFade } from "@/components/magic/blur-fade";
import { BorderBeam } from "@/components/magic/border-beam";
import { btn } from "@/lib/button-styles";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-[1440px] items-center gap-16 px-6 pb-24 pt-16 sm:px-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-20">
      {/* ---------- Left: copy (one staggered entrance) ---------- */}
      <div className="flex flex-col items-start">
        <BlurFade delay={0}>
          <Badge
            variant="outline"
            className="h-8 gap-2 rounded-full border-line-strong/60 bg-surface px-3.5 text-xs font-semibold leading-none text-forest"
          >
            <Sparkles className="size-3.5 text-sage" />
            Your Home, Our Responsibility
          </Badge>
        </BlurFade>

        <BlurFade delay={0.08} blur={8} className="mt-6">
          <h1 className="font-[family-name:var(--font-manrope)] text-5xl font-extrabold leading-[1.04] tracking-tight text-forest sm:text-6xl xl:text-[4.25rem]">
            Expert repairs.
            <br />
            <span className="shiny-text">Trusted</span> technicians.
          </h1>
        </BlurFade>

        <BlurFade delay={0.16} blur={6}>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ink-soft">
            Book reliable professionals for your home appliances, electrical and
            plumbing needs — and pay only when the job is done.
          </p>
        </BlurFade>

        {/* Search — white field, strong border, travelling border beam */}
        <BlurFade delay={0.24} className="mt-9 w-full max-w-[540px]">
          <form
            action="/services"
            role="search"
            className="relative flex h-16 w-full items-center gap-2 rounded-2xl border border-line-strong bg-surface py-2 pl-5 pr-2
                       shadow-[0_10px_30px_-12px_rgba(38,58,50,0.30)] transition
                       focus-within:border-sage focus-within:ring-4 focus-within:ring-sage/20"
          >
            <BorderBeam />
            <Search className="size-5 shrink-0 text-forest" aria-hidden />
            <Input
              name="q"
              aria-label="What needs fixing?"
              placeholder="What needs fixing? e.g. AC, fridge…"
              className="h-full flex-1 border-0 bg-transparent px-1 text-base text-ink shadow-none placeholder:text-ink-soft/70 focus-visible:ring-0"
            />
            <Button type="submit" className={cn(btn.md, btn.primary, "shine relative h-12 overflow-hidden px-6")}>
              Search
            </Button>
          </form>
        </BlurFade>

        {/* CTAs */}
        <BlurFade delay={0.32} className="mt-6">
          <div className="flex flex-wrap gap-3">
            <Button className={cn(btn.lg, btn.primary, "shine relative overflow-hidden")} asChild>
              <Link href="/services">
                Explore Services
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              variant="outline"
              className={cn(btn.lg, btn.outline, "bg-surface hover:bg-field")}
              asChild
            >
              <Link href="/become-a-technician">Become a Technician</Link>
            </Button>
          </div>
        </BlurFade>
      </div>

      {/* ---------- Right: visual ---------- */}
      <HeroVisual />
    </section>
  );
}