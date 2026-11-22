import type { StaticImageData } from "next/image"

import { allServices } from "@/lib/services-data"

/**
 * Customer dashboard booking and payment data.
 *
 * Booking and payment records remain sample data until those APIs are available.
 * The authenticated customer profile is loaded through role-specific user actions.
 */

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
  image: StaticImageData
  technician: string
  /** ISO date, yyyy-MM-dd */
  date: string
  /** Estimated visit price, in BDT */
  estimate: number
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

export async function getBookings(): Promise<Booking[]> {
  const service = allServices.find((s) => s.id === "split-ac-deep-servicing")!
  return [
    {
      id: "bk-1",
      serviceId: service.id,
      serviceTitle: service.title,
      image: service.image,
      technician: service.technician,
      date: "2026-11-24",
      estimate: service.price,
      status: "cancelled",
      paymentStatus: "unpaid",
    },
  ]
}

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