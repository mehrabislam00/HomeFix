import "server-only"

import { cookies, headers } from "next/headers"

const ACCESS_TOKEN_COOKIE = "homefix-access-token"
const ACCESS_TOKEN_MAX_AGE = 15 * 60

export type AccessTokenExchange = {
  accessToken: string
  tokenType: "Bearer"
  expiresIn: number
  user: { id: string; name: string; email: string; role: string }
}

export function accessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  }
}

function apiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
  ).replace(/\/+$/, "")
}

async function betterAuthCookieHeader() {
  const requestHeaders = await headers()
  return requestHeaders.get("cookie")
}

async function exchangeAccessToken(path: "/auth/token" | "/auth/refresh") {
  const cookieHeader = await betterAuthCookieHeader()
  if (!cookieHeader) {
    throw new Error("A valid Better Auth session is required.")
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  })
  if (!response.ok) {
    let message = "Unable to authenticate the backend API."
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {}
    const error = new Error(message) as Error & { status: number }
    error.status = response.status
    throw error
  }

  const value = (await response.json()) as AccessTokenExchange
  if (
    typeof value.accessToken !== "string" ||
    value.tokenType !== "Bearer" ||
    typeof value.expiresIn !== "number"
  ) {
    throw new Error("The backend returned an invalid access token.")
  }
  return value
}

export async function exchangeAccessTokenForRequest(
  path: "/auth/token" | "/auth/refresh" = "/auth/token"
) {
  return exchangeAccessToken(path)
}

const refreshPromises = new Map<string, Promise<AccessTokenExchange>>()

export async function exchangeAndStoreAccessToken() {
  const value = await exchangeAccessToken("/auth/token")
  const cookieStore = await cookies()
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    value.accessToken,
    accessTokenCookieOptions()
  )
  return value
}

export async function getAccessToken() {
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}

export async function refreshAndStoreAccessToken() {
  const cookieHeader = await betterAuthCookieHeader()
  if (!cookieHeader) {
    throw new Error("A valid Better Auth session is required.")
  }
  const existing = refreshPromises.get(cookieHeader)
  if (existing) return existing

  const refreshPromise = exchangeAccessToken("/auth/refresh")
      .then(async (value) => {
        const cookieStore = await cookies()
        cookieStore.set(
          ACCESS_TOKEN_COOKIE,
          value.accessToken,
          accessTokenCookieOptions()
        )
        return value
      })
      .finally(() => {
        refreshPromises.delete(cookieHeader)
      })
  refreshPromises.set(cookieHeader, refreshPromise)
  return refreshPromise
}

export async function clearAccessTokenCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    ...accessTokenCookieOptions(),
    maxAge: 0,
  })
}

export async function revokeBackendSession() {
  const token = await getAccessToken()
  if (!token) return false

  const response = await fetch(`${apiBaseUrl()}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  await clearAccessTokenCookie()
  return response.ok
}

export async function authenticatedBackendFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  async function makeRequest(token: string | null) {
    return fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      cache: "no-store",
    })
  }

  let token = await getAccessToken()
  if (!token) {
    const exchanged = await exchangeAccessTokenForRequest("/auth/token")
    token = exchanged.accessToken
  }
  let response = await makeRequest(token)
  if (response.status === 401) {
    const refreshed = await exchangeAccessTokenForRequest("/auth/refresh")
    token = refreshed.accessToken
    response = await makeRequest(token)
  }
  return response
}
