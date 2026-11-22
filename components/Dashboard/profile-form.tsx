"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Upload,
  User,
} from "lucide-react"

import { AuthError, AuthSubmit } from "@/components/auth/auth-submit"
import { FormField } from "@/components/auth/form-field"
import { BlurFade } from "@/components/magic/blur-fade"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { initialsOf, type Customer } from "@/lib/dashboard-data"
import { btn } from "@/lib/button-styles"
import type { ProfileResult, ProfileValues } from "@/lib/profile-types"
import { cn } from "@/lib/utils"
import { required } from "@/lib/validation"
import { authClient } from "@/lib/auth-client"

const MAX_PHOTO_SIZE = 5 * 1024 * 1024

export function ProfileForm({
  customer,
  onSubmit,
}: {
  customer: Customer
  onSubmit: (
    values: ProfileValues,
    photo: File | null
  ) => Promise<ProfileResult>
}) {
  const router = useRouter()
  const { refetch: refreshSession } = authClient.useSession()
  const initial: ProfileValues = {
    name: customer.name,
    phone: customer.phone ?? "",
    area: customer.address ?? "",
    bio: customer.bio ?? "",
  }
  const [saved, setSaved] = useState(initial)
  const [values, setValues] = useState(initial)
  const [savedImage, setSavedImage] = useState(customer.image)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState(customer.image)
  const photoInput = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)
  const [nameError, setNameError] = useState("")
  const [formError, setFormError] = useState("")
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  const dirty = (Object.keys(values) as (keyof ProfileValues)[]).some(
    (key) => values[key] !== saved[key]
  ) || photo !== null

  useEffect(() => {
    if (!photoPreview?.startsWith("blob:")) return
    return () => URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  function setInput(key: keyof ProfileValues) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [key]: event.target.value }))
      setSuccess(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const error = required("Full name")(values.name)
    setNameError(error)
    setFormError("")
    if (error) return

    setPending(true)
    try {
      const result = await onSubmit(values, photo)
      if (!result.ok) {
        setFormError(result.error)
        return
      }

      const updated: ProfileValues = {
        name: values.name.trim(),
        phone: values.phone.trim(),
        area: values.area.trim(),
        bio: values.bio.trim(),
      }
      setSaved(updated)
      setValues(updated)
      if (result.image) setSavedImage(result.image)
      setPhotoPreview(result.image ?? savedImage)
      setPhoto(null)
      setEditing(false)
      setSuccess(true)
      router.refresh()

      try {
        await refreshSession({ query: { disableCookieCache: true } })
      } catch {
        setFormError(
          "Your profile was saved, but your session could not be refreshed. Reload the page to see the latest details."
        )
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to save your profile. Please try again."
      )
    } finally {
      setPending(false)
    }
  }

  function cancelEditing() {
    setValues(saved)
    setPhoto(null)
    setPhotoPreview(savedImage)
    setNameError("")
    setFormError("")
    setEditing(false)
  }

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.currentTarget.files?.[0]
    event.currentTarget.value = ""
    if (!selected) return

    if (selected.type !== "image/jpeg" && selected.type !== "image/png") {
      setFormError("Choose a JPG, JPEG, or PNG image.")
      return
    }
    if (selected.size === 0 || selected.size > MAX_PHOTO_SIZE) {
      setFormError("Choose an image smaller than 5 MB.")
      return
    }

    setPhoto(selected)
    setPhotoPreview(URL.createObjectURL(selected))
    setFormError("")
    setSuccess(false)
  }

  return (
    <BlurFade fade={false} delay={0.1} y={16}>
      <section className="glass-card relative rounded-[1.75rem] p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-manrope)] text-xl font-extrabold tracking-tight text-forest">
              Personal details
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              {editing
                ? "Update the information on your customer profile."
                : "Your profile information and account details."}
            </p>
          </div>
          {!editing && (
            <Button
              type="button"
              onClick={() => {
                setFormError("")
                setSuccess(false)
                setEditing(true)
              }}
              className={cn(
                btn.md,
                btn.outline,
                "shrink-0 bg-surface hover:bg-field"
              )}
            >
              <Pencil aria-hidden className="size-4" />
              Edit profile
            </Button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 flex flex-col gap-5"
        >
          <AuthError message={formError} />

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface/70 p-4 sm:col-span-2">
              <Avatar size="lg" className="size-16 ring-2 ring-white">
                {photoPreview && (
                  <AvatarImage
                    key={photoPreview}
                    src={photoPreview}
                    alt={`${customer.name} profile preview`}
                  />
                )}
                <AvatarFallback className="bg-sage font-semibold text-white">
                  {initialsOf(customer.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Label
                  htmlFor="profile-photo"
                  className="text-sm font-semibold text-forest"
                >
                  Profile photo
                </Label>
                <p className="mt-1 text-xs text-ink-soft">
                  JPG or PNG, up to 5 MB.
                </p>
                {photo && (
                  <p className="mt-1 truncate text-xs font-medium text-forest">
                    {photo.name}
                  </p>
                )}
              </div>
              <input
                ref={photoInput}
                id="profile-photo"
                type="file"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                onChange={handlePhotoChange}
                disabled={!editing || pending}
                className="sr-only"
              />
              <Button
                type="button"
                variant="outline"
                disabled={!editing || pending}
                onClick={() => photoInput.current?.click()}
                className="shrink-0 rounded-xl border-line-strong bg-surface text-forest hover:bg-field"
              >
                <Upload aria-hidden className="size-4" />
                {savedImage || photo ? "Replace" : "Upload"}
              </Button>
            </div>
            <FormField
              label="Full name"
              name="name"
              icon={User}
              autoComplete="name"
              value={values.name}
              onChange={setInput("name")}
              disabled={!editing || pending}
              error={nameError}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={customer.email}
              disabled
              readOnly
              className="[&_input]:bg-field/60 [&_input]:text-ink-soft"
            />
            <FormField
              label="Phone"
              name="phone"
              type="tel"
              icon={Phone}
              autoComplete="tel"
              placeholder="Not provided"
              value={values.phone}
              onChange={setInput("phone")}
              disabled={!editing || pending}
            />
            <FormField
              label="Area / address"
              name="area"
              icon={MapPin}
              autoComplete="street-address"
              placeholder="Not provided"
              value={values.area}
              onChange={setInput("area")}
              disabled={!editing || pending}
            />
            <div className="sm:col-span-2">
              <Label
                htmlFor="bio"
                className="text-sm font-semibold text-forest"
              >
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={values.bio}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                  setSuccess(false)
                }}
                disabled={!editing || pending}
                placeholder="Not provided"
                className="mt-2 min-h-24 rounded-xl border-line-strong bg-surface text-ink placeholder:text-ink-soft/60 focus-visible:border-sage focus-visible:ring-4 focus-visible:ring-sage/20 disabled:bg-field/60"
              />
            </div>
            <FormField
              label="Account role"
              name="role"
              value={customer.role === "customer" ? "Customer" : customer.role}
              disabled
              readOnly
              className="[&_input]:bg-field/60 [&_input]:text-ink-soft"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-forest/10 pt-5">
            {success && (
              <p
                role="status"
                className="mr-auto text-sm font-medium text-status-success-fg"
              >
                Changes saved
              </p>
            )}
            {pending && (
              <p role="status" className="mr-auto flex items-center gap-2 text-sm text-ink-soft">
                <Loader2 aria-hidden className="size-4 animate-spin" />
                {photo ? "Uploading photo and saving profile..." : "Saving profile..."}
              </p>
            )}
            {editing && (
              <>
                <Button
                  type="button"
                  disabled={pending}
                  onClick={cancelEditing}
                  className={cn(
                    btn.lg,
                    btn.outline,
                    "bg-surface hover:bg-field"
                  )}
                >
                  Cancel
                </Button>
                <div className="min-w-40">
                  <AuthSubmit pending={pending} disabled={!dirty}>
                    Save changes
                  </AuthSubmit>
                </div>
              </>
            )}
          </div>
        </form>
      </section>
    </BlurFade>
  )
}
