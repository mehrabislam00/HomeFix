import type { StaticImageData } from "next/image"
import type { BookingStatus, PaymentStatus } from "@/lib/dashboard-data"
import type { ServiceApproval } from "@/components/Dashboard/status-badge"

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
  bio?: string
  joinedAt: string
  emailVerified?: boolean
  availability?: Record<string, unknown>
  skills?: string[]
  serviceCategories?: string[]
  experience?: number
  banned?: boolean
  bookingCount?: number
  completedBookingCount?: number
  pendingBookingCount?: number
  rejectedBookingCount?: number
  serviceCount?: number
}

export type AdminService = {
  id: string
  title: string
  description: string
  category: string
  /** BDT per visit */
  price: number
  image: StaticImageData | string
  technician: string
  technicianId?: string
  technicianEmail?: string
  available: boolean
  /** ISO date, yyyy-MM-dd */
  submittedAt: string
  approval: ServiceApproval
  estimatedDuration?: string
  serviceMode?: string
  serviceArea?: string
  bookingCount?: number
}

export type ServiceDecision = "approved" | "rejected"
export type ServiceDecisionResult = { ok: true } | { ok: false; error: string }

export type AdminBooking = {
  id: string
  serviceTitle: string
  customer: string
  customerEmail?: string
  technician: string
  technicianEmail?: string
  /** ISO date, yyyy-MM-dd */
  date: string
  /** BDT */
  amount: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  customerPhone?: string
  address?: string
  problemDescription?: string
  finalAmount?: number
}

export type AdminTransaction = {
  id: string
  transactionId: string
  stripeSessionId: string
  bookingId: string
  serviceTitle: string
  customer: string
  customerEmail: string
  technician: string
  technicianEmail: string
  /** BDT */
  amount: number
  currency: string
  paymentStatus: "paid"
  method: string
  /** ISO date, yyyy-MM-dd */
  paidAt: string
}

export type AdminPaymentStatistics = {
  totalPayments: number
  totalRevenue: number
  currency: string
  byStatus: Record<string, number>
}

export type AdminDashboardStats = {
  users: {
    total: number
    customers: number
    technicians: number
    active: number
    banned: number
  }
  services: {
    total: number
    approvalStatuses: Record<string, number>
    pending: number
    approved: number
    rejected: number
  }
  bookings: {
    total: number
    statuses: Record<string, number>
    completed: number
    pending: number
    rejected: number
    cancelled: number
  }
  payments: { available: boolean; message?: string }
}

export type AdminReport = {
  mostActiveTechnicians: {
    _id: string
    bookingCount: number
    completedBookingCount: number
    rejectedBookingCount: number
  }[]
  mostActiveCustomers: {
    _id: string
    bookingCount: number
    completedBookingCount: number
  }[]
  mostBookedServices: {
    _id: string
    serviceTitle: string
    category: string
    bookingCount: number
  }[]
  technicianServiceCounts: { _id: string; serviceCount: number }[]
  categoryServiceCounts: { _id: string; serviceCount: number }[]
  categoryBookingCounts: { _id: string; bookingCount: number }[]
  bookingStatuses: Record<string, number>
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

export function countByStatus(
  counts: Record<string, number>
): { status: BookingStatus; label: string; count: number }[] {
  return BOOKING_STATUS_ORDER.map((status) => ({
    status,
    label: BOOKING_STATUS_LABEL[status],
    count:
      counts[status] ??
      (status === "in_progress" ? counts["in-progress"] : undefined) ??
      0,
  }))
}

export function summarizeTransactions(
  transactions: AdminTransaction[],
  list: AdminBooking[]
) {
  const revenue = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  )
  const awaiting = list.filter(
    (booking) =>
      booking.status === "completed" && booking.paymentStatus === "unpaid"
  )
  return {
    revenue,
    count: transactions.length,
    average: transactions.length
      ? Math.round(revenue / transactions.length)
      : 0,
    awaitingAmount: awaiting.reduce((sum, booking) => sum + booking.amount, 0),
    awaitingJobs: awaiting.length,
  }
}
