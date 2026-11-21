import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { btn } from "@/lib/button-styles";
import { cn } from "@/lib/utils";

export function AuthSubmit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn(btn.lg, btn.primary, "shine relative h-12 w-full overflow-hidden text-base")}
    >
      {pending && <Loader2 aria-hidden className="size-4 animate-spin" />}
      {children}
    </Button>
  );
}

export function AuthError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border border-status-rejected-fg/20 bg-status-rejected-bg px-4 py-3 text-sm font-medium text-status-rejected-fg"
    >
      {message}
    </p>
  );
}