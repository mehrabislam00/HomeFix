import { Skeleton } from "@/components/ui/skeleton"

export default function ServiceDetailsLoading() {
  return (
    <main
      role="status"
      aria-label="Loading service details"
      className="mx-auto max-w-[1440px] px-6 py-10 sm:px-10"
    >
      <Skeleton className="h-5 w-36 rounded-lg bg-forest/10" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <Skeleton className="aspect-[16/10] rounded-[2rem] bg-forest/10" />
          <Skeleton className="mt-6 h-10 w-2/3 rounded-xl bg-forest/10" />
          <Skeleton className="mt-4 h-20 rounded-xl bg-forest/10" />
        </div>
        <Skeleton className="h-[520px] rounded-[1.75rem] bg-forest/10" />
      </div>
      <span className="sr-only">Loading service details...</span>
    </main>
  )
}
