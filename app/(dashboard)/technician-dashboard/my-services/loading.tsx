import { Skeleton } from "@/components/ui/skeleton"

export default function MyServicesLoading() {
  return (
    <div
      role="status"
      aria-label="Loading services"
      className="flex flex-col gap-6"
    >
      <Skeleton className="h-10 w-64 rounded-xl bg-forest/10" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-96 rounded-3xl bg-forest/10" />
        ))}
      </div>
      <span className="sr-only">Loading your services...</span>
    </div>
  )
}
