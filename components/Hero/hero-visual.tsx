import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";

import { BlurFade } from "@/components/magic/blur-fade";

import { cn } from "@/lib/utils";
import acImg from "@/assets/cat-ac.jpg";
import fridgeImg from "@/assets/cat-fridge.jpg";
import washerImg from "@/assets/cat-washer.jpg";
import plumbingImg from "@/assets/cat-plumbing.jpg";
import electricalImg from "@/assets/cat-electrical.jpg";
import { CountUp } from "../Count up/count-up";

type Tile = {
  label: string;
  href: string;
  src: StaticImageData;
  className: string; // grid placement
};

/** 6-col × 2-row mosaic: one tall tile + four squares */
const tiles: Tile[] = [
  { label: "Refrigerator", href: "/services?category=fridge", src: fridgeImg, className: "col-span-2 row-span-2" },
  { label: "AC repair", href: "/services?category=ac", src: acImg, className: "col-span-2" },
  { label: "Washing machine", href: "/services?category=washer", src: washerImg, className: "col-span-2" },
  { label: "Plumbing", href: "/services?category=plumbing", src: plumbingImg, className: "col-span-2" },
  { label: "Electrical", href: "/services?category=electrical", src: electricalImg, className: "col-span-2" },
];

export function HeroVisual() {
  return (
    <div className="relative">
      {/* Sage plate: holds the mosaic AND the info chips, so nothing overlaps the photos */}
      <div className="rounded-[2.5rem] border border-white/70 bg-pale-sage/80 p-3 shadow-[0_30px_60px_-30px_rgb(38_58_50/0.35)]">
        <div className="grid h-[380px] grid-cols-6 grid-rows-2 gap-3 sm:h-[460px] lg:h-[500px]">
          {tiles.map(({ label, href, src, className }, i) => (
            <BlurFade key={label} className={cn("relative", className)} delay={0.15 + i * 0.09} y={18}>
              <Link
                href={href}
                className={cn(
                  "group relative block h-full w-full overflow-hidden rounded-3xl bg-card-tint ring-1 ring-forest/10",
                  "transition-shadow duration-300 hover:shadow-[0_18px_36px_-16px_rgb(38_58_50/0.5)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                )}
              >
                <Image
                  src={src}
                  alt={label}
                  fill
                  sizes="(min-width: 1024px) 20vw, 40vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
                />
                {/* legibility scrim for the label */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest/45 to-transparent"
                />
                <span className="absolute bottom-3 left-3 inline-flex items-center rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-xs font-semibold leading-none text-forest shadow-sm backdrop-blur-md">
                  {label}
                </span>
              </Link>
            </BlurFade>
          ))}
        </div>

        {/* Info row — sits in the plate, below the photos */}
        <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr]">
          <BlurFade delay={0.65} y={10}>
            <div className="liquid-glass relative flex h-full items-center gap-2.5 rounded-2xl px-4 py-3">
              <Star className="size-5 fill-status-amber-fg text-status-amber-fg" />
              <span className="text-sm leading-none text-ink-soft">
                <strong className="text-base font-bold text-ink">
                  <CountUp to={4.7} />
                </strong>{" "}
                avg rating
              </span>
            </div>
          </BlurFade>

          <BlurFade delay={0.75} y={10}>
            <div className="liquid-glass relative flex h-full items-center gap-3 rounded-2xl px-4 py-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-status-success-bg shadow-[inset_0_1px_0_rgb(255_255_255/0.7)]">
                <ShieldCheck className="size-5 text-forest" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-forest">Fast &amp; Reliable</p>
                <p className="text-xs text-ink-soft">Approved technicians only</p>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  );
}