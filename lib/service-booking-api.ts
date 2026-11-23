import "server-only"

import {
  authenticatedBackendFetch,
} from "@/lib/server-jwt"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export class ServiceBookingApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "ServiceBookingApiError"
  }
}

export async function requestServiceBookingApi(
  path: string,
  init: RequestInit = {}
): Promise<unknown> {
  const method = init.method?.toUpperCase()
  const publicGet =
    (!method || method === "GET") &&
    (path === "/services" ||
      path.startsWith("/services/category/") ||
      /^\/services\/[^/]+$/.test(path))
  const requiresJwt =
    !publicGet &&
    (path.startsWith("/users") ||
      path.startsWith("/customers") ||
      path.startsWith("/technicians") ||
      path.startsWith("/bookings") ||
      path.startsWith("/payments") ||
      path.startsWith("/admin/") ||
      path.startsWith("/services") ||
      path === "/auth/logout")

  const response = requiresJwt
    ? await authenticatedBackendFetch(path, init)
    : await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          ...init.headers,
        },
        cache: "no-store",
      })

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
    const error =
      typeof data === "object" && data !== null
        ? "message" in data && typeof data.message === "string"
          ? data.message
          : "error" in data && typeof data.error === "string"
            ? data.error
            : undefined
        : typeof data === "string"
          ? data
          : undefined
    throw new ServiceBookingApiError(
      error ?? `API request failed with HTTP ${response.status}.`,
      response.status
    )
  }

  return data
}
