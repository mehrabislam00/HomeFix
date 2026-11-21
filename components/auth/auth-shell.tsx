import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { AdminBackdrop, AdminPanel } from "@/components/auth/admin-panel";
import { PublicPanel } from "@/components/auth/public-panel";
import { BlurFade } from "@/components/magic/blur-fade";
import { cn } from "@/lib/utils";
import logo from "@/assets/Logo.png";

/**
 * AuthShell — split layout for every auth page (no Navbar / Footer).
 *  - left (lg+): welcome banner — `photo` (PublicPanel) or `admin` (AdminPanel)
 *  - right: logo, heading and the form on a frosted glass card
 *  - below lg: admin gets a compact forest banner so it keeps its identity
 */
export function AuthShell({
  variant = "photo",
  title,
  description,
  children,
  footer,
}: {
  variant?: "photo" | "admin";
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const isAdmin = variant === "admin";

  return (
    <main className="relative isolate grid min-h-screen overflow-x-clip bg-ivory lg:grid-cols-2">
      {isAdmin ? <AdminPanel /> : <PublicPanel />}

      {/* Compact admin banner for tablet / mobile */}
      {isAdmin && (
        <div className="relative overflow-hidden bg-forest lg:hidden">
          <AdminBackdrop />
          <div className="relative flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
            <Image src={logo} alt="HomeFix" priority className="h-12 w-auto object-contain brightness-0 invert" />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold leading-none text-white backdrop-blur-md">
              <ShieldCheck aria-hidden className="size-3.5" />
              Admin portal
            </span>
          </div>
        </div>
      )}

      <section className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-24 -top-20 size-[420px] rounded-full bg-sage/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 size-[360px] rounded-full bg-muted-sage/20 blur-3xl" />
        </div>

        <div className="w-full max-w-[460px]">
          {/* Public pages: logo above the heading. Admin: the logo lives in the banner. */}
          {!isAdmin && (
            <BlurFade>
              <Link
                href="/"
                aria-label="HomeFix home"
                className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                <Image src={logo} alt="HomeFix" priority className="h-16 w-auto object-contain" />
              </Link>
            </BlurFade>
          )}

          <BlurFade delay={0.08} className={cn(isAdmin ? "" : "mt-2")}>
            <h1 className="font-[family-name:var(--font-manrope)] text-3xl font-extrabold tracking-tight text-forest sm:text-4xl">
              {title}
            </h1>
            {description && <p className="mt-2 text-base text-ink-soft">{description}</p>}
          </BlurFade>

          <BlurFade fade={false} delay={0.16} className="mt-7">
            <div
              className={cn(
                "glass-card relative rounded-[1.75rem] p-5 sm:p-7",
                isAdmin && "border-t-2 border-t-forest/80"
              )}
            >
              {children}
            </div>
          </BlurFade>

          {footer && (
            <BlurFade delay={0.24} className="mt-6 text-center text-sm text-ink-soft">
              {footer}
            </BlurFade>
          )}
        </div>
      </section>
    </main>
  );
}