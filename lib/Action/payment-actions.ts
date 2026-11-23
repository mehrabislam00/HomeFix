"use server"

import { getCustomerBooking } from "@/lib/Action/booking-actions"
import { getProfileSession } from "@/lib/Action/profile-action-utils"
import {
  requestServiceBookingApi,
  ServiceBookingApiError,
} from "@/lib/service-booking-api"
import type { Payment } from "@/lib/dashboard-data"
import { stripe } from "@/lib/stripe"

export type StartPaymentResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; error: string; status: number }

export type CheckoutAttemptStatus = "pending" | "failed" | "expired" | "paid"

export type PaymentStatistics = {
  totalPayments: number
  totalRevenue: number
  currency: string
  byStatus: Record<string, number>
}

type PaymentRecord = Record<string, unknown>

const payableStatuses = new Set(["accepted", "in_progress", "completed"])

function isRecord(value: unknown): value is PaymentRecord {
  return typeof value === "object" && value !== null
}

function paymentId(value: unknown): string {
  if (typeof value === "string") return value
  if (!isRecord(value)) return ""
  if (typeof value.$oid === "string") return value.$oid
  if (typeof value.id === "string") return value.id
  return ""
}

function normalizePayment(value: unknown): Payment {
  if (!isRecord(value))
    throw new Error("The payment API returned an invalid payment.")
  const id = paymentId(value._id ?? value.id)
  if (!id) throw new Error("The payment API returned a payment without an ID.")
  const requiredString = (field: string) => {
    const result = value[field]
    if (typeof result !== "string" || !result.trim()) {
      throw new Error(`The payment API returned a payment without ${field}.`)
    }
    return result
  }
  const amount = value.amount
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    throw new Error("The payment API returned an invalid payment amount.")
  }
  const paidAt = value.paidAt
  const date = new Date(
    typeof paidAt === "string" ||
      typeof paidAt === "number" ||
      paidAt instanceof Date
      ? paidAt
      : Number.NaN
  )
  if (Number.isNaN(date.getTime())) {
    throw new Error("The payment API returned a payment with an invalid date.")
  }
  const paymentStatus = value.paymentStatus
  if (paymentStatus !== "paid") {
    throw new Error("The payment API returned an unverified payment record.")
  }
  const currency = requiredString("currency").toUpperCase()
  if (currency !== "BDT") {
    throw new Error(
      "The payment API returned a payment in an unsupported currency."
    )
  }
  return {
    id,
    bookingId: requiredString("bookingId"),
    serviceTitle: requiredString("serviceTitle"),
    amount,
    paidAt: date.toISOString(),
    method: "Stripe",
    transactionId: requiredString("transactionId"),
    stripeSessionId: requiredString("stripeSessionId"),
    paymentStatus,
    customerName: requiredString("customerName"),
    customerEmail: requiredString("customerEmail"),
    technicianName: requiredString("technicianName"),
    technicianEmail: requiredString("technicianEmail"),
    currency,
  }
}

function normalizePayments(value: unknown): Payment[] {
  const rows = Array.isArray(value)
    ? value
    : isRecord(value) && Array.isArray(value.payments)
      ? value.payments
      : null
  if (!rows)
    throw new Error("The payment API returned an invalid payment list.")
  return rows.map(normalizePayment)
}

function normalizeStatistics(value: unknown): PaymentStatistics {
  if (!isRecord(value))
    throw new Error("The payment API returned invalid statistics.")
  if (
    typeof value.totalPayments !== "number" ||
    !Number.isFinite(value.totalPayments) ||
    typeof value.totalRevenue !== "number" ||
    !Number.isFinite(value.totalRevenue) ||
    typeof value.currency !== "string" ||
    value.currency.toUpperCase() !== "BDT" ||
    !isRecord(value.byStatus)
  ) {
    throw new Error("The payment API returned incomplete payment statistics.")
  }
  const byStatus = Object.fromEntries(
    Object.entries(value.byStatus).map(([key, count]) => {
      if (typeof count !== "number" || !Number.isFinite(count)) {
        throw new Error(
          "The payment API returned an invalid payment status count."
        )
      }
      return [key, count]
    })
  )
  return {
    totalPayments: value.totalPayments,
    totalRevenue: value.totalRevenue,
    currency: value.currency.toUpperCase(),
    byStatus,
  }
}

async function paymentsForRole(role: "customer" | "technician") {
  const access = await getProfileSession(role)
  if (!access.ok) throw new Error(access.error)
  const id = encodeURIComponent(access.session.user.id)
  const base = `/${role === "customer" ? "customers" : "technicians"}/${id}/payments`
  const [payments, statistics] = await Promise.all([
    requestServiceBookingApi(base),
    requestServiceBookingApi(`${base}/stats`),
  ])
  return {
    payments: normalizePayments(payments),
    statistics: normalizeStatistics(statistics),
  }
}

export async function getCustomerPayments() {
  return paymentsForRole("customer")
}

export async function getCustomerPayment(paymentId: string): Promise<Payment> {
  if (typeof paymentId !== "string" || !paymentId.trim()) {
    throw new Error("A valid payment ID is required.")
  }
  const access = await getProfileSession("customer")
  if (!access.ok) throw new Error(access.error)
  const path = `/customers/${encodeURIComponent(access.session.user.id)}/payments/${encodeURIComponent(paymentId)}`
  const value = await requestServiceBookingApi(path)
  return normalizePayment(value)
}

export async function getTechnicianPayments() {
  return paymentsForRole("technician")
}

export async function getTechnicianPayment(
  paymentId: string
): Promise<Payment> {
  if (typeof paymentId !== "string" || !paymentId.trim()) {
    throw new Error("A valid payment ID is required.")
  }
  const access = await getProfileSession("technician")
  if (!access.ok) throw new Error(access.error)
  const path = `/technicians/${encodeURIComponent(access.session.user.id)}/payments/${encodeURIComponent(paymentId)}`
  const value = await requestServiceBookingApi(path)
  return normalizePayment(value)
}

export async function startCustomerPayment(
  bookingId: string
): Promise<StartPaymentResult> {
  if (typeof bookingId !== "string" || !bookingId.trim()) {
    return { ok: false, error: "Choose a valid booking.", status: 400 }
  }

  const access = await getProfileSession("customer")
  if (!access.ok) {
    return { ok: false, error: access.error, status: 401 }
  }

  try {
    const booking = await getCustomerBooking(bookingId)
    if (booking.paymentStatus === "paid") {
      return {
        ok: false,
        error: "This booking has already been paid.",
        status: 409,
      }
    }
    if (!payableStatuses.has(booking.status)) {
      return {
        ok: false,
        error: "Payment is available after the technician accepts the booking.",
        status: 409,
      }
    }

    const amount = booking.finalAmount ?? booking.estimate
    const unitAmount = Math.round(amount * 100)
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !Number.isSafeInteger(unitAmount) ||
      unitAmount < 1
    ) {
      return {
        ok: false,
        error: "This booking has an invalid payment amount.",
        status: 400,
      }
    }

    const appUrl = process.env.BETTER_AUTH_URL
    if (!appUrl) {
      throw new Error(
        "BETTER_AUTH_URL must be configured to create checkout sessions."
      )
    }
    const origin = new URL(appUrl).origin
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: booking.serviceTitle,
              description: `HomeFix booking ${booking.id}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: access.session.user.email,
      client_reference_id: booking.id,
      metadata: { bookingId: booking.id },
      payment_intent_data: { metadata: { bookingId: booking.id } },
      success_url: `${origin}/success?booking_id=${encodeURIComponent(booking.id)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancelled?booking_id=${encodeURIComponent(booking.id)}`,
    })
    if (!session.url) {
      throw new Error("Stripe did not return a hosted checkout URL.")
    }
    return { ok: true, checkoutUrl: session.url }
  } catch (error) {
    console.error("Unable to start customer payment.", error)
    if (error instanceof ServiceBookingApiError) {
      return { ok: false, error: error.message, status: error.status }
    }
    return {
      ok: false,
      error: "Unable to start payment. Please try again.",
      status: 502,
    }
  }
}

export async function getCustomerCheckoutAttemptStatus(
  bookingId: string,
  sessionId: string
): Promise<CheckoutAttemptStatus> {
  if (
    typeof bookingId !== "string" ||
    !bookingId.trim() ||
    typeof sessionId !== "string" ||
    !sessionId.startsWith("cs_")
  ) {
    return "pending"
  }
  const access = await getProfileSession("customer")
  if (!access.ok) throw new Error(access.error)

  try {
    const booking = await getCustomerBooking(bookingId)
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    })
    if (
      checkoutSession.metadata?.bookingId !== booking.id &&
      checkoutSession.client_reference_id !== booking.id
    ) {
      throw new Error("Checkout session does not match the requested booking.")
    }
    if (checkoutSession.status === "expired") return "expired"

    const paymentIntent =
      typeof checkoutSession.payment_intent === "object"
        ? checkoutSession.payment_intent
        : checkoutSession.payment_intent
          ? await stripe.paymentIntents.retrieve(checkoutSession.payment_intent)
          : null
    if (
      checkoutSession.status === "complete" &&
      paymentIntent &&
      (paymentIntent.status === "canceled" ||
        (paymentIntent.status === "requires_payment_method" &&
          paymentIntent.last_payment_error))
    ) {
      return "failed"
    }
    if (
      checkoutSession.status === "complete" &&
      checkoutSession.payment_status === "paid" &&
      paymentIntent?.status === "succeeded"
    ) {
      const confirmation = await requestServiceBookingApi(
        `/payments/checkout/${encodeURIComponent(sessionId)}/confirm`,
        { method: "POST" }
      )
      if (isRecord(confirmation) && confirmation.status === "paid") {
        return "paid"
      }
    }
    return "pending"
  } catch (error) {
    console.error("Unable to verify Stripe checkout attempt status.", error)
    return "pending"
  }
}
