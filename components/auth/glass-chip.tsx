import { cn } from "@/lib/utils";

/** Frosted card for use ON dark / photo panels (auth brand panels). */
export function GlassChip({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/25 bg-white/12 text-white backdrop-blur-xl",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.3),0_18px_40px_-18px_rgb(0_0_0/0.55)]",
        className
      )}
    >
      {children}
    </div>
  );
}