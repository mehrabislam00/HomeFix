"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, UserRound } from "lucide-react"

import { AuthError, AuthSubmit } from "@/components/auth/auth-submit"
import { FormField } from "@/components/auth/form-field"
import { GoogleAuth } from "@/components/auth/google-button"
import { RolePicker } from "@/components/auth/role-picker"
import {
  type AuthResult,
  type RegisterValues,
} from "@/lib/auth-types"
import {
  email as validateEmail,
  password as validatePassword,
  required,
  type FieldErrors,
} from "@/lib/validation"
import { authClient } from "@/lib/auth-client"

type Errors = FieldErrors<"name" | "email" | "password" | "confirm">

export function RegisterForm({
  onSubmit,
  onGoogleSignIn,
  redirectTo = "/auth/complete",
  initialRole = "customer",
}: {
  onSubmit?: (values: RegisterValues) => Promise<AuthResult>
  /** Starts your existing provider's Google flow using the selected public role. */
  onGoogleSignIn?: (role?: RegisterValues["role"]) => Promise<AuthResult>
  redirectTo?: string
  initialRole?: RegisterValues["role"]
}) {
  const router = useRouter()
  const [role, setRole] = useState<RegisterValues["role"]>(initialRole)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formdata = new FormData(e.currentTarget)
    const values: RegisterValues = {
      role,
      name: String(formdata.get("name") ?? ""),
      email: String(formdata.get("email") ?? ""),
      password: String(formdata.get("password") ?? ""),
    }
    const confirm = String(formdata.get("confirm") ?? "")

    const next: Errors = {
      name: required("Full name")(values.name),
      email: validateEmail(values.email),
      password: validatePassword(values.password),
      confirm: confirm
        ? confirm === values.password
          ? ""
          : "Passwords don't match."
        : "Confirm your password.",
    }
    setErrors(next)
    setFormError("")
    if (Object.values(next).some(Boolean)) return

    setPending(true)
    try {
      let result: AuthResult
      if (onSubmit) {
        result = await onSubmit(values)
      } else {
        const { error } = await authClient.signUp.email({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
          callbackURL: redirectTo,
        })

        result = error
          ? { ok: false, error: error.message || "Unable to create your account." }
          : { ok: true }
      }

      if (result.ok) {
        document.cookie =
          "homefix-registration-role=; Path=/; Max-Age=0; SameSite=Lax"
        router.replace(redirectTo)
      } else {
        setFormError(result.error)
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create your account."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <GoogleAuth
        onGoogleSignIn={onGoogleSignIn}
        redirectTo={redirectTo}
        role={role}
        note="Your selected account type will be used."
      />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <AuthError message={formError} />
        <RolePicker
          value={role}
          onChange={(nextRole) => {
            setRole(nextRole)
            document.cookie = `homefix-registration-role=${nextRole}; Path=/; Max-Age=1800; SameSite=Lax`
          }}
        />
        <FormField
          label="Full name"
          name="name"
          icon={UserRound}
          autoComplete="name"
          placeholder="Jane Doe"
          error={errors.name}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="Password"
            name="password"
            icon={Lock}
            revealable
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            error={errors.password}
          />
          <FormField
            label="Confirm password"
            name="confirm"
            icon={Lock}
            revealable
            autoComplete="new-password"
            placeholder="Repeat password"
            error={errors.confirm}
          />
        </div>
        <AuthSubmit pending={pending}>Create Account</AuthSubmit>
      </form>
    </div>
  )
}