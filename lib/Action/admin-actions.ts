"use server"

import { revalidatePath, updateTag } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { authenticatedBackendFetch } from "@/lib/server-jwt"
import {
  type AdminBooking,
  type AdminDashboardStats,
  type AdminPaymentStatistics,
  type AdminReport,
  type AdminRole,
  type AdminService,
  type AdminTransaction,
  type AdminUser,
  type ServiceDecision,
  type UserStatus,
} from "@/lib/admin-data"
import { serviceImageForCategory } from "@/lib/services-data"
import {
  profileCacheTag,
  publicServiceCatalogMutationTags,
  publicServiceMutationTags,
} from "@/lib/cache-tags"
import type { Customer } from "@/lib/dashboard-data"
import type {
  ProfileLoadResult,
  ProfileResult,
  ProfileValues,
} from "@/lib/profile-types"

const ADMIN_PATH = "/admin-dashboard"

type ApiRecord = Record<string, unknown>
type AdminMutationResult = { ok: true } | { ok: false; error: string }
type AdminUsersResult = {
  users: AdminUser[]
  live: boolean
  total: number
  error?: string
}

class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "AdminApiError"
  }
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined
}

function asDate(value: unknown): string {
  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    !(value instanceof Date)
  ) {
    return ""
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

function isRecord(value: unknown): value is ApiRecord {
  return typeof value === "object" && value !== null
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function recordId(value: unknown): string {
  if (typeof value === "string") return value
  if (!isRecord(value)) return ""
  if (typeof value.$oid === "string") return value.$oid
  if (typeof value.id === "string") return value.id
  try {
    const id = String(value)
    return id === "[object Object]" ? "" : id
  } catch {
    return ""
  }
}

function normalizeAdminUser(value: unknown): AdminUser {
  if (!isRecord(value))
    throw new Error("The admin API returned an invalid user.")
  if (
    value.role !== "admin" &&
    value.role !== "technician" &&
    value.role !== "customer"
  ) {
    throw new Error("The admin API returned a user with an invalid role.")
  }
  const role: AdminRole = value.role
  const status: UserStatus = value.banned === true ? "suspended" : "active"
  return {
    id: recordId(value._id ?? value.id ?? value.userId),
    name: text(value.name, "Unnamed user"),
    email: text(value.email),
    role,
    status,
    image: asOptionalString(value.image),
    phone: asOptionalString(value.phone),
    area: asOptionalString(value.area),
    bio: asOptionalString(value.bio),
    joinedAt: asDate(value.createdAt ?? value.joinedAt),
    emailVerified: value.emailVerified === true,
    availability: isRecord(value.availability) ? value.availability : undefined,
    skills: Array.isArray(value.skills)
      ? value.skills.filter((item): item is string => typeof item === "string")
      : undefined,
    serviceCategories: Array.isArray(value.serviceCategories)
      ? value.serviceCategories.filter(
          (item): item is string => typeof item === "string"
        )
      : undefined,
    experience:
      typeof value.experience === "number" ? value.experience : undefined,
    banned: value.banned === true,
    bookingCount:
      typeof value.bookingCount === "number" ? value.bookingCount : undefined,
    completedBookingCount:
      typeof value.completedBookingCount === "number"
        ? value.completedBookingCount
        : undefined,
    pendingBookingCount:
      typeof value.pendingBookingCount === "number"
        ? value.pendingBookingCount
        : undefined,
    rejectedBookingCount:
      typeof value.rejectedBookingCount === "number"
        ? value.rejectedBookingCount
        : undefined,
    serviceCount:
      typeof value.serviceCount === "number" ? value.serviceCount : undefined,
  }
}

function normalizeAdminService(value: unknown): AdminService {
  if (!isRecord(value)) {
    throw new Error("The admin API returned an invalid service.")
  }
  const category = text(value.category)
  const approval =
    value.approvalStatus === "approved" || value.approvalStatus === "rejected"
      ? value.approvalStatus
      : "pending"
  return {
    id: recordId(value._id ?? value.id),
    title: text(value.title, "Untitled service"),
    description: text(value.description),
    category,
    price: number(value.basePrice ?? value.price),
    image:
      asOptionalString(value.image) ??
      asOptionalString(value.imageUrl) ??
      serviceImageForCategory(category),
    technician: text(value.technicianName, "Technician"),
    technicianId: asOptionalString(value.technicianId),
    technicianEmail: asOptionalString(value.technicianEmail),
    available:
      typeof value.isAvailable === "boolean" ? value.isAvailable : true,
    submittedAt: asDate(value.createdAt ?? value.submittedAt),
    approval,
    estimatedDuration: asOptionalString(value.estimatedDuration),
    serviceMode: asOptionalString(value.serviceMode),
    serviceArea: asOptionalString(value.serviceArea),
    bookingCount:
      typeof value.bookingCount === "number" ? value.bookingCount : undefined,
  }
}

function bookingStatus(value: unknown): AdminBooking["status"] {
  const status = text(value)
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
  if (
    status === "requested" ||
    status === "accepted" ||
    status === "in_progress" ||
    status === "completed" ||
    status === "rejected" ||
    status === "cancelled" ||
    status === "canceled"
  ) {
    return status === "canceled" ? "cancelled" : status
  }
  throw new Error("The admin API returned a booking with an invalid status.")
}

function normalizeAdminBooking(value: unknown): AdminBooking {
  if (!isRecord(value)) {
    throw new Error("The admin API returned an invalid booking.")
  }
  const preferredDate = value.preferredDate ?? value.date ?? value.createdAt
  return {
    id: recordId(value._id ?? value.id),
    serviceTitle: text(value.serviceTitle, "Service"),
    customer: text(
      value.customerName,
      isRecord(value.customer) ? text(value.customer.name) : "Customer"
    ),
    customerEmail: asOptionalString(value.customerEmail),
    technician: text(
      value.technicianName,
      isRecord(value.technician) ? text(value.technician.name) : "Technician"
    ),
    technicianEmail: asOptionalString(value.technicianEmail),
    date: asDate(preferredDate),
    amount: number(value.finalAmount ?? value.basePrice),
    status: bookingStatus(value.status ?? value.bookingStatus),
    paymentStatus: value.paymentStatus === "paid" ? "paid" : "unpaid",
    customerPhone: asOptionalString(value.customerPhone),
    address: asOptionalString(value.address),
    problemDescription: asOptionalString(value.problemDescription),
    finalAmount:
      typeof value.finalAmount === "number" ? value.finalAmount : undefined,
  }
}

function collection(value: unknown, key?: string): unknown[] {
  if (Array.isArray(value)) return value
  if (isRecord(value)) {
    if (key && Array.isArray(value[key])) return value[key] as unknown[]
    if (Array.isArray(value.data)) return value.data
  }
  throw new Error("The admin API returned an invalid list.")
}

async function getAdminId(): Promise<string> {
  const access = await getAdminSession()
  if (!access.ok) throw new Error(access.error)
  return access.session.user.id
}

async function requestAdminApi(
  adminId: string,
  path: string,
  init: RequestInit = {}
): Promise<unknown> {
  const apiPath = `/admin/${encodeURIComponent(adminId)}${path}`
  const response = await authenticatedBackendFetch(apiPath, init)
  const body = await response.text()
  let data: unknown
  if (body) {
    try {
      data = JSON.parse(body)
    } catch {
      data = body
    }
  }
  if (!response.ok) {
    const message = isRecord(data)
      ? text(data.message, text(data.error))
      : typeof data === "string"
        ? data
        : ""
    throw new AdminApiError(
      message || `Admin API request failed with HTTP ${response.status}.`,
      response.status
    )
  }
  return data
}

function queryString(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, value)
  }
  const value = query.toString()
  return value ? `?${value}` : ""
}

function revalidateAdminData(...paths: string[]) {
  revalidatePath(ADMIN_PATH)
  for (const path of paths) revalidatePath(`${ADMIN_PATH}/${path}`)
}

async function mutateAdmin(
  label: string,
  path: string,
  method: "PATCH" | "DELETE",
  body?: Record<string, unknown>,
  revalidate: string[] = [],
  cacheTags: string[] = []
): Promise<AdminMutationResult> {
  try {
    const adminId = await getAdminId()
    await requestAdminApi(adminId, path, {
      method,
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    revalidateAdminData(...revalidate)
    for (const tag of cacheTags) updateTag(tag)
    return { ok: true }
  } catch (error) {
    console.error(`Unable to ${label}.`, error)
    return {
      ok: false,
      error: error instanceof Error ? error.message : `Unable to ${label}.`,
    }
  }
}

/** Every admin action re-checks the session: server actions are public endpoints. */
async function getAdminSession() {
  let session: Awaited<ReturnType<typeof auth.api.getSession>>
  try {
    session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    })
  } catch (error) {
    console.error("Unable to verify the admin session.", error)
    return {
      ok: false as const,
      unauthorized: false,
      error: "Unable to verify your session. Please try again.",
    }
  }

  if (!session) {
    return {
      ok: false as const,
      unauthorized: true,
      redirectTo: "/admin/login",
      error: "Sign in to access the admin console.",
    }
  }

  const role: string = session.user.role
  if (role !== "admin") {
    return {
      ok: false as const,
      unauthorized: true,
      redirectTo:
        role === "technician"
          ? "/technician-dashboard"
          : role === "customer"
            ? "/customer-dashboard"
            : "/admin/login",
      error: "Sign in with an administrator account.",
    }
  }

  return { ok: true as const, session }
}

export async function getAdminProfile(): Promise<ProfileLoadResult> {
  const access = await getAdminSession()
  if (!access.ok) return access

  const user = access.session.user
  const customer: Customer = {
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified === true,
    image: user.image ?? undefined,
    role: "admin",
    phone: asOptionalString(user.phone),
    address: asOptionalString(user.area),
    bio: asOptionalString(user.bio),
    memberSince: asDate(user.createdAt),
    profileUpdatedAt: asDate(user.updatedAt),
  }
  return { ok: true, customer }
}

export async function updateAdminProfile(
  values: ProfileValues
): Promise<ProfileResult> {
  try {
    const access = await getAdminSession()
    if (!access.ok) return { ok: false, error: access.error }

    if (
      !values ||
      typeof values.name !== "string" ||
      typeof values.phone !== "string" ||
      typeof values.area !== "string" ||
      typeof values.bio !== "string"
    ) {
      return { ok: false, error: "The profile details are invalid." }
    }

    const name = values.name.trim()
    if (!name) return { ok: false, error: "Full name is required." }

    await auth.api.updateUser({
      headers: await headers(),
      body: {
        name,
        phone: values.phone.trim(),
        area: values.area.trim(),
        bio: values.bio.trim(),
      },
    })

    revalidatePath(ADMIN_PATH)
    revalidatePath(`${ADMIN_PATH}/profile`)
    return { ok: true }
  } catch (error) {
    console.error("Unable to update the admin profile.", error)
    return {
      ok: false,
      error: "Unable to save your profile. Please try again.",
    }
  }
}

export async function getAdminUsers(): Promise<AdminUsersResult> {
  try {
    const adminId = await getAdminId()
    const firstPage = await requestAdminApi(
      adminId,
      `/users${queryString({ page: "1", limit: "100" })}`
    )
    if (!isRecord(firstPage) || !Array.isArray(firstPage.users)) {
      throw new Error("The admin API returned an invalid user list.")
    }

    const total = number(firstPage.total, firstPage.users.length)
    const pageCount = Math.ceil(total / number(firstPage.limit, 100))
    const otherPages = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
        requestAdminApi(
          adminId,
          `/users${queryString({
            page: String(index + 2),
            limit: "100",
          })}`
        )
      )
    )
    const pages = [firstPage, ...otherPages]
    const users = pages.flatMap((page) => {
      if (!isRecord(page) || !Array.isArray(page.users)) {
        throw new Error("The admin API returned an invalid user page.")
      }
      return page.users.map(normalizeAdminUser)
    })
    return { users, live: true, total }
  } catch (error) {
    console.error("Unable to load users for the admin dashboard.", error)
    return {
      users: [],
      live: false,
      total: 0,
      error:
        error instanceof Error ? error.message : "Unable to load admin users.",
    }
  }
}

async function getAdminPagedUsers(path: string): Promise<AdminUser[]> {
  const adminId = await getAdminId()
  const firstPage = await requestAdminApi(
    adminId,
    `${path}${queryString({ page: "1", limit: "100" })}`
  )
  if (!isRecord(firstPage) || !Array.isArray(firstPage.users)) {
    throw new Error("The admin API returned an invalid account list.")
  }
  const pageCount = Math.ceil(
    number(firstPage.total, firstPage.users.length) /
      number(firstPage.limit, 100)
  )
  const otherPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      requestAdminApi(
        adminId,
        `${path}${queryString({
          page: String(index + 2),
          limit: "100",
        })}`
      )
    )
  )
  return [firstPage, ...otherPages].flatMap((page) => {
    if (!isRecord(page) || !Array.isArray(page.users)) {
      throw new Error("The admin API returned an invalid account page.")
    }
    return page.users.map(normalizeAdminUser)
  })
}

export async function getAdminCustomers(): Promise<AdminUser[]> {
  return getAdminPagedUsers("/customers")
}

export async function getAdminCustomer(customerId: string): Promise<AdminUser> {
  const adminId = await getAdminId()
  return normalizeAdminUser(
    await requestAdminApi(
      adminId,
      `/customers/${encodeURIComponent(customerId)}`
    )
  )
}

export async function getAdminCustomerBookings(
  customerId: string
): Promise<AdminBooking[]> {
  const adminId = await getAdminId()
  return collection(
    await requestAdminApi(
      adminId,
      `/customers/${encodeURIComponent(customerId)}/bookings`
    )
  ).map(normalizeAdminBooking)
}

export async function updateAdminCustomer(
  customerId: string,
  values: Record<string, unknown>
): Promise<AdminMutationResult> {
  return mutateAdmin(
    "update customer",
    `/customers/${encodeURIComponent(customerId)}`,
    "PATCH",
    values,
    ["users"],
    [profileCacheTag("customer", customerId)]
  )
}

export async function deleteAdminCustomer(
  customerId: string
): Promise<AdminMutationResult> {
  return mutateAdmin(
    "delete customer",
    `/customers/${encodeURIComponent(customerId)}`,
    "DELETE",
    undefined,
    ["users"],
    [profileCacheTag("customer", customerId)]
  )
}

export async function getAdminTechnicians(): Promise<AdminUser[]> {
  return getAdminPagedUsers("/technicians")
}

export async function getAdminTechnician(
  technicianId: string
): Promise<AdminUser> {
  const adminId = await getAdminId()
  return normalizeAdminUser(
    await requestAdminApi(
      adminId,
      `/technicians/${encodeURIComponent(technicianId)}`
    )
  )
}

export async function getAdminTechnicianServices(
  technicianId: string
): Promise<AdminService[]> {
  const adminId = await getAdminId()
  return collection(
    await requestAdminApi(
      adminId,
      `/technicians/${encodeURIComponent(technicianId)}/services`
    )
  ).map(normalizeAdminService)
}

export async function getAdminTechnicianBookings(
  technicianId: string
): Promise<AdminBooking[]> {
  const adminId = await getAdminId()
  return collection(
    await requestAdminApi(
      adminId,
      `/technicians/${encodeURIComponent(technicianId)}/bookings`
    )
  ).map(normalizeAdminBooking)
}

export async function updateAdminTechnician(
  technicianId: string,
  values: Record<string, unknown>
): Promise<AdminMutationResult> {
  return mutateAdmin(
    "update technician",
    `/technicians/${encodeURIComponent(technicianId)}`,
    "PATCH",
    values,
    ["users"],
    [profileCacheTag("technician", technicianId)]
  )
}

export async function deleteAdminTechnician(
  technicianId: string
): Promise<AdminMutationResult> {
  return mutateAdmin(
    "delete technician",
    `/technicians/${encodeURIComponent(technicianId)}`,
    "DELETE",
    undefined,
    ["users", "approvals"],
    [
      profileCacheTag("technician", technicianId),
      ...publicServiceCatalogMutationTags(),
    ]
  )
}

export async function getAdminUser(userId: string): Promise<AdminUser> {
  const adminId = await getAdminId()
  return normalizeAdminUser(
    await requestAdminApi(adminId, `/users/${encodeURIComponent(userId)}`)
  )
}

export async function updateAdminUser(
  userId: string,
  values: Record<string, unknown>
): Promise<AdminMutationResult> {
  return mutateAdmin(
    "update user",
    `/users/${encodeURIComponent(userId)}`,
    "PATCH",
    values,
    ["users"],
    [profileCacheTag("customer", userId), profileCacheTag("technician", userId)]
  )
}

export async function setAdminUserBanned(
  userId: string,
  banned: boolean
): Promise<AdminMutationResult> {
  if (typeof banned !== "boolean") {
    return { ok: false, error: "Choose a valid access status." }
  }
  return mutateAdmin(
    banned ? "suspend user" : "restore user access",
    `/users/${encodeURIComponent(userId)}/ban`,
    "PATCH",
    { banned },
    ["users"]
  )
}

export async function deleteAdminUser(
  userId: string
): Promise<AdminMutationResult> {
  return mutateAdmin(
    "delete user",
    `/users/${encodeURIComponent(userId)}`,
    "DELETE",
    undefined,
    ["users"],
    [
      profileCacheTag("customer", userId),
      profileCacheTag("technician", userId),
      ...publicServiceCatalogMutationTags(),
    ]
  )
}

export async function getAdminUserActivity(userId: string): Promise<{
  user: AdminUser
  services: AdminService[]
  bookings: AdminBooking[]
  bookingCount: number
  completedBookingCount: number
}> {
  const adminId = await getAdminId()
  const result = await requestAdminApi(
    adminId,
    `/users/${encodeURIComponent(userId)}/activity`
  )
  if (!isRecord(result)) {
    throw new Error("The admin API returned invalid user activity.")
  }
  return {
    user: normalizeAdminUser(result.user),
    services: collection(result, "services").map(normalizeAdminService),
    bookings: collection(result, "bookings").map(normalizeAdminBooking),
    bookingCount: number(result.bookingCount),
    completedBookingCount: number(result.completedBookingCount),
  }
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const adminId = await getAdminId()
  const result = await requestAdminApi(adminId, "/dashboard")
  if (!isRecord(result)) {
    throw new Error("The admin API returned invalid dashboard statistics.")
  }
  const users = isRecord(result.users) ? result.users : {}
  const services = isRecord(result.services) ? result.services : {}
  const bookings = isRecord(result.bookings) ? result.bookings : {}
  const payments = isRecord(result.payments) ? result.payments : {}
  const countMap = (value: unknown): Record<string, number> =>
    isRecord(value)
      ? Object.fromEntries(
          Object.entries(value).map(([key, count]) => [key, number(count)])
        )
      : {}
  return {
    users: {
      total: number(users.total),
      customers: number(users.customers),
      technicians: number(users.technicians),
      active: number(users.active),
      banned: number(users.banned),
    },
    services: {
      total: number(services.total),
      approvalStatuses: countMap(services.approvalStatuses),
      pending: number(services.pending),
      approved: number(services.approved),
      rejected: number(services.rejected),
    },
    bookings: {
      total: number(bookings.total),
      statuses: countMap(bookings.statuses),
      completed: number(bookings.completed),
      pending: number(bookings.pending),
      rejected: number(bookings.rejected),
      cancelled: number(bookings.cancelled),
    },
    payments: {
      available: payments.available === true,
      message: asOptionalString(payments.message),
    },
  }
}

export async function getAdminServices(
  filters: {
    category?: string
    approvalStatus?: string
    isAvailable?: boolean
    technicianId?: string
  } = {}
): Promise<AdminService[]> {
  const adminId = await getAdminId()
  const query = queryString({
    category: filters.category,
    approvalStatus: filters.approvalStatus,
    isAvailable:
      filters.isAvailable === undefined
        ? undefined
        : String(filters.isAvailable),
    technicianId: filters.technicianId,
  })
  return collection(await requestAdminApi(adminId, `/services${query}`)).map(
    normalizeAdminService
  )
}

export async function getPendingAdminServices(): Promise<AdminService[]> {
  const adminId = await getAdminId()
  return collection(await requestAdminApi(adminId, "/services/pending")).map(
    normalizeAdminService
  )
}

export async function getAdminService(
  serviceId: string
): Promise<AdminService> {
  const adminId = await getAdminId()
  return normalizeAdminService(
    await requestAdminApi(adminId, `/services/${encodeURIComponent(serviceId)}`)
  )
}

export async function updateAdminService(
  serviceId: string,
  values: Record<string, unknown>
): Promise<AdminMutationResult> {
  return mutateAdmin(
    "update service",
    `/services/${encodeURIComponent(serviceId)}`,
    "PATCH",
    values,
    ["approvals"],
    publicServiceMutationTags(serviceId)
  )
}

export async function decideAdminService(
  serviceId: string,
  decision: ServiceDecision
): Promise<AdminMutationResult> {
  if (decision !== "approved" && decision !== "rejected") {
    return { ok: false, error: "Choose a valid service decision." }
  }
  return mutateAdmin(
    `mark service ${decision}`,
    `/services/${encodeURIComponent(serviceId)}/approval`,
    "PATCH",
    { approvalStatus: decision },
    ["approvals"],
    publicServiceMutationTags(serviceId)
  )
}

export async function deleteAdminService(
  serviceId: string
): Promise<AdminMutationResult> {
  return mutateAdmin(
    "delete service",
    `/services/${encodeURIComponent(serviceId)}`,
    "DELETE",
    undefined,
    ["approvals"],
    publicServiceMutationTags(serviceId)
  )
}

export async function getAdminBookings(
  filters: {
    status?: string
    from?: string
    to?: string
    customerId?: string
    technicianId?: string
  } = {}
): Promise<AdminBooking[]> {
  const adminId = await getAdminId()
  return collection(
    await requestAdminApi(adminId, `/bookings${queryString(filters)}`)
  ).map(normalizeAdminBooking)
}

export async function getAdminBooking(
  bookingId: string
): Promise<AdminBooking> {
  const adminId = await getAdminId()
  return normalizeAdminBooking(
    await requestAdminApi(adminId, `/bookings/${encodeURIComponent(bookingId)}`)
  )
}

export async function updateAdminBooking(
  bookingId: string,
  values: Record<string, unknown>
): Promise<AdminMutationResult> {
  return mutateAdmin(
    "update booking",
    `/bookings/${encodeURIComponent(bookingId)}`,
    "PATCH",
    values,
    ["all-bookings"]
  )
}

export async function getAdminReports(): Promise<AdminReport> {
  const adminId = await getAdminId()
  const result = await requestAdminApi(adminId, "/reports")
  if (!isRecord(result)) {
    throw new Error("The admin API returned invalid reports.")
  }
  const reportRows = (key: string) =>
    collection(result, key).map((value) => {
      if (!isRecord(value)) {
        throw new Error(`The admin API returned an invalid ${key} report row.`)
      }
      return value
    })
  return {
    mostActiveTechnicians: reportRows("mostActiveTechnicians").map((row) => ({
      _id: text(row._id),
      bookingCount: number(row.bookingCount),
      completedBookingCount: number(row.completedBookingCount),
      rejectedBookingCount: number(row.rejectedBookingCount),
    })),
    mostActiveCustomers: reportRows("mostActiveCustomers").map((row) => ({
      _id: text(row._id),
      bookingCount: number(row.bookingCount),
      completedBookingCount: number(row.completedBookingCount),
    })),
    mostBookedServices: reportRows("mostBookedServices").map((row) => ({
      _id: text(row._id),
      serviceTitle: text(row.serviceTitle),
      category: text(row.category),
      bookingCount: number(row.bookingCount),
    })),
    technicianServiceCounts: reportRows("technicianServiceCounts").map(
      (row) => ({
        _id: text(row._id),
        serviceCount: number(row.serviceCount),
      })
    ),
    categoryServiceCounts: reportRows("categoryServiceCounts").map((row) => ({
      _id: text(row._id),
      serviceCount: number(row.serviceCount),
    })),
    categoryBookingCounts: reportRows("categoryBookingCounts").map((row) => ({
      _id: text(row._id),
      bookingCount: number(row.bookingCount),
    })),
    bookingStatuses: isRecord(result.bookingStatuses)
      ? Object.fromEntries(
          Object.entries(result.bookingStatuses).map(([key, value]) => [
            key,
            number(value),
          ])
        )
      : {},
  }
}

export async function getAdminTransactions(): Promise<{
  transactions: AdminTransaction[]
  statistics: AdminPaymentStatistics
  available: boolean
  message?: string
}> {
  try {
    const adminId = await getAdminId()
    const [result, statsResult] = await Promise.all([
      requestAdminApi(adminId, "/payments"),
      requestAdminApi(adminId, "/payments/stats"),
    ])
    if (!isRecord(statsResult)) {
      throw new Error("The admin API returned invalid payment statistics.")
    }
    return {
      transactions: collection(result, "payments").map(normalizeAdminTransaction),
      statistics: normalizeAdminPaymentStatistics(statsResult),
      available: true,
    }
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 501) {
      return {
        transactions: [],
        statistics: emptyAdminPaymentStatistics(),
        available: false,
        message: error.message,
      }
    }
    console.error("Unable to load admin transactions.", error)
    return {
      transactions: [],
      statistics: emptyAdminPaymentStatistics(),
      available: false,
      message:
        error instanceof Error ? error.message : "Unable to load transactions.",
    }
  }
}

function normalizeAdminTransaction(value: unknown): AdminTransaction {
  if (!isRecord(value)) {
    throw new Error("The admin API returned an invalid payment.")
  }
  const requiredText = (key: string) => {
    const result = value[key]
    if (typeof result !== "string" || !result.trim()) {
      throw new Error(`The admin API returned a payment without ${key}.`)
    }
    return result
  }
  const id = recordId(value._id ?? value.id)
  const amount = value.amount
  const paidAt = asDate(value.paidAt)
  if (!id || typeof amount !== "number" || !Number.isFinite(amount) || !paidAt) {
    throw new Error("The admin API returned incomplete payment details.")
  }
  if (value.paymentStatus !== "paid") {
    throw new Error("The admin API returned an unverified payment record.")
  }
  const currency = requiredText("currency").toUpperCase()
  if (currency !== "BDT") {
    throw new Error("The admin API returned a payment in an unsupported currency.")
  }
  return {
    id,
    transactionId: requiredText("transactionId"),
    stripeSessionId: requiredText("stripeSessionId"),
    bookingId: requiredText("bookingId"),
    serviceTitle: requiredText("serviceTitle"),
    customer: requiredText("customerName"),
    customerEmail: requiredText("customerEmail"),
    technician: requiredText("technicianName"),
    technicianEmail: requiredText("technicianEmail"),
    amount,
    currency,
    paymentStatus: "paid",
    method: "Stripe",
    paidAt,
  }
}

export async function getAdminTransaction(
  paymentId: string
): Promise<AdminTransaction | null> {
  if (typeof paymentId !== "string" || !paymentId.trim()) {
    throw new Error("A valid payment ID is required.")
  }
  try {
    const adminId = await getAdminId()
    const value = await requestAdminApi(
      adminId,
      `/payments/${encodeURIComponent(paymentId)}`
    )
    if (!isRecord(value)) {
      throw new Error("The admin API returned an invalid payment.")
    }
    return normalizeAdminTransaction(value)
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 501) return null
    throw error
  }
}

function emptyAdminPaymentStatistics(): AdminPaymentStatistics {
  return {
    totalPayments: 0,
    totalRevenue: 0,
    currency: "BDT",
    byStatus: {},
  }
}

function normalizeAdminPaymentStatistics(
  value: ApiRecord
): AdminPaymentStatistics {
  if (
    typeof value.totalPayments !== "number" ||
    !Number.isFinite(value.totalPayments) ||
    typeof value.totalRevenue !== "number" ||
    !Number.isFinite(value.totalRevenue) ||
    typeof value.currency !== "string" ||
    value.currency.toUpperCase() !== "BDT" ||
    !isRecord(value.byStatus)
  ) {
    throw new Error("The admin API returned incomplete payment statistics.")
  }
  const byStatus = Object.fromEntries(
    Object.entries(value.byStatus).map(([key, count]) => {
      if (typeof count !== "number" || !Number.isFinite(count)) {
        throw new Error("The admin API returned an invalid payment status count.")
      }
      return [key, count]
    })
  )
  return {
    totalPayments: value.totalPayments,
    totalRevenue: value.totalRevenue,
    currency: value.currency.toUpperCase(),
    byStatus,
  }
}
