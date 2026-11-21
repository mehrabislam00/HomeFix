import { Star } from "lucide-react";

import { BlurFade } from "@/components/magic/blur-fade";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type Testimonial = {
  quote: string;
  name: string;
  location: string;
  service: string;
  rating?: number;
};

/** Fallback data — pass your own `testimonials` prop to use your dynamic data. */
const defaultTestimonials: Testimonial[] = [
  {
    quote:
      "Our Sub-Zero refrigerator started leaking right before an important dinner party. Rafiqul arrived within 40 minutes, diagnosed a faulty solenoid valve, and had genuine parts in his van. Exceptional craftsmanship.",
    name: "Miranda Campbell",
    location: "Upper West Side, NY",
    service: "Sub-Zero Repair",
  },
  {
    quote:
      "The upfront cost estimate was down to the dollar accurate. No surprise upcharges, clean drop cloths on our hardwood floors, and a digital warranty emailed before the technician even drove off.",
    name: "David Thorne",
    location: "SoHo Loft, NY",
    service: "HVAC System Service",
  },
  {
    quote:
      "Saved my M2 Max MacBook Pro after a water spill that three big-box shops told me was unfixable. Julian swapped two micro capacitors on the board and saved all my architectural project files.",
    name: "Amara Lin",
    location: "Brooklyn Heights, NY",
    service: "Logic Board Repair",
  },
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function Testimonials({
  testimonials = defaultTestimonials,
}: {
  testimonials?: Testimonial[];
}) {
  return (
    <section id="testimonials" className="relative scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
      {/* Soft sage light-pools so the frosted cards have something to blur.
          Not clipped vertically (-bottom-32 + -z-10) so the glow fades out under the next section
          instead of ending in a hard edge; overflow-x-clip prevents horizontal scroll. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-32 top-0 -z-10 overflow-x-clip">
        <div className="absolute -right-24 top-1/4 size-[400px] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute -left-20 bottom-0 size-[360px] rounded-full bg-muted-sage/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-2 sm:px-4">
        <BlurFade inView className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-sage-deep">Customer testimonials</p>
          <h2 className="mt-2 font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
            Quiet certainty for discerning homes
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-soft sm:text-lg">
            Over 14,000 households rely on HomeFix stewardship for their most demanding residential
            appliances.
          </p>
        </BlurFade>

        <ul className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {testimonials.map(({ quote, name, location, service, rating = 5 }, i) => (
            <li key={name} className={i === 2 ? "flex md:col-span-2 lg:col-span-1" : "flex"}>
              <BlurFade inView delay={i * 0.1} y={16} className="flex w-full">
                <figure className="glass-card relative flex w-full flex-col rounded-[1.75rem] p-2.5 hover:-translate-y-1 motion-reduce:hover:translate-y-0">
                  <div className="flex flex-1 flex-col px-4 pb-5 pt-5 sm:px-5">
                    <div
                      role="img"
                      aria-label={`${rating} out of 5 stars`}
                      className="flex gap-0.5"
                    >
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          aria-hidden
                          className={
                            s < rating
                              ? "size-4 fill-status-amber-fg text-status-amber-fg"
                              : "size-4 text-line-strong"
                          }
                        />
                      ))}
                    </div>
                    <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-ink">
                      “{quote}”
                    </blockquote>
                  </div>

                  <figcaption className="flex items-center gap-3 rounded-3xl bg-pale-sage/70 px-4 py-3.5 ring-1 ring-forest/5">
                    <Avatar size="lg">
                      <AvatarFallback className="bg-surface text-xs font-semibold text-forest">
                        {initials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate font-[family-name:var(--font-manrope)] text-sm font-bold text-forest">
                        {name}
                      </p>
                      <p className="mt-1 truncate text-xs text-ink-soft">
                        {location} · {service}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </BlurFade>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}