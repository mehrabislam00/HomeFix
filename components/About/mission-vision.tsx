import { Eye, Target, type LucideIcon } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"

const items: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Our mission",
    description:
      "Make home repair simple, transparent and dependable — so a broken appliance is a short inconvenience, not a stressful week.",
    icon: Target,
  },
  {
    title: "Our vision",
    description:
      "A trusted home-services network where great technicians grow their business and every household knows who to call.",
    icon: Eye,
  },
]

export function MissionVision() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 py-10 sm:px-10 sm:py-14">
      <ul className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {items.map(({ title, description, icon: Icon }, i) => (
          <li key={title} className="flex">
            <BlurFade
              inView
              fade={false}
              delay={i * 0.1}
              y={16}
              className="flex w-full"
            >
              <article className="glass-card group relative flex w-full flex-col rounded-[1.75rem] p-6 hover:-translate-y-1 motion-reduce:hover:translate-y-0 sm:p-8">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-pale-sage text-forest shadow-[inset_0_1px_1px_rgb(255_255_255/0.9)] ring-1 ring-forest/10 transition-colors duration-300 group-hover:bg-forest group-hover:text-white group-hover:ring-forest">
                  <Icon
                    aria-hidden
                    strokeWidth={1.75}
                    className="size-6 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                  />
                </span>
                <h2 className="mt-5 font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-tight text-forest">
                  {title}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-ink-soft">
                  {description}
                </p>
              </article>
            </BlurFade>
          </li>
        ))}
      </ul>
    </section>
  )
}