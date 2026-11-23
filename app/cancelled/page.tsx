import type { Metadata } from "next"

import { PaymentResultCard } from "@/components/Dashboard/payment-result-card"

export const metadata: Metadata = { title: "Payment cancelled — HomeFix" }

export default function PaymentCancelled() {
  return <PaymentResultCard state="cancelled" />
}
