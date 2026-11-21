"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";

import { AuthError, AuthSubmit } from "@/components/auth/auth-submit";
import { FormField } from "@/components/auth/form-field";
import { NOT_CONNECTED, type AuthResult, type LoginValues } from "@/lib/auth-types";
import { email as validateEmail, password as validatePassword, type FieldErrors } from "@/lib/validation";

/**
 * `onSubmit` must authenticate against your backend AND confirm the account
 * has the admin role server-side, returning `{ ok: false }` otherwise.
 * This form only redirects after the backend says yes.
 */
export function AdminLoginForm({
  onSubmit,
  redirectTo = "/admin/dashboard",
}: {
  onSubmit?: (values: LoginValues) => Promise<AuthResult>;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors<keyof LoginValues>>({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const values: LoginValues = {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    };
    const next = { email: validateEmail(values.email), password: validatePassword(values.password) };
    setErrors(next);
    setFormError("");
    if (next.email || next.password) return;

    setPending(true);
    const result = onSubmit ? await onSubmit(values) : NOT_CONNECTED;
    setPending(false);
    if (result.ok) router.push(redirectTo);
    else setFormError(result.error);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* Card header */}
      <div className="flex items-center gap-3 border-b border-forest/10 pb-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-forest text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_8px_18px_-8px_rgb(38_58_50/0.6)]">
          <ShieldCheck aria-hidden className="size-6" strokeWidth={1.75} />
        </span>
        <div className="leading-tight">
          <p className="font-[family-name:var(--font-manrope)] text-base font-bold text-forest">Secure sign-in</p>
          <p className="mt-1 text-xs text-ink-soft">Use your administrator credentials</p>
        </div>
      </div>
      <AuthError message={formError} />
      <FormField
        label="Admin email"
        name="email"
        type="email"
        icon={Mail}
        autoComplete="username"
        placeholder="admin@homefix.com"
        error={errors.email}
      />
      <FormField
        label="Password"
        name="password"
        icon={Lock}
        revealable
        autoComplete="current-password"
        placeholder="Enter your password"
        error={errors.password}
      />
      <AuthSubmit pending={pending}>Sign in to console</AuthSubmit>
      <p className="flex items-start justify-center gap-2 rounded-xl bg-pale-sage px-3.5 py-3 text-xs leading-relaxed text-ink-soft ring-1 ring-forest/5">
        <Lock aria-hidden className="mt-0.5 size-3.5 shrink-0 text-forest" />
        Restricted area. Access is limited to authorized administrators and is verified on the server.
      </p>
    </form>
  );
}