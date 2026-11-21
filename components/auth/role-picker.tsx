"use client";

import { User, Wrench, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RegisterValues } from "@/lib/auth-types";

type Role = RegisterValues["role"];

const roles: { value: Role; title: string; caption: string; icon: LucideIcon }[] = [
  { value: "customer", title: "Book services", caption: "Customer", icon: User },
  { value: "technician", title: "Offer services", caption: "Technician", icon: Wrench },
];

/** Public roles only — Admin is intentionally not selectable. */
export function RolePicker({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-forest">I want to</legend>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {roles.map(({ value: v, title, caption, icon: Icon }) => {
          const active = value === v;
          return (
            <label
              key={v}
              className={cn(
                "group relative flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all duration-200",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sage",
                active
                  ? "border-forest bg-pale-sage shadow-[0_8px_18px_-12px_rgb(38_58_50/0.5)]"
                  : "border-line-strong bg-surface hover:-translate-y-px hover:border-sage"
              )}
            >
              <input
                type="radio"
                name="role"
                value={v}
                checked={active}
                onChange={() => onChange(v)}
                className="sr-only"
              />
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
                  active ? "bg-forest text-white" : "bg-pale-sage text-forest"
                )}
              >
                <Icon aria-hidden className="size-4" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-sm font-semibold text-forest">{title}</span>
                <span className="mt-1 block text-xs text-ink-soft">{caption}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}