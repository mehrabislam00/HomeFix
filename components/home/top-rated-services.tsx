import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BlurFade } from "@/components/magic/blur-fade";
import { ServiceCard, type FeaturedService } from "@/components/home/service-card";
import { Button } from "@/components/ui/button";
import { btn } from "@/lib/button-styles";
import { cn } from "@/lib/utils";
import acImg from "@/assets/cat-ac.jpg";
import fridgeImg from "@/assets/cat-fridge.jpg";
import electricalImg from "@/assets/cat-electrical.jpg";
import devicesImg from "@/assets/cat-devices.jpg";
import washerImg from "@/assets/cat-washer.jpg";

/** Fallback data — pass your own `services` prop to use your dynamic data. */
const defaultServices: FeaturedService[] = [
  {
    id: "split-ac-deep-servicing",
    title: "Split AC Deep Servicing",
    description:
      "Complete indoor and outdoor unit cleaning, filter wash, coil jet-wash, drainage check and cooling test.",
    category: "AC Repair",
    image: acImg,
    rating: 4.9,
    reviews: 128,
    price: 45,
    technician: "Rafiqul Islam",
    href: "/services/split-ac-deep-servicing",
  },
  {
    id: "refrigerator-cooling-repair",
    title: "Refrigerator Cooling Repair",
    description:
      "Diagnosis and repair of cooling problems, thermostat replacement, defrost system fixes and more.",
    category: "Refrigerator",
    image: fridgeImg,
    rating: 4.8,
    reviews: 91,
    price: 55,
    technician: "Rafiqul Islam",
    href: "/services/refrigerator-cooling-repair",
  },
  {
    id: "home-electrical-wiring",
    title: "Home Electrical Wiring",
    description:
      "Safe installation and repair of outlets, switches, light fittings, breakers and full-room wiring checks.",
    category: "Electrical",
    image: electricalImg,
    rating: 4.8,
    reviews: 112,
    price: 35,
    technician: "Rafiqul Islam",
    href: "/services/home-electrical-wiring",
  },
  {
    id: "ac-gas-refill-leak-fix",
    title: "AC Gas Refill & Leak Fix",
    description:
      "Leak detection with pressure testing, brazing of leak points and precise refrigerant refill to manufacturer specs.",
    category: "AC Repair",
    image: acImg,
    rating: 4.7,
    reviews: 64,
    price: 70,
    technician: "Tanvir Ahmed",
    href: "/services/ac-gas-refill-leak-fix",
  },
  {
    id: "laptop-device-repair",
    title: "Laptop & Device Repair",
    description:
      "Screen, battery, keyboard and board-level repair for laptops, tablets and smartphones with genuine parts.",
    category: "Device Repair",
    image: devicesImg,
    rating: 4.7,
    reviews: 76,
    price: 50,
    technician: "Rafiqul Islam",
    href: "/services/laptop-device-repair",
  },
  {
    id: "washing-machine-repair",
    title: "Washing Machine Repair",
    description:
      "Front and top load machine repair: drum noise, drainage blockage, motor and control board issues.",
    category: "Washing Machine",
    image: washerImg,
    rating: 4.6,
    reviews: 57,
    price: 40,
    technician: "Tanvir Ahmed",
    href: "/services/washing-machine-repair",
  },
];

export function TopRatedServices({
  services = defaultServices,
}: {
  services?: FeaturedService[];
}) {
  return (
    <section id="top-rated" className="relative scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
      {/* Soft sage light-pools so the frosted cards have something to blur */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-1/3 size-[380px] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute -right-20 bottom-10 size-[420px] rounded-full bg-muted-sage/20 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-[1280px] px-2 sm:px-4">
        {/* Heading */}
        <BlurFade inView className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sage-deep">Featured</p>
            <h2 className="mt-2 font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
              Top-rated services
            </h2>
          </div>
          <Button className={cn(btn.md, btn.outline, "shrink-0 bg-surface hover:bg-field")} asChild>
            <Link href="/services">
              Browse all
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </BlurFade>

        {/* Cards */}
        <ul className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {services.map(({ id, ...service }, i) => (
            <li key={id} className="flex">
              <BlurFade inView delay={(i % 3) * 0.08} y={16} className="flex w-full">
                <ServiceCard {...service} />
              </BlurFade>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}