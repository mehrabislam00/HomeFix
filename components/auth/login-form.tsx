"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail } from "lucide-react"

import { AuthError, AuthSubmit } from "@/components/auth/auth-submit"
import { FormField } from "@/components/auth/form-field"
import { GoogleAuth } from "@/components/auth/google-button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  type AuthResult,
  type LoginValues,
} from "@/lib/auth-types"
import { authClient } from "@/lib/auth-client"
import {
  email as validateEmail,
  password as validatePassword,
  type FieldErrors,
} from "@/lib/validation"

export function LoginForm({
  onSubmit,
  onGoogleSignIn,
  redirectTo = "/",
}: {
  onSubmit?: (values: LoginValues) => Promise<AuthResult>
  /** Starts your existing provider's Google flow (customer accounts only). */
  onGoogleSignIn?: () => Promise<AuthResult>
  /** Where to go after a successful sign-in (use your role-based dashboard logic here). */
  redirectTo?: string
}) {
  const router = useRouter()
  const [errors, setErrors] = useState<FieldErrors<keyof LoginValues>>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const values: LoginValues = {
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      rememberMe,
    }
    const next = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    }
    setErrors(next)
    setFormError("")
    if (next.email || next.password) return

    setPending(true)
    let result: AuthResult

    try {
      if (onSubmit) {
        result = await onSubmit(values)
      } else {
        const { error } = await authClient.signIn.email({
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
          callbackURL: redirectTo,
        })

        result = error
          ? { ok: false, error: error.message || "Unable to sign in." }
          : { ok: true }
      }
    } catch (error) {
      result = {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to sign in.",
      }
    } finally {
      setPending(false)
    }

    if (result.ok) router.push(redirectTo)
    else setFormError(result.error)
  }

  return (
    <div className="flex flex-col gap-5">
      <GoogleAuth onGoogleSignIn={onGoogleSignIn} redirectTo={redirectTo} />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <AuthError message={formError} />
        <FormField
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
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
        <div className="flex items-center gap-2">
          <Checkbox
            id="rememberMe"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
            disabled={pending}
          />
          <Label
            htmlFor="rememberMe"
            className="cursor-pointer text-sm text-ink-soft"
          >
            Remember me
          </Label>
        </div>
        <AuthSubmit pending={pending}>Sign In</AuthSubmit>
      </form>
    </div>
  )
}