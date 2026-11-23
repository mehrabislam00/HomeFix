import { Skeleton } from "@/components/ui/skeleton"

export default function RequestsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading booking requests"
      className="flex flex-col gap-6"
    >
      <Skeleton className="h-10 w-64 rounded-xl bg-forest/10" />
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-36 rounded-3xl bg-forest/10" />
      ))}
      <span className="sr-only">Loading booking requests...</span>
    </div>
  )
}
