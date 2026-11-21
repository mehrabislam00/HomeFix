import {
  CalendarCheck,
  CircleCheck,
  HeartHandshake,
  Briefcase,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"

type Benefit = { title: string; description: string; icon: LucideIcon }
type Audience = { title: string; icon: LucideIcon; benefits: Benefit[] }

const audiences: Audience[] = [
  {
    title: "For customers",
    icon: HeartHandshake,
    benefits: [
      {
        title: "Approved listings",
        description:
          "Every service is reviewed by our admin team before it's bookable.",
        icon: CircleCheck,
      },
      {
        title: "Simple booking",
        description:
          "Request a visit, track its status and get notified at every step.",
        icon: CalendarCheck,
      },
      {
        title: "Pay after the job",
        description:
          "Pay the confirmed final amount only once the work is complete.",
        icon: Wallet,
      },
    ],
  },
  {
    title: "For technicians",
    icon: Briefcase,
    benefits: [
      {
        title: "List your services",
        description:
          "Create listings with your own pricing, photos and availability.",
        icon: Briefcase,
      },
      {
        title: "Reach customers",
        description: "Receive booking requests from homeowners near you.",
        icon: Users,
      },
      {
        title: "Manage your jobs",
        description:
          "Accept, start and complete jobs from one clear dashboard.",
        icon: TrendingUp,
      },
    ],
  },
]

export function AudiencePanels() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-6 sm:px-10 sm:py-10">
      <ul className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {audiences.map(({ title, icon: Icon, benefits }, i) => (
          <li key={title} className="flex">
            <BlurFade inView delay={i * 0.1} y={16} className="flex w-full">
              <div className="w-full rounded-[2rem] border border-line-strong/50 bg-pale-sage p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.8)] sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-forest text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_8px_18px_-8px_rgb(38_58_50/0.55)]">
                    <Icon aria-hidden strokeWidth={1.75} className="size-6" />
                  </span>
                  <h2 className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-tight text-forest">
                    {title}
                  </h2>
                </div>

                <ul className="mt-6 flex flex-col gap-4">
                  {benefits.map(
                    ({ title: bTitle, description, icon: BIcon }) => (
                      <li key={bTitle} className="group flex items-start gap-4">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-forest shadow-[0_1px_2px_rgb(38_58_50/0.08)] ring-1 ring-forest/10 transition-colors duration-300 group-hover:bg-forest group-hover:text-white group-hover:ring-forest">
                          <BIcon
                            aria-hidden
                            strokeWidth={1.75}
                            className="size-5"
                          />
                        </span>
                        <div className="min-w-0 pt-0.5">
                          <h3 className="font-[family-name:var(--font-manrope)] text-base font-bold tracking-tight text-forest">
                            {bTitle}
                          </h3>
                          <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                            {description}
                          </p>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </BlurFade>
          </li>
        ))}
      </ul>
    </section>
  )
}