import Link from "next/link";
import {
  AirVent,
  ArrowRight,
  ArrowUpRight,
  Droplets,
  Hammer,
  MonitorSmartphone,
  Paintbrush,
  Refrigerator,
  Sparkles,
  Thermometer,
  WashingMachine,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { BlurFade } from "@/components/magic/blur-fade";
import { SectionShell } from "@/components/section-shell";
import { Button } from "@/components/ui/button";
import { btn } from "@/lib/button-styles";
import { cn } from "@/lib/utils";

export type Category = {
  name: string;
  description: string;
  href: string;
  /** Optional: force a specific Lucide icon. Otherwise it is picked from the name. */
  icon?: LucideIcon;
};

/**
 * Icon is chosen from the category name, so dynamic data (from your API/DB)
 * gets a sensible icon without hardcoding categories here.
 * All icons are Lucide → one consistent stroke style.
 */
const iconRules: [RegExp, LucideIcon][] = [
  [/\b(ac|a\/c|air)\b|conditioner/i, AirVent],
  [/fridge|refrigerat/i, Refrigerator],
  [/wash|laundry/i, WashingMachine],
  [/electric|wiring/i, Zap],
  [/plumb|pipe|leak/i, Droplets],
  [/device|laptop|phone|mobile|computer/i, MonitorSmartphone],
  [/clean/i, Sparkles],
  [/paint/i, Paintbrush],
  [/carpent|wood/i, Hammer],
  [/hvac|heat|cool/i, Thermometer],
];

export function getCategoryIcon(name: string): LucideIcon {
  return iconRules.find(([rule]) => rule.test(name))?.[1] ?? Wrench;
}

/** Fallback data — pass your own `categories` prop to use your dynamic data. */
const defaultCategories: Category[] = [
  { name: "AC Repair", description: "Servicing, gas refill & installation", href: "/services?category=ac" },
  { name: "Refrigerator", description: "Compressor, cooling & single-door fixes", href: "/services?category=fridge" },
  { name: "Washing Machine", description: "Drum, motor & drainage repairs", href: "/services?category=washer" },
  { name: "Electrical", description: "Wiring, outlets & fittings", href: "/services?category=electrical" },
  { name: "Plumbing", description: "Leaks, pipes & fixtures", href: "/services?category=plumbing" },
  { name: "Device Repair", description: "Laptops, phones & smart devices", href: "/services?category=devices" },
];

export function PopularCategories({
  categories = defaultCategories,
}: {
  categories?: Category[];
}) {
  return (
    <SectionShell
      id="services"
      title="Popular services"
      description="Pick a category and book a verified technician."
      action={
        <Button className={cn(btn.md, btn.outline, "bg-surface hover:bg-field")} asChild>
          <Link href="/services">
            View all
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </Button>
      }
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
        {categories.map(({ name, description, href, icon }, i) => {
          const Icon = icon ?? getCategoryIcon(name);
          return (
            <li key={name} className="flex">
              <BlurFade inView delay={i * 0.06} y={16} className="flex w-full">
                <Link
                  href={href}
                  className={cn(
                    "group relative flex w-full flex-col rounded-3xl border border-line-strong/60 bg-surface p-4 sm:p-5",
                    "shadow-[0_1px_2px_rgb(38_58_50/0.06),0_10px_24px_-16px_rgb(38_58_50/0.35)]",
                    "transition-all duration-300 ease-out",
                    "hover:-translate-y-1.5 hover:border-sage hover:shadow-[0_2px_4px_rgb(38_58_50/0.06),0_24px_44px_-20px_rgb(38_58_50/0.5)]",
                    "active:translate-y-0 active:scale-[0.98] active:shadow-sm",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
                    "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100"
                  )}
                >
                  {/* Icon tile: pale sage at rest → solid forest on hover */}
                  <span
                    className={cn(
                      "flex size-14 items-center justify-center rounded-2xl bg-pale-sage text-forest",
                      "shadow-[inset_0_1px_1px_rgb(255_255_255/0.9)] ring-1 ring-forest/10",
                      "transition-colors duration-300",
                      "group-hover:bg-forest group-hover:text-white group-hover:ring-forest"
                    )}
                  >
                    <Icon
                      aria-hidden
                      strokeWidth={1.75}
                      className={cn(
                        "size-7 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                        "group-hover:-rotate-6 group-hover:scale-110",
                        "motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                      )}
                    />
                  </span>

                  <h3 className="mt-5 font-[family-name:var(--font-manrope)] text-lg font-bold leading-tight tracking-tight text-forest">
                    {name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-ink-soft">{description}</p>

                  {/* Footer: clear call to action, pinned to the bottom so all cards align */}
                  <span className="mt-auto block pt-5"><span className="flex items-center justify-between border-t border-line pt-4">
                    <span className="text-sm font-semibold text-forest">Book now</span>
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full bg-field text-forest",
                        "transition-colors duration-300 group-hover:bg-forest group-hover:text-white"
                      )}
                    >
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      />
                    </span>
                  </span></span>
                </Link>
              </BlurFade>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}