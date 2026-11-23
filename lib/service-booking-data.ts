import type { FeaturedService } from "@/components/home/service-card"
import type { ServiceApproval } from "@/components/Dashboard/status-badge"
import type {
  Booking,
  BookingStatus,
  PaymentStatus,
} from "@/lib/dashboard-data"
import type { JobRequest, TechnicianService } from "@/lib/technician-data"
import {
  defaultAvailability,
  serviceImageForCategory,
} from "@/lib/services-data"

export type ApiRecord = Record<string, unknown>

export type ServiceListing = FeaturedService & {
  approval: ServiceApproval
  available: boolean
  availability: string
  technicianId: string
  createdAt: string
  technicianArea: string
  technicianPhone?: string
}

function record(value: unknown): ApiRecord | undefined {
  return typeof value === "object" && value !== null
    ? (value as ApiRecord)
    : undefined
}

function firstRecord(...values: unknown[]): ApiRecord | undefined {
  for (const value of values) {
    const found = record(value)
    if (found) return found
  }
  return undefined
}

function stringValue(...values: unknown[]): string | undefined {
  return values.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  )
}

function numberValue(...values: unknown[]): number | undefined {
  for (const value of values) {
    const number =
      typeof value === "number"
        ? value
        : typeof value === "string" && value.trim()
          ? Number(value)
          : Number.NaN
    if (Number.isFinite(number)) return number
  }
  return undefined
}

function identifier(value: unknown): string | undefined {
  if (typeof value === "string" && value) return value
  const object = record(value)
  if (!object) return undefined
  if (typeof object.$oid === "string") return object.$oid
  if (typeof object.id === "string") return object.id
  if (typeof object._id === "string") return object._id
  return undefined
}

function idOf(source: ApiRecord, ...keys: string[]): string {
  for (const key of keys) {
    const id = identifier(source[key])
    if (id) return id
  }
  throw new Error("The API returned a record without an identifier.")
}

function asDate(...values: unknown[]): string {
  const value = stringValue(...values)
  if (!value) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

function requiredText(label: string, ...values: unknown[]): string {
  const value = stringValue(...values)?.trim()
  if (!value) throw new Error(`The API returned a service without ${label}.`)
  return value
}

function approvalOf(source: ApiRecord): ServiceApproval {
  const raw = stringValue(
    source.approval,
    source.approvalStatus,
    source.reviewStatus,
    source.status
  )?.toLowerCase()
  if (raw === "approved" || source.isApproved === true) return "approved"
  if (raw === "rejected") return "rejected"
  return "pending"
}

function isAvailable(source: ApiRecord): boolean {
  const raw = source.acceptingBookings ?? source.available ?? source.isAvailable
  return typeof raw === "boolean" ? raw : true
}

function unwrapRecord(value: unknown, keys: string[]): ApiRecord {
  let current = record(value)
  for (let depth = 0; current && depth < 3; depth += 1) {
    const nested = keys
      .map((key) => current?.[key])
      .find((item) => record(item))
    if (!nested) return current
    current = record(nested)
  }
  if (!current) throw new Error("The API returned an invalid record.")
  return current
}

export function unwrapCollection(value: unknown, keys: string[]): unknown[] {
  if (Array.isArray(value)) return value
  const object = record(value)
  if (object) {
    for (const key of keys) {
      if (Array.isArray(object[key])) return object[key] as unknown[]
    }
    if (object.data !== undefined) return unwrapCollection(object.data, keys)
  }
  throw new Error("The API returned an invalid list.")
}

export function normalizeService(value: unknown): ServiceListing {
  const source = unwrapRecord(value, ["service", "data"])
  const technician = firstRecord(source.technician, source.provider)
  const technicianName =
    stringValue(
      source.technicianName,
      source.providerName,
      technician?.name,
      technician?.fullName
    ) ?? "Technician"
  const category = requiredText("a category", source.category)
  const image =
    stringValue(source.image, source.imageUrl, source.photoUrl) ??
    serviceImageForCategory(category)
  const id = idOf(source, "_id", "id", "serviceId")
  const price = numberValue(source.price, source.startingPrice, source.amount)
  if (price === undefined || price <= 0) {
    throw new Error(`The API returned an invalid price for service ${id}.`)
  }
  const rating =
    numberValue(source.rating, source.averageRating, source.average_rating) ?? 0
  const reviews =
    numberValue(source.reviews, source.reviewCount, source.ratingsCount) ?? 0
  const technicianId =
    identifier(source.technicianId) ??
    identifier(technician?._id) ??
    identifier(technician?.id) ??
    ""

  return {
    id,
    title: requiredText(
      "a title",
      source.title,
      source.name,
      source.serviceName
    ),
    description:
      stringValue(source.description, source.details, source.about) ?? "",
    category,
    image,
    rating,
    reviews,
    price,
    technician: technicianName,
    href: `/services/${encodeURIComponent(id)}`,
    approval: approvalOf(source),
    available: isAvailable(source),
    availability:
      stringValue(source.availability, source.schedule) ?? defaultAvailability,
    technicianId,
    createdAt: asDate(source.createdAt, source.updatedAt, source.submittedAt),
    technicianArea:
      stringValue(
        source.technicianArea,
        technician?.area,
        technician?.address
      ) ?? "Area not provided",
    technicianPhone: stringValue(source.technicianPhone, technician?.phone),
  }
}

function statusOf(value: unknown): BookingStatus {
  const raw = stringValue(value)
    ?.toLowerCase()
    .replace(/[\s-]+/g, "_")
  if (
    raw === "requested" ||
    raw === "pending" ||
    raw === "accepted" ||
    raw === "in_progress" ||
    raw === "completed" ||
    raw === "rejected" ||
    raw === "cancelled" ||
    raw === "canceled"
  ) {
    if (raw === "pending") return "requested"
    if (raw === "canceled") return "cancelled"
    return raw
  }
  throw new Error("The API returned a booking with an unknown status.")
}

function paymentStatusOf(value: unknown): PaymentStatus {
  return stringValue(value)?.toLowerCase() === "paid" ? "paid" : "unpaid"
}

function bookingFields(value: unknown) {
  const source = unwrapRecord(value, ["booking", "data"])
  const service = firstRecord(
    source.service,
    source.serviceDetails,
    source.serviceId
  )
  const customer = firstRecord(
    source.customer,
    source.customerDetails,
    source.customerId
  )
  const technician = firstRecord(
    source.technician,
    source.technicianDetails,
    source.technicianId
  )
  return { source, service, customer, technician }
}

function serviceForBooking(
  source: ApiRecord,
  service: ApiRecord | undefined,
  lookup: Map<string, ServiceListing>
): ServiceListing | undefined {
  const serviceId = identifier(source.serviceId) ?? identifier(service)
  const found = serviceId ? lookup.get(serviceId) : undefined
  if (found) return found
  if (
    service &&
    identifier(service._id ?? service.id ?? service.serviceId) &&
    stringValue(service.title, service.name, service.serviceName) &&
    stringValue(service.category) &&
    numberValue(service.price, service.startingPrice, service.amount) !==
      undefined
  ) {
    return normalizeService(service)
  }
  return undefined
}

function bookingEstimate(
  source: ApiRecord,
  service: ApiRecord | undefined,
  serviceInfo: ServiceListing | undefined
): number {
  const estimate = numberValue(
    source.estimatedAmount,
    source.estimate,
    source.amount,
    service?.price,
    serviceInfo?.price
  )
  if (estimate === undefined || estimate <= 0) {
    throw new Error(
      "The API returned a booking without a valid estimated amount."
    )
  }
  return estimate
}

export function normalizeCustomerBooking(
  value: unknown,
  lookup: Map<string, ServiceListing>
): Booking {
  const { source, service, technician } = bookingFields(value)
  const serviceInfo = serviceForBooking(source, service, lookup)
  const serviceId =
    identifier(source.serviceId) ?? identifier(service) ?? serviceInfo?.id ?? ""
  const date = asDate(
    source.date,
    source.bookingDate,
    source.scheduledDate,
    source.createdAt
  )
  return {
    id: idOf(source, "_id", "id", "bookingId"),
    serviceId,
    serviceTitle: requiredText(
      "a service title",
      source.serviceTitle,
      source.serviceName,
      service?.title,
      service?.name,
      serviceInfo?.title
    ),
    image: serviceInfo?.image ?? serviceImageForCategory(""),
    technician:
      stringValue(source.technicianName, technician?.name) ??
      serviceInfo?.technician ??
      "Technician",
    date,
    estimate: bookingEstimate(source, service, serviceInfo),
    finalAmount: numberValue(source.finalAmount),
    address: stringValue(source.address, source.serviceAddress),
    phone: stringValue(source.phone, source.customerPhone),
    notes: stringValue(source.notes, source.description),
    status: statusOf(source.status ?? source.bookingStatus),
    paymentStatus: paymentStatusOf(source.paymentStatus),
  }
}

export function normalizeTechnicianBooking(
  value: unknown,
  lookup: Map<string, ServiceListing>
): JobRequest {
  const { source, service, customer } = bookingFields(value)
  const serviceInfo = serviceForBooking(source, service, lookup)
  const serviceId =
    identifier(source.serviceId) ?? identifier(service) ?? serviceInfo?.id ?? ""
  const date = asDate(
    source.date,
    source.bookingDate,
    source.scheduledDate,
    source.createdAt
  )
  return {
    id: idOf(source, "_id", "id", "bookingId"),
    serviceId,
    serviceTitle: requiredText(
      "a service title",
      source.serviceTitle,
      source.serviceName,
      service?.title,
      service?.name,
      serviceInfo?.title
    ),
    image: serviceInfo?.image ?? serviceImageForCategory(""),
    customerName:
      stringValue(source.customerName, customer?.name, customer?.fullName) ??
      "Customer",
    customerPhone:
      stringValue(source.customerPhone, customer?.phone, source.phone) ?? "",
    area: stringValue(source.area, source.customerArea, customer?.area) ?? "",
    address:
      stringValue(source.address, source.serviceAddress, customer?.address) ??
      "",
    date,
    timeSlot: stringValue(source.timeSlot, source.slot) ?? "",
    estimate: bookingEstimate(source, service, serviceInfo),
    finalAmount: numberValue(source.finalAmount),
    status: statusOf(source.status ?? source.bookingStatus),
    paymentStatus: paymentStatusOf(source.paymentStatus),
    notes: stringValue(source.notes, source.description),
  }
}

export function normalizeTechnicianService(value: unknown): TechnicianService {
  const service = normalizeService(value)
  return {
    id: service.id,
    title: service.title,
    category: service.category,
    description: service.description,
    availability: service.availability,
    price: service.price,
    image: service.image,
    approval: service.approval,
    available: service.available,
    createdAt: service.createdAt,
  }
}

export function serviceLookup(
  values: unknown[],
  normalizer: (value: unknown) => ServiceListing = normalizeService
): Map<string, ServiceListing> {
  return new Map(
    values.map((value) => {
      const service = normalizer(value)
      return [service.id, service]
    })
  )
}
