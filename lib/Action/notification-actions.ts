"use server"

import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { requestServiceBookingApi } from "@/lib/service-booking-api"
import type {
  NotificationRole,
  NotificationType,
} from "@/lib/notification-types"

export type NotificationItem = {
  id: string
  title: string
  message: string
  type: NotificationType
  relatedId?: string
  href?: string
  readAt: string | null
  createdAt: string
}

type NotificationFeed = {
  notifications: NotificationItem[]
  unreadCount: number
}

type ActionResult = { ok: true } | { ok: false; error: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isNotificationType(value: unknown): value is NotificationType {
  return (
    value === "user_registered" ||
    value === "booking_created" ||
    value === "booking_updated" ||
    value === "booking_cancelled" ||
    value === "service_submitted" ||
    value === "service_decision" ||
    value === "service_removed" ||
    value === "account_update" ||
    value === "payment_processing" ||
    value === "payment_completed" ||
    value === "payment_issue"
  )
}

function notificationFrom(value: unknown): NotificationItem {
  if (!isRecord(value)) {
    throw new Error("The notification API returned an invalid item.")
  }
  if (
    typeof value._id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.message !== "string" ||
    !isNotificationType(value.type) ||
    typeof value.createdAt !== "string" ||
    (value.readAt !== null && typeof value.readAt !== "string")
  ) {
    throw new Error(
      "The notification API returned incomplete notification data."
    )
  }
  return {
    id: value._id,
    title: value.title,
    message: value.message,
    type: value.type,
    relatedId:
      typeof value.relatedId === "string" ? value.relatedId : undefined,
    href:
      typeof value.href === "string" &&
      value.href.startsWith("/") &&
      !value.href.startsWith("//")
        ? value.href
        : undefined,
    readAt: value.readAt,
    createdAt: value.createdAt,
  }
}

async function getNotificationPrincipal() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })
  const role = session?.user.role
  if (
    !session ||
    (role !== "customer" && role !== "technician" && role !== "admin")
  ) {
    throw new Error("Sign in to access your notifications.")
  }
  return { id: session.user.id, role }
}

function notificationPath(role: NotificationRole, userId: string) {
  return `/notifications/${encodeURIComponent(role)}/${encodeURIComponent(userId)}`
}

function notificationRequestHeaders(extra: HeadersInit = {}) {
  const secret = process.env.HOMEFIX_PAYMENT_API_SECRET
  if (!secret) {
    throw new Error("Notification API is not configured.")
  }
  return {
    ...extra,
    "x-homefix-notification-secret": secret,
  }
}

export async function getNotifications(): Promise<
  { ok: true; feed: NotificationFeed } | { ok: false; error: string }
> {
  try {
    const principal = await getNotificationPrincipal()
    const value = await requestServiceBookingApi(
      notificationPath(principal.role, principal.id),
      { headers: notificationRequestHeaders() }
    )
    if (
      !isRecord(value) ||
      !Array.isArray(value.notifications) ||
      typeof value.unreadCount !== "number" ||
      !Number.isInteger(value.unreadCount) ||
      value.unreadCount < 0
    ) {
      throw new Error("The notification API returned an invalid feed.")
    }
    return {
      ok: true,
      feed: {
        notifications: value.notifications.map(notificationFrom),
        unreadCount: value.unreadCount,
      },
    }
  } catch (error) {
    console.error("Unable to load notifications.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load notifications.",
    }
  }
}

export async function getUnreadNotificationCount(): Promise<
  { ok: true; unreadCount: number } | { ok: false; error: string }
> {
  try {
    const principal = await getNotificationPrincipal()
    const value = await requestServiceBookingApi(
      `${notificationPath(principal.role, principal.id)}/unread-count`,
      { headers: notificationRequestHeaders() }
    )
    if (
      !isRecord(value) ||
      typeof value.unreadCount !== "number" ||
      !Number.isInteger(value.unreadCount) ||
      value.unreadCount < 0
    ) {
      throw new Error("The notification API returned an invalid unread count.")
    }
    return { ok: true, unreadCount: value.unreadCount }
  } catch (error) {
    console.error("Unable to load the unread notification count.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load the unread notification count.",
    }
  }
}

async function updateNotification(
  pathSuffix: string,
  method: "PATCH" | "DELETE"
): Promise<ActionResult> {
  try {
    const principal = await getNotificationPrincipal()
    await requestServiceBookingApi(
      `${notificationPath(principal.role, principal.id)}${pathSuffix}`,
      {
        method,
        headers: notificationRequestHeaders(),
      }
    )
    return { ok: true }
  } catch (error) {
    console.error("Unable to update notifications.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update notifications.",
    }
  }
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<ActionResult> {
  if (typeof notificationId !== "string" || !notificationId.trim()) {
    return { ok: false, error: "Choose a valid notification." }
  }
  return updateNotification(
    `/${encodeURIComponent(notificationId)}/read`,
    "PATCH"
  )
}

export async function markAllNotificationsAsRead(): Promise<ActionResult> {
  return updateNotification("/read-all", "PATCH")
}

export async function deleteNotification(
  notificationId: string
): Promise<ActionResult> {
  if (typeof notificationId !== "string" || !notificationId.trim()) {
    return { ok: false, error: "Choose a valid notification." }
  }
  return updateNotification(`/${encodeURIComponent(notificationId)}`, "DELETE")
}
