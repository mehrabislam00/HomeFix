"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { CircleCheck, ImagePlus, Info, Tag } from "lucide-react"

import { AuthError, AuthSubmit } from "@/components/auth/auth-submit"
import { FormField } from "@/components/auth/form-field"
import { BlurFade } from "@/components/magic/blur-fade"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { btn } from "@/lib/button-styles"
import { serviceCategories } from "@/lib/services-data"
import {
  DEFAULT_AVAILABILITY,
  SERVICE_DESCRIPTION_MAX,
  type NewServiceResult,
  type NewServiceValues,
} from "@/lib/technician-data"
import { cn } from "@/lib/utils"
import { required, type FieldErrors } from "@/lib/validation"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const categories = serviceCategories.filter((c) => c.slug !== "all")

type Errors = FieldErrors<"title" | "category" | "price" | "description">

/**
 * "Add a service" form. `onSubmit` creates the listing in your backend; without
 * it the form validates and then reports that it isn't connected, instead of
 * pretending the service was saved.
 */
export function AddServiceForm({
  onSubmit,
}: {
  onSubmit?: (values: NewServiceValues) => Promise<NewServiceResult>
}) {
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [accepting, setAccepting] = useState(true)
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ""
    if (!file) return
    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setFormError("Choose a JPG or PNG image.")
      return
    }
    if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
      setFormError("Choose an image smaller than 5 MB.")
      return
    }
    setFormError("")
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const title = String(data.get("title") ?? "")
    const category = String(data.get("category") ?? "")
    const priceText = String(data.get("price") ?? "")
    const price = Number(priceText)

    const next: Errors = {
      title: required("Service name")(title),
      category: category ? "" : "Select a category.",
      price:
        priceText.trim() && Number.isFinite(price) && price > 0
          ? ""
          : "Enter a price greater than 0.",
      description:
        description.trim().length >= 20
          ? ""
          : "Describe the service in at least 20 characters.",
    }
    setErrors(next)
    setFormError("")
    if (Object.values(next).some(Boolean)) return

    const values: NewServiceValues = {
      title: title.trim(),
      category,
      price,
      description: description.trim(),
      availability: String(data.get("availability") ?? "").trim(),
      acceptingBookings: accepting,
      image,
    }

    setPending(true)
    try {
      const result = onSubmit
        ? await onSubmit(values)
        : ({
            ok: false,
            error:
              "Adding services isn't connected yet. Provide an onSubmit handler to AddServiceForm.",
          } as const)
      if (result.ok) setDone(true)
      else setFormError(result.error)
    } catch {
      setFormError("Unable to submit your service. Please try again.")
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className="glass-card relative flex flex-col items-center rounded-[1.75rem] px-6 py-14 text-center"
      >
        <span className="flex size-14 items-center justify-center rounded-2xl bg-status-success-bg text-status-success-fg">
          <CircleCheck aria-hidden className="size-7" strokeWidth={1.75} />
        </span>
        <h2 className="mt-4 font-[family-name:var(--font-manrope)] text-xl font-extrabold text-forest">
          Submitted for approval
        </h2>
        <p className="mt-2 max-w-sm text-sm text-ink-soft">
          Our team will review your listing. It becomes bookable once approved.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-center gap-2.5 rounded-2xl border border-status-requested-fg/15 bg-status-requested-bg px-4 py-3 text-sm text-status-requested-fg">
        <Info aria-hidden className="size-4 shrink-0" />
        <span>
          New services start as{" "}
          <strong className="font-semibold">Pending Approval</strong> and become
          bookable once an admin approves them.
        </span>
      </p>

      <BlurFade fade={false} delay={0.08} y={16}>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="glass-card relative grid gap-6 rounded-[1.75rem] p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_300px]"
        >
          <div className="flex flex-col gap-5">
            <AuthError message={formError} />
            <FormField
              label="Service name"
              name="title"
              icon={Tag}
              placeholder="e.g. Split AC Deep Servicing"
              error={errors.title}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label
                  htmlFor="service-category"
                  className="text-sm font-semibold text-forest"
                >
                  Category
                </Label>
                <NativeSelect
                  id="service-category"
                  name="category"
                  defaultValue=""
                  aria-invalid={errors.category ? true : undefined}
                  className="mt-2 w-full [&_select]:h-12 [&_select]:rounded-xl [&_select]:border-line-strong [&_select]:bg-surface [&_select]:pl-3.5 [&_select]:text-base [&_select]:text-ink"
                >
                  <NativeSelectOption value="" disabled>
                    Select a category
                  </NativeSelectOption>
                  {categories.map(({ slug, label }) => (
                    <NativeSelectOption key={slug} value={label}>
                      {label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {errors.category && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-status-rejected-fg">
                    {errors.category}
                  </p>
                )}
              </div>
              <FormField
                label="Price per visit (BDT)"
                name="price"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="1800"
                error={errors.price}
              />
            </div>

            <div>
              <Label
                htmlFor="service-description"
                className="text-sm font-semibold text-forest"
              >
                Description
              </Label>
              <Textarea
                id="service-description"
                value={description}
                maxLength={SERVICE_DESCRIPTION_MAX}
                onChange={(e) => setDescription(e.target.value)}
                aria-invalid={errors.description ? true : undefined}
                placeholder="What's included, typical duration, parts warranty…"
                className="mt-2 min-h-32 rounded-xl border-line-strong bg-surface text-base text-ink placeholder:text-ink-soft/60 focus-visible:border-sage focus-visible:ring-4 focus-visible:ring-sage/20"
              />
              <div className="mt-1.5 flex items-start justify-between gap-3">
                {errors.description ? (
                  <p role="alert" className="text-xs font-medium text-status-rejected-fg">
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-xs text-ink-muted tabular-nums">
                  {description.length}/{SERVICE_DESCRIPTION_MAX}
                </span>
              </div>
            </div>

            <FormField
              label="Availability"
              name="availability"
              defaultValue={DEFAULT_AVAILABILITY}
            />

            <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/80 bg-white/60 px-4 py-3.5">
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-forest">
                  Accepting bookings
                </span>
                <span className="mt-1 block text-xs text-ink-soft">
                  Turn off to pause new requests.
                </span>
              </span>
              <Switch
                checked={accepting}
                onCheckedChange={setAccepting}
                aria-label="Accepting bookings"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-forest">Service image</p>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                aria-label="Upload service image"
                className="group relative mt-2 flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-forest/25 bg-white/50 text-ink-soft transition-colors hover:border-sage hover:bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                  <img src={preview} alt="Selected service" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <>
                    <ImagePlus aria-hidden strokeWidth={1.75} className="size-8 text-forest transition-transform duration-200 group-hover:-rotate-6 motion-reduce:transition-none" />
                    <span className="text-sm font-medium text-forest">Click to upload</span>
                    <span className="text-xs">PNG or JPG, up to 5 MB</span>
                  </>
                )}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                onChange={handleImage}
                className="sr-only"
                tabIndex={-1}
              />
              <Button
                type="button"
                onClick={() => fileInput.current?.click()}
                className={cn(btn.md, btn.outline, "mt-3 w-full bg-white/70 hover:bg-white")}
              >
                <ImagePlus aria-hidden className="size-4" />
                {image ? "Replace image" : "Choose image"}
              </Button>
              <p className="mt-2 text-xs text-ink-soft">
                No image? We&apos;ll use a photo for the chosen category.
              </p>
            </div>
            <AuthSubmit pending={pending}>Submit for approval</AuthSubmit>
          </div>
        </form>
      </BlurFade>
    </div>
  )
}