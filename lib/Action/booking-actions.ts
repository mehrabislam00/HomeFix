"use server"

import { revalidatePath } from "next/cache"

import { getProfileSession } from "@/lib/Action/profile-action-utils"
import {
  normalizeCustomerBooking,
  normalizeService,
  normalizeTechnicianBooking,
  unwrapCollection,
} from "@/lib/service-booking-data"
import { requestServiceBookingApi } from "@/lib/service-booking-api"
import type { BookingResult, BookingValues } from "@/lib/booking-types"
import type { Booking } from "@/lib/dashboard-data"
import type { ServiceListing } from "@/lib/service-booking-data"
import type {
  JobAction,
  JobActionResult,
  JobRequest,
} from "@/lib/technician-data"

async function userIdForRole(role: "customer" | "technician") {
  const access = await getProfileSession(role)
  if (!access.ok) throw new Error(access.error)
  return access.session.user.id
}

function collection(value: unknown, key: string): unknown[] {
  return unwrapCollection(value, [key, "results"])
}

export async function getCustomerServices(): Promise<ServiceListing[]> {
  const id = await userIdForRole("customer")
  const result = await requestServiceBookingApi(
    `/customers/${encodeURIComponent(id)}/services`
  )
  return collection(result, "services").map(normalizeService)
}

export async function getCustomerBookings(): Promise<Booking[]> {
  const id = await userIdForRole("customer")
  const result = await requestServiceBookingApi(
    `/customers/${encodeURIComponent(id)}/bookings`
  )
  return collection(result, "bookings")
    .map((booking) => normalizeCustomerBooking(booking, new Map()))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function getCustomerBooking(bookingId: string): Promise<Booking> {
  const id = await userIdForRole("customer")
  const booking = await requestServiceBookingApi(
    `/customers/${encodeURIComponent(id)}/bookings/${encodeURIComponent(bookingId)}`
  )
  return normalizeCustomerBooking(booking, new Map())
}

export type CancelBookingResult = { ok: true } | { ok: false; error: string }

export async function cancelCustomerBooking(
  bookingId: string
): Promise<CancelBookingResult> {
  if (typeof bookingId !== "string" || !bookingId.trim()) {
    return { ok: false, error: "Choose a valid booking to cancel." }
  }

  try {
    const path = `/bookings/${encodeURIComponent(bookingId)}/cancel`
    await requestServiceBookingApi(path, {
      method: "PATCH",
    })
    revalidatePath("/customer-dashboard")
    revalidatePath("/customer-dashboard/bookings")
    revalidatePath(
      `/customer-dashboard/bookings/${encodeURIComponent(bookingId)}`
    )
    return { ok: true }
  } catch (error) {
    console.error("Unable to cancel customer booking.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to cancel this service request. Please try again.",
    }
  }
}

export async function createCustomerBooking(
  values: BookingValues
): Promise<BookingResult> {
  if (
    !values ||
    typeof values.serviceId !== "string" ||
    !values.serviceId.trim() ||
    typeof values.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(values.date) ||
    Number.isNaN(new Date(`${values.date}T00:00:00Z`).getTime()) ||
    new Date(`${values.date}T00:00:00Z`).toISOString().slice(0, 10) !==
      values.date ||
    typeof values.address !== "string" ||
    !values.address.trim() ||
    typeof values.phone !== "string" ||
    values.phone.replace(/\D/g, "").length < 10 ||
    typeof values.notes !== "string"
  ) {
    return { ok: false, error: "Enter valid booking details." }
  }

  try {
    const customerId = await userIdForRole("customer")
    await requestServiceBookingApi("/bookings", {
      method: "POST",
      body: JSON.stringify({
        customerId,
        serviceId: values.serviceId,
        preferredDate: values.date,
        address: values.address.trim(),
        customerPhone: values.phone.trim(),
        problemDescription: values.notes.trim(),
      }),
    })
    revalidatePath("/customer-dashboard")
    revalidatePath("/customer-dashboard/bookings")
    return { ok: true }
  } catch (error) {
    console.error("Unable to create customer booking.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit your booking. Please try again.",
    }
  }
}

export async function getTechnicianBookings(): Promise<JobRequest[]> {
  const id = await userIdForRole("technician")
  const result = await requestServiceBookingApi(
    `/technicians/${encodeURIComponent(id)}/bookings`
  )
  return collection(result, "bookings")
    .map((booking) => normalizeTechnicianBooking(booking, new Map()))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function getTechnicianBooking(
  bookingId: string
): Promise<JobRequest> {
  const id = await userIdForRole("technician")
  const booking = await requestServiceBookingApi(
    `/technicians/${encodeURIComponent(id)}/bookings/${encodeURIComponent(bookingId)}`
  )
  return normalizeTechnicianBooking(booking, new Map())
}

const nextStatus: Record<JobAction, string> = {
  accept: "accepted",
  reject: "rejected",
  start: "in-progress",
  complete: "completed",
}

export async function updateTechnicianBooking(
  bookingId: string,
  action: JobAction,
  finalAmount?: number
): Promise<JobActionResult> {
  if (
    typeof bookingId !== "string" ||
    !bookingId.trim() ||
    !Object.prototype.hasOwnProperty.call(nextStatus, action)
  ) {
    return { ok: false, error: "Choose a valid booking status." }
  }

  try {
    const technicianId = await userIdForRole("technician")
    if (
      finalAmount !== undefined &&
      (!Number.isFinite(finalAmount) || finalAmount <= 0)
    ) {
      return { ok: false, error: "Enter a valid final amount." }
    }
    await requestServiceBookingApi(
      `/bookings/${encodeURIComponent(bookingId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          technicianId,
          status: nextStatus[action],
          ...(action === "complete" && finalAmount !== undefined
            ? { finalAmount }
            : {}),
        }),
      }
    )
    revalidatePath("/technician-dashboard")
    revalidatePath("/technician-dashboard/requests")
    revalidatePath("/customer-dashboard")
    revalidatePath("/customer-dashboard/bookings")
    return { ok: true }
  } catch (error) {
    console.error("Unable to update technician booking.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update this booking. Please try again.",
    }
  }
}
