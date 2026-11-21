import type { Metadata } from "next";

import { BlurFade } from "@/components/magic/blur-fade";

import { allServices, serviceCategories } from "@/lib/services-data";
import { ServicesBrowser } from "@/components/Services/services-browser";

export const metadata: Metadata = {
  title: "Services — HomeFix",
  description: "Browse approved home repair services and book a verified technician.",
};

type SearchParams = Promise<{ q?: string | string[]; category?: string | string[] }>;

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

const Services = async ({ searchParams }: { searchParams: SearchParams }) => {
  const params = await searchParams;
  const q = first(params.q);
  const requested = first(params.category);
  const category = serviceCategories.some((c) => c.slug === requested) ? requested : "all";

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-ivory">
      {/* Soft sage light-pools, same as the rest of the site */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[700px] overflow-hidden">
        <div className="absolute -left-28 top-24 size-[420px] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute -right-24 top-0 size-[460px] rounded-full bg-muted-sage/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1440px] px-6 pb-20 pt-10 sm:px-10 sm:pt-14">
        <BlurFade>
          <p className="text-sm font-semibold text-sage-deep">Services</p>
          <h1 className="mt-2 font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight text-forest sm:text-5xl">
            Find the right technician
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-soft sm:text-lg">
            Every listing below is reviewed and approved by the HomeFix team.
          </p>
        </BlurFade>

        <div className="mt-8">
          {/* key: re-seed the filters when the URL (hero search, nav links) changes */}
          <ServicesBrowser
            key={`${q}|${category}`}
            services={allServices}
            initialQuery={q}
            initialCategory={category}
          />
        </div>
      </div>
    </main>
  );
};

export default Services;