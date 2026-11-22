import type { StaticImageData } from "next/image"

import acImg from "@/assets/cat-ac.jpg"
import fridgeImg from "@/assets/cat-fridge.jpg"
import electricalImg from "@/assets/cat-electrical.jpg"
import washerImg from "@/assets/cat-washer.jpg"
import type { BookingStatus, PaymentStatus } from "@/lib/dashboard-data"
import type { ServiceApproval } from "@/components/Dashboard/status-badge"

/**
 * Technician dashboard data.
 *
 * SAMPLE DATA — none of this comes from an API yet. Each `get*` function below
 * is the single seam to replace with a real fetch; the components only depend on
 * the exported types, so nothing else needs to change.
 */

export type TechnicianService = {
  id: string
  title: string
  category: string
  /** BDT per visit */
  price: number
  image: StaticImageData
  approval: ServiceApproval
  available: boolean
  /** ISO date, yyyy-MM-dd */
  createdAt: string
}

export type JobAction = "accept" | "reject" | "start" | "complete"

export type JobActionResult = { ok: true } | { ok: false; error: string }

export type JobRequest = {
  id: string
  serviceTitle: string
  image: StaticImageData
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

/** Statuses shown under each "Manage Requests" tab. */
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

const WITHDRAWN_TO_DATE = 4000

const services: TechnicianService[] = [
  {
    id: "svc-1",
    title: "Split AC Deep Servicing",
    category: "AC Repair",
    price: 1800,
    image: acImg,
    approval: "approved",
    available: true,
    createdAt: "2026-10-02",
  },
  {
    id: "svc-2",
    title: "AC Gas Refill & Leak Fix",
    category: "AC Repair",
    price: 3200,
    image: acImg,
    approval: "approved",
    available: true,
    createdAt: "2026-10-09",
  },
  {
    id: "svc-3",
    title: "Refrigerator Cooling Repair",
    category: "Refrigerator",
    price: 2200,
    image: fridgeImg,
    approval: "approved",
    available: false,
    createdAt: "2026-10-18",
  },
  {
    id: "svc-4",
    title: "Home Electrical Wiring Check",
    category: "Electrical",
    price: 1500,
    image: electricalImg,
    approval: "pending",
    available: true,
    createdAt: "2026-11-20",
  },
  {
    id: "svc-5",
    title: "Washing Machine Drum Repair",
    category: "Washing Machine",
    price: 2000,
    image: washerImg,
    approval: "rejected",
    available: false,
    createdAt: "2026-11-05",
  },
]

const jobs: JobRequest[] = [
  {
    id: "job-1",
    serviceTitle: "Split AC Deep Servicing",
    image: acImg,
    customerName: "Nusrat Jahan",
    customerPhone: "+880 1700 000 101",
    area: "Dhanmondi",
    address: "House 12, Road 8, Dhanmondi, Dhaka",
    date: "2026-11-25",
    timeSlot: "10:00 AM – 12:00 PM",
    estimate: 1800,
    status: "requested",
    paymentStatus: "unpaid",
    notes: "Two split units, bedroom and living room.",
  },
  {
    id: "job-2",
    serviceTitle: "Refrigerator Cooling Repair",
    image: fridgeImg,
    customerName: "Farhan Ahmed",
    customerPhone: "+880 1700 000 102",
    area: "Mirpur 10",
    address: "Flat 4B, Block C, Mirpur 10, Dhaka",
    date: "2026-11-26",
    timeSlot: "2:00 PM – 4:00 PM",
    estimate: 2200,
    status: "requested",
    paymentStatus: "unpaid",
  },
  {
    id: "job-3",
    serviceTitle: "AC Gas Refill & Leak Fix",
    image: acImg,
    customerName: "Tasnim Rahman",
    customerPhone: "+880 1700 000 103",
    area: "Uttara Sector 7",
    address: "House 33, Sector 7, Uttara, Dhaka",
    date: "2026-11-24",
    timeSlot: "11:00 AM – 1:00 PM",
    estimate: 3200,
    status: "accepted",
    paymentStatus: "unpaid",
  },
  {
    id: "job-4",
    serviceTitle: "Split AC Deep Servicing",
    image: acImg,
    customerName: "Imran Hossain",
    customerPhone: "+880 1700 000 104",
    area: "Banani",
    address: "Road 11, Block D, Banani, Dhaka",
    date: "2026-11-27",
    timeSlot: "9:00 AM – 11:00 AM",
    estimate: 1800,
    status: "accepted",
    paymentStatus: "unpaid",
  },
  {
    id: "job-5",
    serviceTitle: "Refrigerator Cooling Repair",
    image: fridgeImg,
    customerName: "Sadia Islam",
    customerPhone: "+880 1700 000 105",
    area: "Gulshan 2",
    address: "Apt 7A, Gulshan Avenue, Gulshan 2, Dhaka",
    date: "2026-11-22",
    timeSlot: "3:00 PM – 5:00 PM",
    estimate: 2200,
    status: "in_progress",
    paymentStatus: "unpaid",
  },
  {
    id: "job-6",
    serviceTitle: "Split AC Deep Servicing",
    image: acImg,
    customerName: "Rakib Hasan",
    customerPhone: "+880 1700 000 106",
    area: "Mohammadpur",
    address: "House 5, Lane 3, Mohammadpur, Dhaka",
    date: "2026-11-18",
    timeSlot: "10:00 AM – 12:00 PM",
    estimate: 1800,
    finalAmount: 1900,
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "job-7",
    serviceTitle: "AC Gas Refill & Leak Fix",
    image: acImg,
    customerName: "Mithila Das",
    customerPhone: "+880 1700 000 107",
    area: "Bashundhara R/A",
    address: "Block F, Road 2, Bashundhara R/A, Dhaka",
    date: "2026-11-14",
    timeSlot: "1:00 PM – 3:00 PM",
    estimate: 3200,
    finalAmount: 3500,
    status: "completed",
    paymentStatus: "paid",
  },
  {
    id: "job-8",
    serviceTitle: "Refrigerator Cooling Repair",
    image: fridgeImg,
    customerName: "Arif Chowdhury",
    customerPhone: "+880 1700 000 108",
    area: "Lalmatia",
    address: "Block B, Lalmatia, Dhaka",
    date: "2026-11-20",
    timeSlot: "4:00 PM – 6:00 PM",
    estimate: 2200,
    finalAmount: 2400,
    status: "completed",
    paymentStatus: "unpaid",
  },
  {
    id: "job-9",
    serviceTitle: "Split AC Deep Servicing",
    image: acImg,
    customerName: "Lamia Sultana",
    customerPhone: "+880 1700 000 109",
    area: "Badda",
    address: "Middle Badda, Dhaka",
    date: "2026-11-12",
    timeSlot: "10:00 AM – 12:00 PM",
    estimate: 1800,
    status: "cancelled",
    paymentStatus: "unpaid",
  },
  {
    id: "job-10",
    serviceTitle: "Refrigerator Cooling Repair",
    image: fridgeImg,
    customerName: "Zahid Karim",
    customerPhone: "+880 1700 000 110",
    area: "Rampura",
    address: "Rampura Bridge, Dhaka",
    date: "2026-11-10",
    timeSlot: "2:00 PM – 4:00 PM",
    estimate: 2200,
    status: "rejected",
    paymentStatus: "unpaid",
  },
]

export async function getTechnicianServices(): Promise<TechnicianService[]> {
  return services
}

export async function getJobRequests(): Promise<JobRequest[]> {
  return jobs
}

export async function getEarnings(): Promise<Earning[]> {
  return jobs
    .filter((j) => j.status === "completed" && j.paymentStatus === "paid")
    .map((j) => ({
      id: `earn-${j.id}`,
      jobId: j.id,
      serviceTitle: j.serviceTitle,
      customerName: j.customerName,
      amount: j.finalAmount ?? j.estimate,
      paidAt: j.date,
    }))
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
}

export function summarizeEarnings(list: JobRequest[]): EarningsSummary {
  const amount = (j: JobRequest) => j.finalAmount ?? j.estimate
  const done = list.filter((j) => j.status === "completed")
  const paidJobs = done.filter((j) => j.paymentStatus === "paid")
  const paid = paidJobs.reduce((sum, j) => sum + amount(j), 0)
  const pending = done
    .filter((j) => j.paymentStatus === "unpaid")
    .reduce((sum, j) => sum + amount(j), 0)
  return {
    paid,
    paidJobs: paidJobs.length,
    pending,
    available: Math.max(paid - WITHDRAWN_TO_DATE, 0),
  }
}

/** Share of non-cancelled jobs that reached completion, as a 0–100 integer. */
export function completionRate(list: JobRequest[]): number {
  const counted = list.filter((j) => j.status !== "cancelled")
  if (counted.length === 0) return 0
  const done = counted.filter((j) => j.status === "completed").length
  return Math.round((done / counted.length) * 100)
}

/** Contract for the "Add service" form — pass an `onSubmit` that creates the listing. */
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

export type NewServiceResult = { ok: true } | { ok: false; error: string }

export const SERVICE_DESCRIPTION_MAX = 600
export const DEFAULT_AVAILABILITY = "Sat–Thu, 9:00 AM – 8:00 PM"