import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"

import {
  allServices,
  getRelatedServices,
  getServiceById,
} from "@/lib/services-data"
import { ServiceOverview } from "@/components/Services/service-overview"
import { BookingCard } from "@/components/Services/booking-card"
import { RelatedServices } from "@/components/Services/related-services"

type Params = Promise<{ id: string }>

export function generateStaticParams() {
  return allServices.map(({ id }) => ({ id }))
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const service = getServiceById((await params).id)
  return service
    ? { title: `${service.title} — HomeFix`, description: service.description }
    : { title: "Service not found — HomeFix" }
}

const Details = async ({ params }: { params: Params }) => {
  const { id } = await params
  const service = getServiceById(id)
  if (!service) notFound()

  const related = getRelatedServices(id)

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-ivory">
      {/* Soft sage light-pools, same as the rest of the site */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[800px] overflow-hidden"
      >
        <div className="absolute top-24 -left-28 size-[420px] rounded-full bg-sage/20 blur-3xl" />
        <div className="absolute top-0 -right-24 size-[460px] rounded-full bg-muted-sage/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-[1440px] px-6 pt-8 pb-20 sm:px-10 sm:pt-10">
        <BlurFade>
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 rounded-lg text-sm font-medium text-ink-soft transition-colors hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
            />
            Back to services
          </Link>
        </BlurFade>

        <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-10">
          <ServiceOverview {...service} />

          <BlurFade
            fade={false}
            delay={0.15}
            y={16}
            className="lg:sticky lg:top-28"
          >
            <BookingCard serviceId={service.id} price={service.price} />
          </BlurFade>
        </div>

        <RelatedServices services={related} />
      </div>
    </main>
  )
}

export default Details