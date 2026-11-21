import { Clock, ShieldCheck, Tag, UserCheck, type LucideIcon } from "lucide-react";

import { CountUp } from "@/components/Count up/count-up";
import { BlurFade } from "@/components/magic/blur-fade";

type Feature = { title: string; description: string; icon: LucideIcon };
export type Stat = { label: string; value: number; decimals?: number };

const features: Feature[] = [
  {
    title: "Verified Technicians",
    description: "Every service is reviewed and approved before it goes live.",
    icon: UserCheck,
  },
  {
    title: "Convenient Booking",
    description: "Request a visit in under a minute, at a time that suits you.",
    icon: Clock,
  },
  {
    title: "Transparent Pricing",
    description: "See the visit price upfront; pay only the confirmed final amount.",
    icon: Tag,
  },
  {
    title: "Secure Payment",
    description: "Card payments through a secure checkout, only after completion.",
    icon: ShieldCheck,
  },
];

/** Fallback data — pass your own `stats` prop to use live numbers from your API/DB. */
const defaultStats: Stat[] = [
  { label: "Approved services", value: 7, decimals: 0 },
  { label: "Verified technicians", value: 2, decimals: 0 },
  { label: "Jobs completed", value: 3, decimals: 0 },
  { label: "Average rating", value: 4.7, decimals: 1 },
];

export function WhyHomeFix({ stats = defaultStats }: { stats?: Stat[] }) {
  return (
    <section id="why-homefix" className="scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-2 sm:px-4 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        {/* Copy + features */}
        <div>
          <BlurFade inView>
            <p className="text-sm font-semibold text-sage-deep">Why HomeFix</p>
            <h2 className="mt-2 max-w-xl font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
              Built on trust, designed for convenience
            </h2>
          </BlurFade>

          <ul className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7">
            {features.map(({ title, description, icon: Icon }, i) => (
              <li key={title} className="group">
                <BlurFade inView delay={0.08 + i * 0.08} y={14} className="flex gap-4">
                  {/* Icon tile: pale sage → solid forest on hover */}
                  <span
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pale-sage text-forest shadow-[inset_0_1px_1px_rgb(255_255_255/0.9)] ring-1 ring-forest/10 transition-colors duration-300 group-hover:bg-forest group-hover:text-white group-hover:ring-forest"
                  >
                    <Icon
                      aria-hidden
                      strokeWidth={1.75}
                      className="size-6 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                    />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <h3 className="font-[family-name:var(--font-manrope)] text-base font-bold tracking-tight text-forest">
                      {title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{description}</p>
                  </div>
                </BlurFade>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats */}
        <ul className="grid grid-cols-2 gap-3 sm:gap-4">
          {stats.map(({ label, value, decimals = 0 }, i) => (
            <li key={label} className="flex">
              <BlurFade inView delay={0.1 + i * 0.08} y={16} className="flex w-full">
                <div className="glass-card relative flex w-full flex-col justify-between gap-6 rounded-3xl p-5 hover:-translate-y-1 motion-reduce:hover:translate-y-0 sm:p-6">
                  <p className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold leading-none tracking-tight text-forest sm:text-5xl">
                    <CountUp to={value} decimals={decimals} delay={0.1} inView />
                  </p>
                  <p className="text-sm text-ink-soft">{label}</p>
                </div>
              </BlurFade>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}