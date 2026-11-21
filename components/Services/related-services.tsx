import { BlurFade } from "@/components/magic/blur-fade"
import {
  ServiceCard,
  type FeaturedService,
} from "@/components/home/service-card"

export function RelatedServices({ services }: { services: FeaturedService[] }) {
  if (services.length === 0) return null
  return (
    <section className="mt-16 sm:mt-20" aria-labelledby="related-heading">
      <BlurFade inView>
        <h2
          id="related-heading"
          className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold tracking-tight text-forest sm:text-3xl"
        >
          Related services
        </h2>
      </BlurFade>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {services.map(({ id, ...service }, i) => (
          <li key={id} className="flex">
            <BlurFade
              inView
              fade={false}
              delay={i * 0.08}
              y={16}
              className="flex w-full"
            >
              <ServiceCard {...service} />
            </BlurFade>
          </li>
        ))}
      </ul>
    </section>
  )
}