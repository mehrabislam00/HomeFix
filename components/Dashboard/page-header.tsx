import { BlurFade } from "@/components/magic/blur-fade"

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <BlurFade className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <span
          aria-hidden
          className="mb-3 block h-1 w-10 rounded-full bg-sage"
        />
        <h1 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-base text-ink-soft">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </BlurFade>
  )
}