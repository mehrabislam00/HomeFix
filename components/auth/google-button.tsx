"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AuthError } from "@/components/auth/auth-submit";
import { Button } from "@/components/ui/button";
import { NOT_CONNECTED, type AuthResult } from "@/lib/auth-types";
import { btn } from "@/lib/button-styles";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 48 48" className={className}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

/**
 * "Continue with Google" + "OR" divider, shared by Sign In and Create Account.
 *
 * `onGoogleSignIn` should start your existing auth provider's Google flow. The server
 * must create / link the account with the CUSTOMER role only — Google must never grant
 * Admin (or Technician) privileges.
 */
export function GoogleAuth({
  onGoogleSignIn,
  redirectTo = "/",
  note,
}: {
  onGoogleSignIn?: () => Promise<AuthResult>;
  redirectTo?: string;
  note?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setError("");
    setPending(true);
    const result = onGoogleSignIn ? await onGoogleSignIn() : NOT_CONNECTED;
    setPending(false);
    if (result.ok) router.push(redirectTo);
    else setError(result.error);
  }

  return (
    <div className="flex flex-col gap-4">
      <AuthError message={error} />
      <Button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className={cn(
          btn.lg,
          btn.outline,
          "h-12 w-full bg-surface text-base text-ink shadow-[0_1px_2px_rgb(38_58_50/0.06)] hover:bg-field"
        )}
      >
        {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <GoogleIcon className="size-5" />}
        Continue with Google
      </Button>
      {note && <p className="-mt-1 text-center text-xs text-ink-soft">{note}</p>}

      <div className="flex items-center gap-3" role="separator" aria-label="or">
        <span className="h-px flex-1 bg-line-strong/60" />
        <span className="text-xs font-semibold tracking-widest text-ink-muted">OR</span>
        <span className="h-px flex-1 bg-line-strong/60" />
      </div>
    </div>
  );
}