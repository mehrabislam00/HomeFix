"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { LiquidGlass } from "@/components/liquid-glass";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { btn } from "@/lib/button-styles";
import { cn } from "@/lib/utils";
import logo from "@/assets/Logo.png";

const links = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Fixed to the viewport — always visible, glass stays live while scrolling */}
      <header className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6">
        <LiquidGlass
          data-scrolled={scrolled}
          radius={28}
          className="liquid-glass relative mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-3 sm:h-20 sm:px-6"
        >
          <nav className="contents" aria-label="Main">
            {/* Logo only */}
            <Link href="/" aria-label="HomeFix home" className="flex shrink-0 items-center">
              <Image
                src={logo}
                alt="HomeFix"
                priority
                className="h-12 w-auto object-contain sm:h-16"
              />
            </Link>

            {/* Center links — inner glass track */}
            <ul className="hidden items-center gap-1 rounded-full border border-white/60 bg-white/40 p-1 shadow-[inset_0_1px_1px_rgb(255_255_255/0.9),inset_0_-1px_1px_rgb(38_58_50/0.06)] md:flex">
              {links.map(({ label, href }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex h-10 items-center rounded-full px-5 text-sm font-medium leading-none transition-all duration-200",
                        active
                          ? "bg-forest text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_6px_14px_-6px_rgb(38_58_50/0.6)]"
                          : "text-ink-soft hover:bg-white/70 hover:text-forest"
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Button
                variant="ghost"
                className={cn(btn.md, btn.ghost, "hidden hover:bg-white/60 hover:text-forest sm:inline-flex")}
                asChild
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button className={cn(btn.md, btn.primary)} asChild>
                <Link href="/get-started">Get Started</Link>
              </Button>

              {/* Mobile menu */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      aria-label="Open menu"
                      className="size-10 rounded-xl border border-white/60 bg-white/40 p-0 text-forest hover:bg-white/70 md:hidden"
                    >
                      <Menu className="size-5" />
                    </Button>
                  }
                />
                <SheetContent side="right" className="w-[min(86vw,22rem)] gap-0 border-line bg-ivory p-0">
                  <SheetHeader className="border-b border-line p-5">
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <Image src={logo} alt="HomeFix" className="h-12 w-auto self-start object-contain" />
                  </SheetHeader>
                  <ul className="flex flex-col gap-1 p-3">
                    {links.map(({ label, href }) => {
                      const active = pathname === href;
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex h-12 items-center rounded-xl px-4 text-base font-medium transition-colors",
                              active ? "bg-forest text-white" : "text-ink hover:bg-field"
                            )}
                          >
                            {label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-auto flex flex-col gap-2 border-t border-line p-5">
                    <Button className={cn(btn.lg, btn.outline, "bg-surface hover:bg-field")} asChild>
                      <Link href="/sign-in" onClick={() => setOpen(false)}>Sign In</Link>
                    </Button>
                    <Button className={cn(btn.lg, btn.primary)} asChild>
                      <Link href="/get-started" onClick={() => setOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </nav>
        </LiquidGlass>
      </header>

      {/* Spacer: the bar is out of the flow now, so reserve its height — no content hides underneath */}
      <div aria-hidden className="h-[72px] sm:h-20" />
    </>
  );
}