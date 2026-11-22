import { BlurFade } from "@/components/magic/blur-fade"

export const thClass =
  "px-5 py-3 text-left text-[11px] font-semibold tracking-wider whitespace-nowrap text-ink-muted uppercase"
export const tdClass = "px-5 py-4 align-middle text-sm text-ink-soft"
export const rowClass =
  "border-t border-forest/10 transition-colors duration-200 hover:bg-white/60"

/** Glass card shared by every admin table: a toolbar slot above a scrollable table. */
export function TableCard({
  toolbar,
  children,
}: {
  toolbar?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <BlurFade fade={false} delay={0.1} y={16}>
      <section className="glass-card relative overflow-hidden rounded-[1.75rem]">
        {toolbar && (
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
            {toolbar}
          </div>
        )}
        <div className="overflow-x-auto">{children}</div>
      </section>
    </BlurFade>
  )
}