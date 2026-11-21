import Image from "next/image";
import Link from "next/link";
import { Lock, ShieldCheck, Star, Wrench, type LucideIcon } from "lucide-react";

import { GlassChip } from "@/components/auth/glass-chip";
import { BlurFade } from "@/components/magic/blur-fade";
import logo from "@/assets/Logo.png";
import heroImg from "@/assets/cat-ac.jpg";

const highlights: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: "Admin-approved technicians" },
  { icon: Wrench, label: "Track every repair step by step" },
  { icon: Lock, label: "Pay securely after completion" },
];

/** Welcome banner for Sign In / Create Account: photo, forest wash, floating glass cards. */
export function PublicPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-forest lg:block">
      <Image src={heroImg} alt="" fill priority placeholder="blur" sizes="50vw" className="object-cover" />

      {/* Layered washes: forest tint, bottom scrim, sage light-pools, fine grid */}
      <div aria-hidden className="absolute inset-0 bg-forest/45" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/10 to-forest/40" />
      <div aria-hidden className="absolute -left-20 top-1/3 size-[360px] rounded-full bg-sage/30 blur-3xl" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_55%)]"
      />

      <div className="relative flex h-full flex-col p-10 xl:p-14">
        {/* Brand */}
        <BlurFade>
          <Link
            href="/"
            aria-label="HomeFix home"
            className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            <Image src={logo} alt="HomeFix" className="h-16 w-auto object-contain brightness-0 invert" />
          </Link>
        </BlurFade>

        {/* Floating glass cards */}
        <div className="relative mt-10 flex-1">
          <BlurFade fade={false} delay={0.4} y={16} className="absolute right-0 top-4">
            <div className="animate-float">
              <GlassChip className="flex items-center gap-3 px-4 py-3">
                <span className="relative flex size-10 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-forest">
                  RI
                  <span className="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-forest bg-status-success-fg" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">Technician on the way</p>
                  <p className="mt-1 text-xs text-white/75">AC repair · arriving soon</p>
                </div>
              </GlassChip>
            </div>
          </BlurFade>

          <BlurFade fade={false} delay={0.6} y={16} className="absolute left-0 top-32">
            <div className="animate-float-delayed">
              <GlassChip className="flex items-center gap-2.5 px-4 py-3">
                <Star aria-hidden className="size-5 fill-status-amber-fg text-status-amber-fg" />
                <p className="text-sm leading-none">
                  <strong className="text-base font-bold">4.7</strong>
                  <span className="ml-1.5 text-white/75">average rating</span>
                </p>
              </GlassChip>
            </div>
          </BlurFade>
        </div>

        {/* Headline + pills */}
        <BlurFade delay={0.15} blur={6}>
          <h2 className="max-w-md font-[family-name:var(--font-manrope)] text-4xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-5xl">
            Your Home, Our Responsibility.
          </h2>
        </BlurFade>
        <ul className="mt-6 flex flex-col items-start gap-2.5">
          {highlights.map(({ icon: Icon, label }, i) => (
            <li key={label}>
              <BlurFade fade={false} delay={0.3 + i * 0.1} y={10}>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3.5 py-2 text-sm font-medium leading-none text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] backdrop-blur-md">
                  <Icon aria-hidden className="size-4 text-white/80" />
                  {label}
                </span>
              </BlurFade>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}