import { Skeleton } from "@/components/ui/skeleton"

export default function BookingsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading bookings"
      className="flex flex-col gap-6"
    >
      <Skeleton className="h-10 w-64 rounded-xl bg-forest/10" />
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-28 rounded-3xl bg-forest/10" />
      ))}
      <span className="sr-only">Loading your bookings...</span>
    </div>
  )
}
