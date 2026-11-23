import "server-only"

import { createHash } from "node:crypto"
import { cookies, headers } from "next/headers"
import { backendApiBaseUrl } from "@/lib/server-api-config"

const ACCESS_TOKEN_COOKIE = "homefix-access-token"
const ACCESS_TOKEN_MAX_AGE = 15 * 60
const ACCESS_TOKEN_CACHE_LIMIT = 500
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 30_000

export type AccessTokenExchange = {
  accessToken: string
  tokenType: "Bearer"
  expiresIn: number
  user: { id: string; name: string; email: string; role: string }
}

type CachedAccessToken = {
  accessToken: string
  expiresAt: number
}

type RequestAccessToken = Pick<
  AccessTokenExchange,
  "accessToken" | "tokenType" | "expiresIn"
>

const exchangePromises = new Map<string, Promise<AccessTokenExchange>>()
const accessTokenCache = new Map<string, CachedAccessToken>()

export function accessTokenCookieOptions(
  maxAge = ACCESS_TOKEN_MAX_AGE
) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  }
}

async function betterAuthCookieHeader() {
  const requestHeaders = await headers()
  return requestHeaders.get("cookie")
}

function sessionCookieKey(cookieHeader: string) {
  const sessionCookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => !cookie.startsWith(`${ACCESS_TOKEN_COOKIE}=`))
    .join(";")
  return createHash("sha256").update(sessionCookies).digest("hex")
}

function getCachedAccessToken(cookieHeader: string) {
  const key = sessionCookieKey(cookieHeader)
  const cached = accessTokenCache.get(key)
  if (!cached) return null
  const remainingSeconds = Math.floor((cached.expiresAt - Date.now()) / 1000)
  if (remainingSeconds <= 0) {
    accessTokenCache.delete(key)
    return null
  }
  accessTokenCache.delete(key)
  accessTokenCache.set(key, cached)
  return {
    accessToken: cached.accessToken,
    tokenType: "Bearer" as const,
    expiresIn: remainingSeconds,
  }
}

function cacheAccessToken(
  cookieHeader: string,
  exchange: AccessTokenExchange
) {
  const lifetime =
    Math.floor(Math.min(ACCESS_TOKEN_MAX_AGE, exchange.expiresIn) * 1000) -
    ACCESS_TOKEN_EXPIRY_BUFFER_MS
  if (lifetime <= 0) return

  const key = sessionCookieKey(cookieHeader)
  accessTokenCache.delete(key)
  accessTokenCache.set(key, {
    accessToken: exchange.accessToken,
    expiresAt: Date.now() + lifetime,
  })

  for (const [cachedKey, cached] of accessTokenCache) {
    if (cached.expiresAt <= Date.now()) accessTokenCache.delete(cachedKey)
  }
  while (accessTokenCache.size > ACCESS_TOKEN_CACHE_LIMIT) {
    const oldestKey = accessTokenCache.keys().next().value
    if (oldestKey === undefined) break
    accessTokenCache.delete(oldestKey)
  }
}

async function exchangeAccessToken(
  path: "/auth/token" | "/auth/refresh",
  cookieHeader: string
) {
  if (!cookieHeader) {
    throw new Error("A valid Better Auth session is required.")
  }

  const response = await fetch(`${backendApiBaseUrl()}${path}`, {
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
    !value.accessToken ||
    value.tokenType !== "Bearer" ||
    typeof value.expiresIn !== "number" ||
    !Number.isFinite(value.expiresIn) ||
    value.expiresIn <= 0
  ) {
    throw new Error("The backend returned an invalid access token.")
  }
  return value
}

function exchangeAndDeduplicate(
  path: "/auth/token" | "/auth/refresh",
  cookieHeader: string
) {
  const key = `${path}:${sessionCookieKey(cookieHeader)}`
  const existing = exchangePromises.get(key)
  if (existing) return existing

  const exchangePromise = exchangeAccessToken(path, cookieHeader)
    .then((value) => {
      cacheAccessToken(cookieHeader, value)
      return value
    })
    .finally(() => {
      exchangePromises.delete(key)
    })
  exchangePromises.set(key, exchangePromise)
  return exchangePromise
}

export async function exchangeAccessTokenForRequest(
  path: "/auth/token" | "/auth/refresh" = "/auth/token"
): Promise<RequestAccessToken> {
  const cookieHeader = await betterAuthCookieHeader()
  if (!cookieHeader) {
    throw new Error("A valid Better Auth session is required.")
  }
  if (path === "/auth/token") {
    const cached = getCachedAccessToken(cookieHeader)
    if (cached) return cached
  }
  return exchangeAndDeduplicate(path, cookieHeader)
}

export async function exchangeAndStoreAccessToken(): Promise<RequestAccessToken> {
  const cookieHeader = await betterAuthCookieHeader()
  if (!cookieHeader) {
    throw new Error("A valid Better Auth session is required.")
  }
  const value =
    getCachedAccessToken(cookieHeader) ??
    (await exchangeAndDeduplicate("/auth/token", cookieHeader))
  const cookieStore = await cookies()
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    value.accessToken,
    accessTokenCookieOptions(
      Math.min(ACCESS_TOKEN_MAX_AGE, Math.floor(value.expiresIn))
    )
  )
  return value
}

export async function getAccessToken() {
  const cookieHeader = await betterAuthCookieHeader()
  if (cookieHeader) {
    const cached = getCachedAccessToken(cookieHeader)
    if (cached) return cached.accessToken
  }
  const cookieStore = await cookies()
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null
}

export async function refreshAndStoreAccessToken(): Promise<RequestAccessToken> {
  const cookieHeader = await betterAuthCookieHeader()
  if (!cookieHeader) {
    throw new Error("A valid Better Auth session is required.")
  }
  const value = await exchangeAndDeduplicate("/auth/refresh", cookieHeader)
  const cookieStore = await cookies()
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    value.accessToken,
    accessTokenCookieOptions(
      Math.min(ACCESS_TOKEN_MAX_AGE, Math.floor(value.expiresIn))
    )
  )
  return value
}

export async function clearAccessTokenCookie() {
  const cookieStore = await cookies()
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", {
    ...accessTokenCookieOptions(),
    maxAge: 0,
  })
}

export async function revokeBackendSession() {
  const cookieHeader = await betterAuthCookieHeader()
  try {
    const token = await getAccessToken()
    if (!token) return false

    const response = await fetch(`${backendApiBaseUrl()}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    return response.ok
  } finally {
    if (cookieHeader) {
      accessTokenCache.delete(sessionCookieKey(cookieHeader))
    }
    await clearAccessTokenCookie()
  }
}

export async function authenticatedBackendFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  async function makeRequest(token: string | null) {
    const requestHeaders = new Headers(init.headers)
    if (init.body && !requestHeaders.has("Content-Type")) {
      requestHeaders.set("Content-Type", "application/json")
    }
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`)
    }
    return fetch(`${backendApiBaseUrl()}${path}`, {
      ...init,
      headers: requestHeaders,
      cache: "no-store",
    })
  }

  const cookieHeader = await betterAuthCookieHeader()
  let token = cookieHeader
    ? (getCachedAccessToken(cookieHeader)?.accessToken ?? await getAccessToken())
    : await getAccessToken()
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
