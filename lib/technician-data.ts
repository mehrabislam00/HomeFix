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
  image: StaticImageData | string
  customerName: string
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
  paid: number
  paidJobs: number
  /** Completed jobs the customer has not paid for yet */
  pending: number
  /** Paid earnings minus payouts already withdrawn */
  available: number
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

export function getEarnings(jobs: JobRequest[]): Earning[] {
  return jobs
    .filter((job) => job.status === "completed" && job.paymentStatus === "paid")
    .map((job) => ({
      id: `earn-${job.id}`,
      jobId: job.id,
      serviceTitle: job.serviceTitle,
      customerName: job.customerName,
      amount: job.finalAmount ?? job.estimate,
      paidAt: job.date,
    }))
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
}

export function summarizeEarnings(list: JobRequest[]): EarningsSummary {
  const amount = (job: JobRequest) => job.finalAmount ?? job.estimate
  const completed = list.filter((job) => job.status === "completed")
  const paidJobs = completed.filter((job) => job.paymentStatus === "paid")
  const paid = paidJobs.reduce((sum, job) => sum + amount(job), 0)
  const pending = completed
    .filter((job) => job.paymentStatus === "unpaid")
    .reduce((sum, job) => sum + amount(job), 0)
  return { paid, paidJobs: paidJobs.length, pending, available: paid }
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
