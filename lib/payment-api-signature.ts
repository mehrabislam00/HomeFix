import "server-only"

import { createHmac } from "node:crypto"

export type PaymentApiRole = "customer" | "technician" | "admin"

export function paymentApiHeaders(
  method: string,
  path: string,
  role: PaymentApiRole,
  userId: string
): Record<string, string> {
  const secret = process.env.HOMEFIX_PAYMENT_API_SECRET
  if (!secret) {
    throw new Error(
      "HOMEFIX_PAYMENT_API_SECRET must be configured for payment API access."
    )
  }

  const timestamp = Date.now().toString()
  const signature = createHmac("sha256", secret)
    .update(
      `${timestamp}\n${method.toUpperCase()}\n${path}\n${role}\n${userId}`
    )
    .digest("hex")

  return {
    "x-homefix-user-id": userId,
    "x-homefix-user-role": role,
    "x-homefix-request-time": timestamp,
    "x-homefix-request-signature": signature,
  }
}
