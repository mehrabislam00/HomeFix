"use client"

import { useState, type FormEvent } from "react"
import { format } from "date-fns"
import { CircleCheck, MapPin, Phone } from "lucide-react"

import { AuthError, AuthSubmit } from "@/components/auth/auth-submit"
import { FormField } from "@/components/auth/form-field"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { BookingResult, BookingValues } from "@/lib/booking-types"
import { formatBDT } from "@/lib/utils"
import { required, type FieldErrors } from "@/lib/validation"
import { BookingDatePicker } from "./booking-date-picker"

type Errors = FieldErrors<"date" | "address" | "phone">

const phone = (v: string) => {
  if (!v.trim()) return "Phone number is required."
  return v.replace(/\D/g, "").length >= 10 ? "" : "Enter a valid phone number."
}

export function BookingCard({
  serviceId,
  price,
  onSubmit,
}: {
  serviceId: string
  price: number
  /** Creates the booking in your backend. Without it the form shows a "not connected" error. */
  onSubmit?: (values: BookingValues) => Promise<BookingResult>
}) {
  const [date, setDate] = useState<Date | undefined>()
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState("")
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const values: BookingValues = {
      serviceId,
      date: date ? format(date, "yyyy-MM-dd") : "",
      address: String(data.get("address") ?? ""),
      phone: String(data.get("phone") ?? ""),
      notes: String(data.get("notes") ?? ""),
    }
    const next: Errors = {
      date: date ? "" : "Choose a preferred date.",
      address: required("Service address")(values.address),
      phone: phone(values.phone),
    }
    setErrors(next)
    setFormError("")
    if (Object.values(next).some(Boolean)) return

    setPending(true)
    try {
      const result = onSubmit
        ? await onSubmit(values)
        : ({
            ok: false,
            error:
              "Booking isn't connected yet. Provide an onSubmit handler to BookingCard.",
          } as const)
      if (result.ok) setDone(true)
      else setFormError(result.error)
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to submit your booking. Please try again."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="glass-card relative rounded-[1.75rem] p-5 sm:p-7">
      <p className="text-sm text-ink-soft">Starting from</p>
      <p className="mt-1 flex items-baseline gap-2">
        <strong className="font-[family-name:var(--font-manrope)] text-4xl font-extrabold tracking-tight text-forest">
          {formatBDT(price)}
        </strong>
        <span className="text-sm text-ink-soft">per visit</span>
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        Final amount is confirmed by the technician after the job.
      </p>

      <div className="my-5 h-px bg-forest/10" aria-hidden />

      {done ? (
        <div
          className="flex flex-col items-center py-6 text-center"
          role="status"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-status-success-bg text-status-success-fg">
            <CircleCheck aria-hidden className="size-7" strokeWidth={1.75} />
          </span>
          <h2 className="mt-4 font-[family-name:var(--font-manrope)] text-xl font-extrabold text-forest">
            Request sent
          </h2>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            The technician will review your request and confirm. You&apos;ll be
            notified at every step.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          <AuthError message={formError} />

          <div>
            <Label
              htmlFor="booking-date"
              className="text-sm font-semibold text-forest"
            >
              Preferred date
            </Label>
            <div className="mt-2">
              <BookingDatePicker
                id="booking-date"
                value={date}
                onChange={setDate}
                error={errors.date}
              />
            </div>
          </div>

          <FormField
            label="Service address"
            name="address"
            icon={MapPin}
            autoComplete="street-address"
            placeholder="House, road, area"
            error={errors.address}
          />
          <FormField
            label="Phone number"
            name="phone"
            type="tel"
            icon={Phone}
            autoComplete="tel"
            placeholder="+880 1XXX XXXXXX"
            error={errors.phone}
          />

          <div>
            <Label
              htmlFor="booking-notes"
              className="text-sm font-semibold text-forest"
            >
              Describe the problem{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
            </Label>
            <Textarea
              id="booking-notes"
              name="notes"
              rows={3}
              placeholder="e.g. AC is not cooling properly"
              className="mt-2 min-h-24 rounded-xl border-line-strong bg-surface px-3.5 py-3 text-base text-ink shadow-[0_1px_2px_rgb(38_58_50/0.05)] placeholder:text-ink-soft/60 focus-visible:border-sage focus-visible:ring-4 focus-visible:ring-sage/20"
            />
          </div>

          <AuthSubmit pending={pending}>Request booking</AuthSubmit>
        </form>
      )}
    </div>
  )
}
