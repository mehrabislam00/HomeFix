import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { ApiError } from "@/components/Dashboard/api-error"
import { BookingCard } from "@/components/Services/booking-card"
import { RelatedServices } from "@/components/Services/related-services"
import { ServiceOverview } from "@/components/Services/service-overview"
import type { FeaturedService } from "@/components/home/service-card"
import type { ServiceListing } from "@/lib/service-booking-data"
import { ServiceBookingApiError } from "@/lib/service-booking-api"
import {
  getAvailableServices,
  getServiceById,
} from "@/lib/Action/service-actions"
import { createCustomerBooking } from "@/lib/Action/booking-actions"

type Params = Promise<{ id: string }>

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  try {
    const service = await getServiceById((await params).id)
    return {
      title: `${service.title} — HomeFix`,
      description: service.description,
    }
  } catch {
    return { title: "Service — HomeFix" }
  }
}

const Details = async ({ params }: { params: Params }) => {
  const { id } = await params
  let service: ServiceListing
  try {
    service = await getServiceById(id)
  } catch (error) {
    if (error instanceof ServiceBookingApiError && error.status === 404) {
      notFound()
    }
    console.error("Unable to load service details.", error)
    return (
      <main className="mx-auto max-w-[1440px] px-6 py-10 sm:px-10">
        <ApiError
          message={
            error instanceof Error
              ? error.message
              : "Please try again in a moment."
          }
        />
      </main>
    )
  }

  let related: FeaturedService[] = []
  let relatedError = ""
  try {
    related = (await getAvailableServices(service.category))
      .filter((item) => item.id !== service.id)
      .slice(0, 3)
  } catch (error) {
    console.error("Unable to load related services.", error)
    relatedError =
      error instanceof Error
        ? error.message
        : "Unable to load related services."
  }

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-ivory">
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
            {service.available ? (
              <BookingCard
                serviceId={service.id}
                price={service.price}
                onSubmit={createCustomerBooking}
              />
            ) : (
              <p
                role="status"
                className="glass-card rounded-[1.75rem] p-6 text-sm font-medium text-ink-soft"
              >
                This service is not currently accepting bookings.
              </p>
            )}
          </BlurFade>
        </div>

        <RelatedServices services={related} error={relatedError} />
      </div>
    </main>
  )
}

export default Details
