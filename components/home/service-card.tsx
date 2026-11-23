import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, formatBDT } from "@/lib/utils"

export type FeaturedService = {
  id: string
  title: string
  description: string
  category: string
  image: StaticImageData | string
  rating: number
  reviews: number
  price: number
  technician: string
  href: string
}

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

export function ServiceCard({
  title,
  description,
  category,
  image,
  rating,
  reviews,
  price,
  technician,
  href,
}: Omit<FeaturedService, "id">) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-line-strong/60 bg-surface",
        "shadow-[0_1px_2px_rgb(38_58_50/0.06),0_10px_24px_-16px_rgb(38_58_50/0.35)]",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1.5 hover:border-sage hover:shadow-[0_2px_4px_rgb(38_58_50/0.06),0_24px_44px_-20px_rgb(38_58_50/0.5)]",
        "active:translate-y-0 active:scale-[0.98] active:shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
      )}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-card-tint">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          unoptimized={typeof image === "string"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
        <Badge
          variant="outline"
          className="absolute top-3 left-3 h-7 rounded-full border-white/70 bg-white/75 px-3 text-xs leading-none font-semibold text-forest shadow-sm backdrop-blur-md"
        >
          {category}
        </Badge>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-sm leading-none text-ink-soft">
            {reviews > 0 ? (
              <>
                <Star
                  className="size-4 fill-status-amber-fg text-status-amber-fg"
                  aria-hidden
                />
                <strong className="font-semibold text-ink">
                  {rating.toFixed(1)}
                </strong>
                <span className="text-ink-muted">({reviews})</span>
              </>
            ) : (
              <span className="text-ink-muted">No reviews yet</span>
            )}
          </span>
          <span className="leading-none">
            <strong className="font-[family-name:var(--font-manrope)] text-lg font-extrabold text-forest">
              {formatBDT(price)}
            </strong>
            <span className="ml-1 text-xs text-ink-muted">/visit</span>
          </span>
        </div>

        <h3 className="mt-3 font-[family-name:var(--font-manrope)] text-lg leading-tight font-bold tracking-tight text-forest">
          {title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink-soft">
          {description}
        </p>

        {/* Footer pinned to the bottom so cards align */}
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="flex min-w-0 items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback className="bg-pale-sage text-[10px] font-semibold text-forest">
                  {initials(technician)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm text-ink-soft">
                {technician}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
              Details
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
