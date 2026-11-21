import { CalendarCheck, CreditCard, Search, Wrench, type LucideIcon } from "lucide-react";

import { BlurFade } from "@/components/magic/blur-fade";

import { cn } from "@/lib/utils";
import { DrawLine } from "../magic/draw-line";

type Step = { title: string; description: string; icon: LucideIcon };

const steps: Step[] = [
  {
    title: "Find a Service",
    description: "Browse approved services by category, price and rating.",
    icon: Search,
  },
  {
    title: "Book a Technician",
    description: "Pick a date, share your address and send the request.",
    icon: CalendarCheck,
  },
  {
    title: "Get It Repaired",
    description: "Your technician accepts, arrives and completes the job.",
    icon: Wrench,
  },
  {
    title: "Pay Securely",
    description: "Pay the final amount online once the work is done.",
    icon: CreditCard,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-[1440px] rounded-[2rem] border border-line-strong/50 bg-pale-sage px-6 py-12 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] sm:px-10 sm:py-16">
        {/* Heading */}
        <BlurFade inView className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-sage-deep">How it works</p>
          <h2 className="mt-2 font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
            From broken to fixed in four steps
          </h2>
        </BlurFade>

        {/* Steps — vertical timeline on mobile/tablet, horizontal on desktop */}
        <ol className="relative mx-auto mt-12 grid max-w-5xl gap-8 sm:mt-14 lg:grid-cols-4 lg:gap-6">
          {/* Desktop connector: runs through the centre of the four icon tiles */}
          <DrawLine
            axis="x"
            className="absolute left-[12.5%] right-[12.5%] top-8 hidden border-t-2 border-dashed border-sage/60 lg:block"
          />

          {steps.map(({ title, description, icon: Icon }, i) => (
            <li key={title} className="group relative">
              <BlurFade inView delay={0.1 + i * 0.12} y={16} className="flex gap-4 lg:flex-col lg:items-center lg:text-center">
                {/* Mobile connector to the next step */}
                {i < steps.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute -bottom-6 left-[31px] top-[72px] border-l-2 border-dashed border-sage/60 lg:hidden"
                  />
                )}

                {/* Icon tile: white → solid forest on hover */}
                <span
                  className={cn(
                    "relative z-10 flex size-16 shrink-0 items-center justify-center rounded-2xl bg-surface text-forest",
                    "shadow-[inset_0_1px_1px_rgb(255_255_255),0_1px_2px_rgb(38_58_50/0.08),0_12px_24px_-12px_rgb(38_58_50/0.35)]",
                    "ring-1 ring-forest/10 transition-all duration-300 ease-out",
                    "group-hover:-translate-y-1 group-hover:bg-forest group-hover:text-white group-hover:ring-forest",
                    "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                  )}
                >
                  <Icon
                    aria-hidden
                    strokeWidth={1.75}
                    className="size-7 origin-center transition-transform duration-300 ease-out group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                  />
                </span>

                <div className="min-w-0 pt-1 lg:pt-0">
                  <p className="text-xs font-semibold tracking-wide text-sage-deep lg:mt-5">Step {i + 1}</p>
                  <h3 className="mt-1 font-[family-name:var(--font-manrope)] text-lg font-bold tracking-tight text-forest">
                    {title}
                  </h3>
                  <p className="mt-1.5 max-w-[16rem] text-sm leading-relaxed text-ink-soft lg:mx-auto">
                    {description}
                  </p>
                </div>
              </BlurFade>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}