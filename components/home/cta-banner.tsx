import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BlurFade } from "@/components/magic/blur-fade";
import { Button } from "@/components/ui/button";
import { btn } from "@/lib/button-styles";
import { cn } from "@/lib/utils";

export function CtaBanner() {
  return (
    <section id="get-started" className="scroll-mt-28 px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-10">
      <BlurFade inView y={18}>
        <div className="relative mx-auto flex max-w-[1280px] flex-col gap-8 overflow-hidden rounded-[2rem] bg-forest px-6 py-10 shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_30px_70px_-36px_rgb(38_58_50/0.6)] sm:px-10 sm:py-14 lg:flex-row lg:items-center lg:justify-between lg:px-14">
          {/* Sage light-pools */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-24 size-[420px] rounded-full bg-sage/30 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 size-[300px] rounded-full bg-muted-sage/15 blur-3xl" />
          </div>

          <div className="relative max-w-xl">
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Something broken at home?
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/70 sm:text-lg">
              Find a verified technician today — or join HomeFix and grow your repair business.
            </p>
          </div>

          <div className="relative flex flex-wrap gap-3">
            <Button
              className={cn(btn.lg, "shine relative overflow-hidden bg-ivory text-forest hover:bg-white")}
              asChild
            >
              <Link href="/services">
                Explore Services
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
            <Button
              className={cn(btn.lg, "bg-sage text-white hover:bg-sage-deep")}
              asChild
            >
              <Link href="/become-a-technician">Join as Technician</Link>
            </Button>
          </div>
        </div>
      </BlurFade>
    </section>
  );
}