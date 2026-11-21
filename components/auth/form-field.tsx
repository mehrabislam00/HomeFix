"use client";

import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  icon?: LucideIcon;
  error?: string;
  /** Adds a show/hide toggle (use with type="password"). */
  revealable?: boolean;
  hint?: ReactNode;
};

/** Label + icon input + inline error, styled to the HomeFix auth look. */
export function FormField({
  label,
  icon: Icon,
  error,
  revealable,
  hint,
  type = "text",
  className,
  ...props
}: FormFieldProps) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const inputType = revealable ? (shown ? "text" : "password") : type;

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-sm font-semibold text-forest">
          {label}
        </Label>
        {hint}
      </div>
      <div className="relative mt-2">
        {Icon && (
          <Icon
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
          />
        )}
        <Input
          id={id}
          type={inputType}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-12 rounded-xl border-line-strong bg-surface text-base text-ink shadow-[0_1px_2px_rgb(38_58_50/0.05)]",
            "placeholder:text-ink-soft/60 focus-visible:border-sage focus-visible:ring-4 focus-visible:ring-sage/20",
            Icon && "pl-10",
            revealable && "pr-11"
          )}
          {...props}
        />
        {revealable && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-forest/5 hover:text-forest focus-visible:outline-2 focus-visible:outline-sage"
          >
            {shown ? <EyeOff aria-hidden className="size-4" /> : <Eye aria-hidden className="size-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-status-rejected-fg">
          {error}
        </p>
      )}
    </div>
  );
}