import type { StaticImageData } from "next/image"

import type { ServiceApproval } from "@/components/Dashboard/status-badge"
import type { BookingStatus, PaymentStatus } from "@/lib/dashboard-data"

export type TechnicianService = {
  id: string
  title: string
  category: string
  description: string
  availability: string
  /** BDT per visit */
  price: number
  image: StaticImageData | string
  approval: ServiceApproval
  available: boolean
  /** ISO date, yyyy-MM-dd */
  createdAt: string
}

export type JobAction = "accept" | "reject" | "start" | "complete"

export type JobActionResult = { ok: true } | { ok: false; error: string }

export type JobRequest = {
  id: string
  serviceId: string
  serviceTitle: string
  serviceCategory?: string
  serviceDescription?: string
  image: StaticImageData | string
  customerName: string
  customerEmail?: string
  customerImage?: string
  customerArea?: string
  customerPhone: string
  area: string
  address: string
  /** ISO date, yyyy-MM-dd */
  date: string
  timeSlot: string
  /** Estimated visit price, BDT */
  estimate: number
  /** Final amount entered on completion, BDT */
  finalAmount?: number
  jobStartedAt?: string
  jobCompletedAt?: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  notes?: string
}

export type Earning = {
  id: string
  jobId: string
  serviceTitle: string
  customerName: string
  /** BDT */
  amount: number
  /** ISO date, yyyy-MM-dd */
  paidAt: string
}

export type EarningsSummary = {
  customerPaymentsToHomeFix: number
  paidBookings: number
  /** Completed jobs the customer has not paid for yet */
  unpaidCompletedAmount: number
}

export const REQUEST_TABS = [
  { key: "new", label: "New", statuses: ["requested"] },
  { key: "accepted", label: "Accepted", statuses: ["accepted"] },
  { key: "in_progress", label: "In Progress", statuses: ["in_progress"] },
  { key: "completed", label: "Completed", statuses: ["completed"] },
  { key: "closed", label: "Closed", statuses: ["rejected", "cancelled"] },
] as const satisfies readonly {
  key: string
  label: string
  statuses: readonly BookingStatus[]
}[]

export function summarizeEarnings(list: JobRequest[]): EarningsSummary {
  const amount = (job: JobRequest) => job.finalAmount ?? job.estimate
  const completed = list.filter((job) => job.status === "completed")
  const unpaidCompletedAmount = completed
    .filter((job) => job.paymentStatus === "unpaid")
    .reduce((sum, job) => sum + amount(job), 0)
  return {
    customerPaymentsToHomeFix: 0,
    paidBookings: 0,
    unpaidCompletedAmount,
  }
}

/** Share of non-cancelled jobs that reached completion, as a 0–100 integer. */
export function completionRate(list: JobRequest[]): number {
  const counted = list.filter((job) => job.status !== "cancelled")
  if (counted.length === 0) return 0
  const done = counted.filter((job) => job.status === "completed").length
  return Math.round((done / counted.length) * 100)
}

export type NewServiceValues = {
  title: string
  category: string
  /** BDT per visit */
  price: number
  description: string
  availability: string
  acceptingBookings: boolean
  image: File | null
}

export type ServiceUpdateValues = Omit<NewServiceValues, "image">

export type NewServiceResult = { ok: true } | { ok: false; error: string }

export const SERVICE_DESCRIPTION_MAX = 600
export const DEFAULT_AVAILABILITY = "Sat–Thu, 9:00 AM – 8:00 PM"
