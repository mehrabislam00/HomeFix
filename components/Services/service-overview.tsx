import Image from "next/image"
import {
  CircleCheck,
  Clock,
  ShieldCheck,
  Star,
  type LucideIcon,
} from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"

import { Badge } from "@/components/ui/badge"
import type { FeaturedService } from "@/components/home/service-card"
import { TechnicianCard } from "./technician-card"

type Props = Omit<FeaturedService, "id" | "href" | "price"> & {
  availability: string
  available: boolean
  technicianArea: string
  /** From the technician profile; Contact is hidden when missing. */
  technicianPhone?: string
}

export function ServiceOverview({
  title,
  description,
  category,
  image,
  rating,
  reviews,
  technician,
  availability,
  available,
  technicianArea,
  technicianPhone,
}: Props) {
  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Clock, label: "Availability", value: availability },
    { icon: ShieldCheck, label: "Verified", value: "Admin approved" },
    { icon: CircleCheck, label: "Payment", value: "After completion" },
  ]

  return (
    <div>
      <BlurFade y={16}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-card-tint shadow-[0_30px_60px_-34px_rgb(38_58_50/0.4)] ring-1 ring-forest/10">
          <Image
            src={image}
            alt={title}
            fill
            priority
            unoptimized={typeof image === "string"}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
          />
        </div>
      </BlurFade>

      <BlurFade delay={0.08} className="mt-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Badge
            variant="outline"
            className="h-7 rounded-full border-line-strong/60 bg-pale-sage px-3 text-xs leading-none font-semibold text-forest"
          >
            {category}
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-sm leading-none text-ink-soft">
            {reviews > 0 ? (
              <>
                <Star
                  aria-hidden
                  className="size-4 fill-status-amber-fg text-status-amber-fg"
                />
                <strong className="font-semibold text-ink">
                  {rating.toFixed(1)}
                </strong>
                <span>({reviews} reviews)</span>
              </>
            ) : (
              <span>No reviews yet</span>
            )}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-sm leading-none font-semibold ${available ? "text-status-success-fg" : "text-status-cancelled-fg"}`}
          >
            <span
              aria-hidden
              className={`size-2 rounded-full ${available ? "bg-status-success-fg" : "bg-status-cancelled-fg"}`}
            />
            {available ? "Available" : "Not currently available"}
          </span>
        </div>

        <h1 className="mt-4 font-[family-name:var(--font-manrope)] text-4xl leading-[1.1] font-extrabold tracking-tight text-forest sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
          {description}
        </p>
      </BlurFade>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {facts.map(({ icon: Icon, label, value }, i) => (
          <li key={label} className="flex">
            <BlurFade
              fade={false}
              delay={0.1 + i * 0.07}
              y={12}
              className="flex w-full"
            >
              <div className="glass-card group relative flex w-full items-start gap-3 rounded-3xl p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pale-sage text-forest ring-1 ring-forest/10 transition-colors duration-300 group-hover:bg-forest group-hover:text-white group-hover:ring-forest">
                  <Icon aria-hidden strokeWidth={1.75} className="size-5" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs text-ink-soft">{label}</p>
                  <p className="mt-1 text-sm font-bold text-forest">{value}</p>
                </div>
              </div>
            </BlurFade>
          </li>
        ))}
      </ul>

      <BlurFade fade={false} delay={0.3} y={12} className="mt-3">
        <TechnicianCard
          name={technician}
          area={technicianArea}
          phone={technicianPhone}
        />
      </BlurFade>
    </div>
  )
}
