import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * SectionShell — a clearly bounded container for a page section
 * (use it for "Home Services", and any other mid-page block).
 *
 *   page ivory ─ outer breathing room
 *   └─ white panel, strong border, lifted shadow   ← the visible boundary
 *      ├─ header: title (Manrope) + description (+ optional action on the right)
 *      ├─ hairline divider
 *      └─ content on a soft sage well
 *
 * Usage:
 *   <SectionShell id="services" title="Home Services"
 *     description="Pick a category and book a verified technician."
 *     action={<Button asChild><Link href="/services">View all</Link></Button>}>
 *     ...your existing cards / grid...
 *   </SectionShell>
 */
export function SectionShell({
  id,
  title,
  description,
  action,
  children,
  className,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className="scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
      <div
        className={cn(
          "mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-line-strong/70 bg-surface",
          "shadow-[0_1px_0_rgb(255_255_255),0_30px_70px_-36px_rgb(38_58_50/0.35)]",
          className
        )}
      >
        {/* Header */}
        <div className="flex flex-col gap-5 px-6 pb-7 pt-9 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:pt-11">
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
              {title}
            </h2>
            {description && (
              <p className="mt-3 text-base leading-relaxed text-ink-soft sm:text-lg">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        <div className="mx-6 h-px bg-line sm:mx-10" aria-hidden />

        {/* Content well */}
        <div className="p-4 sm:p-6">
          <div className="rounded-3xl bg-pale-sage/70 p-4 ring-1 ring-forest/5 sm:p-6">{children}</div>
        </div>
      </div>
    </section>
  );
}