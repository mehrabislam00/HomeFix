import { Skeleton } from "@/components/ui/skeleton"

export default function ServicesLoading() {
  return (
    <main
      role="status"
      aria-label="Loading services"
      className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10"
    >
      <Skeleton className="h-10 w-72 rounded-xl bg-forest/10" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl rounded-lg bg-forest/10" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-80 rounded-3xl bg-forest/10" />
        ))}
      </div>
      <span className="sr-only">Loading available services...</span>
    </main>
  )
}
