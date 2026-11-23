import type { Metadata } from "next"

import { PaymentResultCard } from "@/components/Dashboard/payment-result-card"
import { getCustomerBooking } from "@/lib/Action/booking-actions"
import {
  getCustomerCheckoutAttemptStatus,
  getCustomerPayments,
} from "@/lib/Action/payment-actions"
import type { Booking, Payment } from "@/lib/dashboard-data"

export const metadata: Metadata = { title: "Payment status — HomeFix" }

export default async function PaymentSuccess({
  searchParams,
}: {
  searchParams: Promise<{ booking_id?: string; session_id?: string }>
}) {
  const { booking_id: bookingId, session_id: sessionId } = await searchParams
  let booking: Booking | undefined
  let confirmedPayment: Payment | undefined
  let confirmed = false
  let attemptStatus: Awaited<
    ReturnType<typeof getCustomerCheckoutAttemptStatus>
  > = "pending"

  if (bookingId) {
    try {
      booking = await getCustomerBooking(bookingId)
    } catch (error) {
      console.error("Unable to verify returned payment booking.", error)
    }
  }

  if (bookingId && sessionId) {
    const [paymentsResult, statusResult] = await Promise.allSettled([
      getCustomerPayments(),
      getCustomerCheckoutAttemptStatus(bookingId, sessionId),
    ])
    if (paymentsResult.status === "fulfilled") {
      confirmedPayment = paymentsResult.value.payments.find(
        (payment) =>
          payment.bookingId === bookingId && payment.paymentStatus === "paid"
      )
      confirmed = booking?.paymentStatus === "paid" && Boolean(confirmedPayment)
    } else {
      console.error(
        "Unable to verify payment record after checkout.",
        paymentsResult.reason
      )
    }
    if (statusResult.status === "fulfilled") {
      attemptStatus = statusResult.value
    } else {
      console.error(
        "Unable to verify Stripe checkout attempt.",
        statusResult.reason
      )
    }
  }
  const state = confirmed || attemptStatus === "paid"
    ? "success"
    : attemptStatus === "failed"
      ? "failed"
      : attemptStatus === "expired"
        ? "expired"
        : "pending"

  return (
    <PaymentResultCard
      state={state}
      booking={booking}
      transactionId={confirmedPayment?.stripeSessionId ?? sessionId}
      bookingId={bookingId}
    />
  )
}
