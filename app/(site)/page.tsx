// app/page.tsx

import { Hero } from "@/components/Hero/hero"
import { CtaBanner } from "@/components/home/cta-banner"
import { HowItWorks } from "@/components/home/how-it-works"
import { PopularCategories } from "@/components/home/popular-categories"
import { Testimonials } from "@/components/home/testimonials"
import { TopRatedServices } from "@/components/home/top-rated-services"
import { WhyHomeFix } from "@/components/home/why-homefix"
import { PageBackdrop } from "@/components/PageBackdrop/page-backdrop"
import { getAvailableServices } from "@/lib/Action/service-actions"
import type { ServiceListing } from "@/lib/service-booking-data"
import { serviceCategories } from "@/lib/services-data"

export const dynamic = "force-dynamic"

const Home = async () => {
  let services: ServiceListing[] = []
  let serviceError = ""
  try {
    services = await getAvailableServices()
  } catch (error) {
    console.error("Unable to load home page services.", error)
    serviceError =
      error instanceof Error
        ? error.message
        : "Unable to load services. Please try again."
  }
  const categories = [
    ...new Map(
      services.map((service) => {
        const category = serviceCategories.find(
          (item) => item.label.toLowerCase() === service.category.toLowerCase()
        )
        return [
          service.category,
          {
            name: service.category,
            description: service.description,
            href: category
              ? `/services?category=${category.slug}`
              : `/services?q=${encodeURIComponent(service.category)}`,
          },
        ]
      })
    ).values(),
  ]
  const featured = [...services]
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 6)

  return (
    <main className="relative isolate min-h-screen overflow-x-clip bg-ivory">
      <PageBackdrop />
      <Hero />
      <PopularCategories categories={categories} />
      <TopRatedServices services={featured} error={serviceError} />
      <HowItWorks />
      <Testimonials />
      <WhyHomeFix />
      <CtaBanner />
    </main>
  )
}

export default Home
