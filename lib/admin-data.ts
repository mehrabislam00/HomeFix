import type { StaticImageData } from "next/image"

import acImg from "@/assets/cat-ac.jpg"
import devicesImg from "@/assets/cat-devices.jpg"
import electricalImg from "@/assets/cat-electrical.jpg"
import fridgeImg from "@/assets/cat-fridge.jpg"
import plumbingImg from "@/assets/cat-plumbing.jpg"
import type { BookingStatus, PaymentStatus } from "@/lib/dashboard-data"
import { allServices } from "@/lib/services-data"
import type { ServiceApproval } from "@/components/Dashboard/status-badge"

/**
 * Admin dashboard data.
 *
 * Users are read from the auth database (see `getAdminUsers` in
 * `lib/Action/admin-actions.ts`). Services, bookings and transactions are
 * SAMPLE DATA until those APIs exist: each `get*` function below is the single
 * seam to replace with a real fetch, and the components only depend on the
 * exported types.
 */

export type AdminRole = "admin" | "customer" | "technician"
export type UserStatus = "active" | "suspended"

export type AdminUser = {
  id: string
  name: string
  email: string
  role: AdminRole
  status: UserStatus
  image?: string
  phone?: string
  area?: string
  /** ISO date, yyyy-MM-dd */
  joinedAt: string
}

export type AdminService = {
  id: string
  title: string
  description: string
  category: string
  /** BDT per visit */
  price: number
  image: StaticImageData
  technician: string
  /** ISO date, yyyy-MM-dd */
  submittedAt: string
  approval: ServiceApproval
}

export type ServiceDecision = "approved" | "rejected"
export type ServiceDecisionResult = { ok: true } | { ok: false; error: string }

export type AdminBooking = {
  id: string
  serviceTitle: string
  customer: string
  technician: string
  /** ISO date, yyyy-MM-dd */
  date: string
  /** BDT */
  amount: number
  status: BookingStatus
  paymentStatus: PaymentStatus
}

export type AdminTransaction = {
  id: string
  bookingId: string
  serviceTitle: string
  customer: string
  technician: string
  /** BDT */
  amount: number
  /** ISO date, yyyy-MM-dd */
  paidAt: string
}

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  "requested",
  "accepted",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
]

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

/** Stand-in list used only when the auth database can't be read. */
export const sampleUsers: AdminUser[] = [
  { id: "u-1", name: "Rafiqul Islam", email: "tech@homefix.com", role: "technician", status: "active", joinedAt: "2026-08-24" },
  { id: "u-2", name: "Tanvir Ahmed", email: "tanvir@homefix.com", role: "technician", status: "active", joinedAt: "2026-09-13" },
  { id: "u-3", name: "Sara Khan", email: "customer@homefix.com", role: "customer", status: "active", joinedAt: "2026-10-13" },
  { id: "u-4", name: "Nadia Rahman", email: "nadia@homefix.com", role: "customer", status: "active", joinedAt: "2026-11-02" },
  { id: "u-5", name: "Imran Hossain", email: "imran@homefix.com", role: "customer", status: "active", joinedAt: "2026-11-16" },
]

const pendingSubmissions: AdminService[] = [
  {
    id: "sub-1",
    title: "Smart Switch Installation",
    description:
      "Replace standard switches with smart, app-controlled switches including wiring checks and setup.",
    category: "Electrical",
    price: 45,
    image: electricalImg,
    technician: "Rafiqul Islam",
    submittedAt: "2026-11-22",
    approval: "pending",
  },
  {
    id: "sub-2",
    title: "Water Heater Installation",
    description:
      "Installation of electric and gas geysers including pipe fitting and safety valve setup.",
    category: "Plumbing",
    price: 60,
    image: plumbingImg,
    technician: "Rafiqul Islam",
    submittedAt: "2026-11-21",
    approval: "pending",
  },
  {
    id: "sub-3",
    title: "Fridge Compressor Replacement",
    description:
      "Full compressor replacement with gas charging and 6-month parts warranty.",
    category: "Refrigerator",
    price: 120,
    image: fridgeImg,
    technician: "Tanvir Ahmed",
    submittedAt: "2026-11-19",
    approval: "pending",
  },
]

const rejectedSubmissions: AdminService[] = [
  {
    id: "sub-4",
    title: "Ceiling Fan Repair",
    description:
      "Capacitor, winding and bearing replacement for ceiling and wall fans.",
    category: "Electrical",
    price: 25,
    image: devicesImg,
    technician: "Tanvir Ahmed",
    submittedAt: "2026-11-10",
    approval: "rejected",
  },
]

const submittedDates = [
  "2026-10-02",
  "2026-10-05",
  "2026-10-09",
  "2026-10-14",
  "2026-10-18",
  "2026-10-24",
  "2026-10-29",
]

const approvedServices: AdminService[] = allServices.map((service, index) => ({
  id: service.id,
  title: service.title,
  description: service.description,
  category: service.category,
  price: service.price,
  image: service.image ?? acImg,
  technician: service.technician,
  submittedAt: submittedDates[index % submittedDates.length],
  approval: "approved" as const,
}))

const bookings: AdminBooking[] = [
  { id: "B1", serviceTitle: "Split AC Deep Servicing", customer: "Sara Khan", technician: "Rafiqul Islam", date: "2026-11-05", amount: 50, status: "completed", paymentStatus: "paid" },
  { id: "B2", serviceTitle: "Refrigerator Cooling Repair", customer: "Sara Khan", technician: "Rafiqul Islam", date: "2026-11-19", amount: 65, status: "completed", paymentStatus: "unpaid" },
  { id: "B3", serviceTitle: "Home Electrical Wiring", customer: "Sara Khan", technician: "Rafiqul Islam", date: "2026-11-23", amount: 35, status: "in_progress", paymentStatus: "unpaid" },
  { id: "B4", serviceTitle: "Washing Machine Repair", customer: "Sara Khan", technician: "Tanvir Ahmed", date: "2026-11-24", amount: 40, status: "requested", paymentStatus: "unpaid" },
  { id: "B5", serviceTitle: "Laptop & Device Repair", customer: "Nadia Rahman", technician: "Rafiqul Islam", date: "2026-11-24", amount: 50, status: "accepted", paymentStatus: "unpaid" },
  { id: "B6", serviceTitle: "AC Gas Refill & Leak Fix", customer: "Nadia Rahman", technician: "Tanvir Ahmed", date: "2026-11-11", amount: 80, status: "completed", paymentStatus: "paid" },
  { id: "B7", serviceTitle: "Kitchen & Bath Plumbing", customer: "Imran Hossain", technician: "Tanvir Ahmed", date: "2026-11-21", amount: 30, status: "rejected", paymentStatus: "unpaid" },
  { id: "B8", serviceTitle: "Split AC Deep Servicing", customer: "Nadia Rahman", technician: "Rafiqul Islam", date: "2026-11-25", amount: 45, status: "requested", paymentStatus: "unpaid" },
  { id: "B9", serviceTitle: "Home Electrical Wiring", customer: "Imran Hossain", technician: "Rafiqul Islam", date: "2026-11-17", amount: 35, status: "cancelled", paymentStatus: "unpaid" },
]

export async function getAdminServices(): Promise<AdminService[]> {
  return [...pendingSubmissions, ...rejectedSubmissions, ...approvedServices]
}

export async function getAdminBookings(): Promise<AdminBooking[]> {
  return bookings
}

export async function getAdminTransactions(): Promise<AdminTransaction[]> {
  return bookings
    .filter((b) => b.status === "completed" && b.paymentStatus === "paid")
    .map((b, index) => ({
      id: index === 0 ? "cs_test_a1B2c3D4e5F6" : "cs_test_G7h8I9j0K1l2",
      bookingId: b.id,
      serviceTitle: b.serviceTitle,
      customer: b.customer,
      technician: b.technician,
      amount: b.amount,
      paidAt: b.date,
    }))
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
}

export function countByStatus(list: AdminBooking[]) {
  return BOOKING_STATUS_ORDER.map((status) => ({
    status,
    label: BOOKING_STATUS_LABEL[status],
    count: list.filter((b) => b.status === status).length,
  }))
}

export function summarizeTransactions(
  transactions: AdminTransaction[],
  list: AdminBooking[]
) {
  const revenue = transactions.reduce((sum, t) => sum + t.amount, 0)
  const awaiting = list.filter(
    (b) => b.status === "completed" && b.paymentStatus === "unpaid"
  )
  return {
    revenue,
    count: transactions.length,
    average: transactions.length ? Math.round(revenue / transactions.length) : 0,
    awaitingAmount: awaiting.reduce((sum, b) => sum + b.amount, 0),
    awaitingJobs: awaiting.length,
  }
}