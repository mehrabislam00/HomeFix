"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";

import { AuthError, AuthSubmit } from "@/components/auth/auth-submit";
import { FormField } from "@/components/auth/form-field";
import { type AuthResult, type LoginValues } from "@/lib/auth-types";
import { authClient } from "@/lib/auth-client";
import { email as validateEmail, password as validatePassword, type FieldErrors } from "@/lib/validation";

/**
 * Without `onSubmit`, signs in with Better Auth and then confirms the account
 * has the admin role; any other account is signed straight back out. The
 * dashboard layout and every admin action re-check the role on the server.
 */
async function signInAsAdmin(values: LoginValues): Promise<AuthResult> {
  const { error } = await authClient.signIn.email({
    email: values.email,
    password: values.password,
  });
  if (error) return { ok: false, error: error.message || "Unable to sign in." };

  const { data: session } = await authClient.getSession({ query: { disableCookieCache: true } });
  const role: string | undefined = session?.user.role;
  if (role !== "admin") {
    await authClient.signOut();
    return { ok: false, error: "This account doesn't have administrator access." };
  }
  return { ok: true };
}

export function AdminLoginForm({
  onSubmit,
  redirectTo = "/auth/complete",
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
    let result: AuthResult;
    try {
      result = onSubmit ? await onSubmit(values) : await signInAsAdmin(values);
    } catch (error) {
      result = { ok: false, error: error instanceof Error ? error.message : "Unable to sign in." };
    } finally {
      setPending(false);
    }
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