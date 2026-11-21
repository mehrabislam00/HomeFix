import Image from "next/image";
import { BadgeCheck, ClipboardList, ScrollText, ShieldCheck, type LucideIcon } from "lucide-react";

import { GlassChip } from "@/components/auth/glass-chip";
import { BlurFade } from "@/components/magic/blur-fade";
import logo from "@/assets/Logo.png";

const capabilities: { icon: LucideIcon; label: string }[] = [
  { icon: BadgeCheck, label: "Technician approvals" },
  { icon: ClipboardList, label: "Bookings & payments" },
  { icon: ScrollText, label: "Audit trail" },
];

/** Decorative backdrop: dotted grid, concentric rings, slow conic sweep, sage light-pools. */
export function AdminBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-24 size-[480px] rounded-full bg-sage/25 blur-3xl" />
      <div className="absolute -bottom-32 right-0 size-[420px] rounded-full bg-muted-sage/20 blur-3xl" />
      <div className="absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.1)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />

      {/* Rings centred on the top-right corner */}
      <div className="absolute -right-40 -top-40 size-[420px] rounded-full border border-white/10" />
      <div className="absolute -right-64 -top-64 size-[680px] rounded-full border border-white/[0.07]" />
      <div className="absolute -right-[22rem] -top-[22rem] size-[940px] rounded-full border border-white/[0.05]" />

      {/* Slow conic sweep */}
      <div className="absolute -right-64 -top-64 size-[680px] animate-[spin_50s_linear_infinite] rounded-full opacity-40 [background:conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgb(120_155_134/0.5)_340deg,transparent_360deg)] motion-reduce:animate-none" />
    </div>
  );
}

/** Welcome banner for /admin/login: a distinct dark "control room" treatment. */
export function AdminPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-forest lg:block">
      <AdminBackdrop />

      <div className="relative flex h-full flex-col p-10 xl:p-14">
        <BlurFade fade={false} className="flex items-center justify-between gap-4">
          <Image src={logo} alt="HomeFix" className="h-16 w-auto object-contain brightness-0 invert" />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold leading-none text-white backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-sage" />
            Admin portal
          </span>
        </BlurFade>

        {/* Layered console preview (abstract — no live data) */}
        <div className="relative my-10 flex flex-1 items-center">
          <BlurFade fade={false} delay={0.3} y={18} className="w-full max-w-md">
            <div className="animate-float">
              <GlassChip className="p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-white/90 text-forest">
                    <ShieldCheck aria-hidden className="size-5" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold">Control center</p>
                    <p className="mt-1 text-xs text-white/70">Everything HomeFix, in one place</p>
                  </div>
                </div>

                {/* abstract bars */}
                <div aria-hidden className="mt-5 flex h-16 items-end gap-2">
                  {[40, 62, 48, 80, 58, 92, 70].map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${h}%` }}
                      className="flex-1 rounded-md bg-gradient-to-t from-sage/40 to-white/70"
                    />
                  ))}
                </div>

                <ul className="mt-5 grid gap-2">
                  {capabilities.map(({ icon: Icon, label }) => (
                    <li
                      key={label}
                      className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm"
                    >
                      <Icon aria-hidden className="size-4 text-white/80" />
                      {label}
                    </li>
                  ))}
                </ul>
              </GlassChip>
            </div>

            {/* Offset secondary card for depth */}
            <BlurFade fade={false} delay={0.55} y={14} className="relative -mt-3 ml-auto w-fit">
              <div className="animate-float-delayed">
                <GlassChip className="flex items-center gap-2.5 px-4 py-3">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-sage opacity-70 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-sage" />
                  </span>
                  <span className="text-sm font-medium leading-none">Secure, server-verified access</span>
                </GlassChip>
              </div>
            </BlurFade>
          </BlurFade>
        </div>

        <BlurFade delay={0.15} blur={6}>
          <h2 className="max-w-md font-[family-name:var(--font-manrope)] text-4xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-5xl">
            Run HomeFix with <span className="text-sage">confidence.</span>
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-white/70">
            Review technicians, oversee bookings and keep the marketplace trusted.
          </p>
        </BlurFade>
      </div>
    </aside>
  );
}