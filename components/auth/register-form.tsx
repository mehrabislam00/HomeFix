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
  redirectTo = "/",
}: {
  onSubmit?: (values: RegisterValues) => Promise<AuthResult>
  /** Starts your existing provider's Google flow; must create CUSTOMER accounts only. */
  onGoogleSignIn?: () => Promise<AuthResult>
  redirectTo?: string
}) {
  const router = useRouter()
  const [role, setRole] = useState<RegisterValues["role"]>("customer")
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
    let result: AuthResult

    if (onSubmit) {
      result = await onSubmit(values)
    } else {
      try {
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
      } catch (error) {
        result = {
          ok: false,
          error: error instanceof Error
            ? error.message
            : "Unable to create your account.",
        }
      }
    }

    setPending(false)
    if (result.ok) router.push(redirectTo)
    else setFormError(result.error)
  }

  return (
    <div className="flex flex-col gap-5">
      <GoogleAuth
        onGoogleSignIn={onGoogleSignIn}
        redirectTo={redirectTo}
        note="Signing up with Google creates a Customer account."
      />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <AuthError message={formError} />
        <RolePicker value={role} onChange={setRole} />
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