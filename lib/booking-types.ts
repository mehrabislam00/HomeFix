/**
 * Contract between the booking form and your existing booking API.
 * Pass an `onSubmit` that creates the booking; the form handles validation,
 * pending state, error display and the success message.
 */
export type BookingValues = {
  serviceId: string
  /** ISO date, yyyy-MM-dd */
  date: string
  address: string
  phone: string
  notes: string
}

export type BookingResult = { ok: true } | { ok: false; error: string }