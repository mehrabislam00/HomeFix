import { Skeleton } from "@/components/ui/skeleton"

export default function ProfileLoading() {
  return (
    <div
      role="status"
      aria-label="Loading profile"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-1 w-10 rounded-full bg-sage/40" />
        <Skeleton className="h-10 w-56 rounded-xl bg-forest/10" />
        <Skeleton className="h-5 w-72 max-w-full rounded-lg bg-forest/10" />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="glass-card relative flex flex-col items-center gap-4 rounded-[1.75rem] p-7">
          <Skeleton className="size-28 rounded-full bg-forest/10" />
          <Skeleton className="h-6 w-40 rounded-lg bg-forest/10" />
          <Skeleton className="h-4 w-48 rounded-lg bg-forest/10" />
          <Skeleton className="h-16 w-full rounded-2xl bg-forest/10" />
        </div>
        <div className="glass-card relative flex flex-col gap-5 rounded-[1.75rem] p-8">
          <Skeleton className="h-7 w-44 rounded-lg bg-forest/10" />
          <Skeleton className="h-20 w-full rounded-2xl bg-forest/10" />
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-12 rounded-xl bg-forest/10" />
            <Skeleton className="h-12 rounded-xl bg-forest/10" />
            <Skeleton className="h-12 rounded-xl bg-forest/10" />
            <Skeleton className="h-12 rounded-xl bg-forest/10" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading your profile...</span>
    </div>
  )
}