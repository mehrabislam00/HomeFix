import type { StaticImageData } from "next/image"

/** Customer dashboard data loaded from the customer APIs. */

export type BookingStatus =
  | "requested"
  | "accepted"
  | "in_progress"
  | "completed"
  | "rejected"
  | "cancelled"
export type PaymentStatus = "unpaid" | "paid"

export type Booking = {
  id: string
  serviceId: string
  serviceTitle: string
  serviceCategory?: string
  serviceDescription?: string
  image: StaticImageData | string
  technician: string
  technicianEmail?: string
  technicianPhone?: string
  /** ISO date, yyyy-MM-dd */
  date: string
  /** Estimated visit price, in BDT */
  estimate: number
  finalAmount?: number
  address?: string
  phone?: string
  notes?: string
  jobStartedAt?: string
  jobCompletedAt?: string
  status: BookingStatus
  paymentStatus: PaymentStatus
}

export type Payment = {
  id: string
  bookingId: string
  serviceTitle: string
  /** BDT */
  amount: number
  /** ISO date, yyyy-MM-dd */
  paidAt: string
  method: string
}

export type Customer = {
  name: string
  email: string
  emailVerified: boolean
  image?: string
  role: string
  phone?: string
  address?: string
  bio?: string
  /** ISO date, yyyy-MM-dd */
  memberSince: string
  /** ISO date, yyyy-MM-dd */
  profileUpdatedAt: string
}

export const ACTIVE_STATUSES: BookingStatus[] = [
  "requested",
  "accepted",
  "in_progress",
]

export async function getPayments(): Promise<Payment[]> {
  return []
}

export const firstName = (name: string) => name.split(" ")[0] ?? name
export const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
