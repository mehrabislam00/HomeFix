import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import logo from "@/assets/Logo.png";

type FooterLink = { label: string; href: string };

const explore: FooterLink[] = [
  { label: "All Services", href: "/services" },
  { label: "About HomeFix", href: "/about" },
  { label: "Become a Technician", href: "/become-a-technician" },
  { label: "Sign In", href: "/login" },
];

/** Same category hrefs as PopularCategories / HeroVisual. */
const categories: FooterLink[] = [
  { label: "AC Repair", href: "/services?category=ac" },
  { label: "Refrigerator", href: "/services?category=fridge" },
  { label: "Washing Machine", href: "/services?category=washer" },
  { label: "Electrical", href: "/services?category=electrical" },
  { label: "Plumbing", href: "/services?category=plumbing" },
  { label: "Device Repair", href: "/services?category=devices" },
];

const contact: { icon: LucideIcon; label: string; href?: string }[] = [
  { icon: Mail, label: "support@homefix.com", href: "mailto:support@homefix.com" },
  { icon: Phone, label: "+880 1700 000000", href: "tel:+8801700000000" },
  { icon: MapPin, label: "Dhaka, Bangladesh" },
];

const linkClass = cn(
  "inline-block rounded text-sm text-white/70 transition-all duration-200",
  "hover:translate-x-0.5 hover:text-white",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage",
  "motion-reduce:transition-none motion-reduce:hover:translate-x-0"
);

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="font-[family-name:var(--font-manrope)] text-sm font-bold tracking-tight text-white">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link href={href} className={linkClass}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-forest text-white">
      {/* Sage light-pool, same language as the CTA banner */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-32 size-[380px] rounded-full bg-sage/15 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-10 px-6 py-14 sm:grid-cols-2 sm:px-10 lg:grid-cols-4 lg:gap-8">
        {/* Brand */}
        <div className="max-w-xs">
          {/* brightness-0 + invert turns the logo into a white mark so the dark "Home" wordmark reads on forest */}
          <Link
            href="/"
            aria-label="HomeFix home"
            className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            <Image
              src={logo}
              alt="HomeFix"
              className="h-16 w-auto object-contain brightness-0 invert transition-opacity duration-200 hover:opacity-80 motion-reduce:transition-none"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Your Home, Our Responsibility. Verified technicians for every repair, booked in minutes.
          </p>
        </div>

        <LinkColumn title="Explore" links={explore} />
        <LinkColumn title="Categories" links={categories} />

        {/* Contact */}
        <div>
          <h3 className="font-[family-name:var(--font-manrope)] text-sm font-bold tracking-tight text-white">
            Contact
          </h3>
          <ul className="mt-4 flex flex-col gap-3">
            {contact.map(({ icon: Icon, label, href }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm text-white/70">
                <Icon aria-hidden className="size-4 shrink-0 text-sage" />
                {href ? (
                  <a href={href} className="transition-colors duration-200 hover:text-white motion-reduce:transition-none">
                    {label}
                  </a>
                ) : (
                  <span>{label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-white/60 sm:flex-row sm:px-10">
          <p>Â© {new Date().getFullYear()} HomeFix. All rights reserved.</p>
          <p>Your Home, Our Responsibility.</p>
        </div>
      </div>
    </footer>
  );
}
