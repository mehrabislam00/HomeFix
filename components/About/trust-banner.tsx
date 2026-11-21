import Link from "next/link"
import { ShieldCheck } from "lucide-react"

import { BlurFade } from "@/components/magic/blur-fade"
import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import { cn } from "@/lib/utils"

export function TrustBanner() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 pt-6 pb-20 sm:px-10 sm:pt-10">
      <BlurFade inView fade={false} y={16}>
        <div className="glass-card relative flex flex-col gap-5 rounded-[1.75rem] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pale-sage text-forest shadow-[inset_0_1px_1px_rgb(255_255_255/0.9)] ring-1 ring-forest/10">
              <ShieldCheck aria-hidden strokeWidth={1.75} className="size-6" />
            </span>
            <div>
              <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
                Trust is built into every step
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
                Admin-approved services, role-based accounts and payment only
                after confirmed completion.
              </p>
            </div>
          </div>
          <Button
            className={cn(
              btn.lg,
              btn.primary,
              "shine relative shrink-0 overflow-hidden"
            )}
            asChild
          >
            <Link href="/register">Create an account</Link>
          </Button>
        </div>
      </BlurFade>
    </section>
  )
}