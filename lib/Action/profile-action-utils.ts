import { revalidatePath, unstable_cache, updateTag } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { profileCacheTag } from "@/lib/cache-tags"
import { exchangeAccessTokenForRequest, getAccessToken } from "@/lib/server-jwt"
import {
  deleteProfileAvatar,
  InvalidProfileAvatarError,
  storeProfileAvatar,
} from "@/lib/profile-avatar-storage"
import type { Customer } from "@/lib/dashboard-data"
import type {
  ProfileLoadResult,
  ProfileResult,
  ProfileValues,
} from "@/lib/profile-types"

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "")

export type ProfileRole = "customer" | "technician"

const DASHBOARD_PATH: Record<ProfileRole, string> = {
  customer: "/customer-dashboard",
  technician: "/technician-dashboard",
}

type ApiUser = {
  _id?: unknown
  id?: unknown
  name?: unknown
  email?: unknown
  emailVerified?: unknown
  image?: unknown
  role?: unknown
  phone?: unknown
  area?: unknown
  bio?: unknown
  createdAt?: unknown
  updatedAt?: unknown
  matchedCount?: unknown
}

class ProfileVerificationError extends Error {}
class ProfileAccessTokenExpiredError extends Error {}

function isRecord(value: unknown): value is ApiUser {
  return typeof value === "object" && value !== null
}

function apiUserId(user: ApiUser): string | undefined {
  if (typeof user._id === "string") return user._id
  if (typeof user.id === "string") return user.id
  if (
    typeof user._id === "object" &&
    user._id !== null &&
    "$oid" in user._id &&
    typeof user._id.$oid === "string"
  ) {
    return user._id.$oid
  }
  return undefined
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined
}

function asDate(value: unknown): string {
  if (typeof value !== "string" && !(value instanceof Date)) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

export async function getProfileSession(role: ProfileRole) {
  let session: Awaited<ReturnType<typeof auth.api.getSession>>
  try {
    session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    })
  } catch (error) {
    console.error("Unable to verify the profile session.", error)
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
      redirectTo: "/login",
      error: "Sign in to access your profile.",
    }
  }

  if (session.user.role !== role) {
    const redirectTo =
      session.user.role === "customer" || session.user.role === "technician"
        ? DASHBOARD_PATH[session.user.role]
        : "/login"
    return {
      ok: false as const,
      unauthorized: true,
      redirectTo,
      error: `Sign in with a ${role} account to access your profile.`,
    }
  }

  return { ok: true as const, session }
}

export async function loadProfile(
  role: ProfileRole,
  session: {
    user: { id: string; name: string; email: string; image?: string | null }
  }
): Promise<ProfileLoadResult> {
  try {
    const userId = session.user.id
    const loadCachedProfile = (accessToken: string) =>
      unstable_cache(
        async () => {
          const response = await fetch(profileEndpoint(role, userId), {
            cache: "no-store",
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          if (response.status === 401) {
            throw new ProfileAccessTokenExpiredError(
              "The backend access token expired."
            )
          }
          const body = await readProfileResponse(response)
          if (!isRecord(body)) {
            throw new Error("Profile API returned an invalid user.")
          }
          if (apiUserId(body) !== userId || body.role !== role) {
            throw new ProfileVerificationError(
              `Your ${role} profile could not be verified.`
            )
          }
          return body
        },
        ["profile", role, userId],
        { revalidate: 300, tags: [profileCacheTag(role, userId)] }
      )()

    let accessToken = await getAccessToken()
    if (!accessToken) {
      accessToken = (await exchangeAccessTokenForRequest("/auth/token"))
        .accessToken
    }

    let body: ApiUser
    try {
      body = await loadCachedProfile(accessToken)
    } catch (error) {
      if (!(error instanceof ProfileAccessTokenExpiredError)) throw error
      accessToken = (await exchangeAccessTokenForRequest("/auth/refresh"))
        .accessToken
      body = await loadCachedProfile(accessToken)
    }

    const email = asOptionalString(body.email) ?? session.user.email
    const customer: Customer = {
      name: asOptionalString(body.name) ?? session.user.name,
      email,
      emailVerified: body.emailVerified === true,
      image: asOptionalString(body.image) ?? session.user.image ?? undefined,
      role,
      phone: asOptionalString(body.phone),
      address: asOptionalString(body.area),
      bio: asOptionalString(body.bio),
      memberSince: asDate(body.createdAt),
      profileUpdatedAt: asDate(body.updatedAt),
    }

    return { ok: true, customer }
  } catch (error) {
    if (error instanceof ProfileVerificationError) {
      return {
        ok: false,
        unauthorized: true,
        redirectTo: "/login",
        error: error.message,
      }
    }
    console.error(`Unable to load ${role} profile.`, error)
    return {
      ok: false,
      unauthorized: false,
      error: "Unable to load your profile. Please try again.",
    }
  }
}

export async function saveProfile(
  role: ProfileRole,
  values: ProfileValues,
  photo: File | null,
  updateProfile: (
    id: string,
    values: Record<string, string>
  ) => Promise<unknown>
): Promise<ProfileResult> {
  let uploadedAvatar: Awaited<ReturnType<typeof storeProfileAvatar>> | null =
    null
  let authUserUpdated = false
  let originalName = ""
  let originalImage: string | null = null
  let requestHeaders: Headers | null = null
  let userId = ""

  try {
    const access = await getProfileSession(role)
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

    if (photo !== null && !(photo instanceof File)) {
      return { ok: false, error: "Choose a valid JPG or PNG image." }
    }

    requestHeaders = await headers()
    userId = access.session.user.id
    originalName = access.session.user.name
    originalImage = access.session.user.image ?? null
    if (photo) uploadedAvatar = await storeProfileAvatar(userId, photo)

    await auth.api.updateUser({
      headers: requestHeaders,
      body: {
        name,
        ...(uploadedAvatar ? { image: uploadedAvatar.image } : {}),
      },
    })
    authUserUpdated = true

    const result = await updateProfile(userId, {
      name,
      phone: values.phone.trim(),
      area: values.area.trim(),
      bio: values.bio.trim(),
      ...(uploadedAvatar ? { image: uploadedAvatar.image } : {}),
    })
    if (!isRecord(result) || result.matchedCount !== 1) {
      throw new Error(`The profile API did not update the ${role} record.`)
    }

    if (uploadedAvatar) {
      try {
        await deleteProfileAvatar(originalImage, userId)
      } catch (error) {
        console.error("Unable to remove the previous profile photo.", error)
      }
    }

    updateTag(profileCacheTag(role, userId))
    revalidatePath(DASHBOARD_PATH[role])
    revalidatePath(`${DASHBOARD_PATH[role]}/profile`)
    return { ok: true, image: uploadedAvatar?.image }
  } catch (error) {
    if (authUserUpdated && requestHeaders) {
      try {
        await auth.api.updateUser({
          headers: requestHeaders,
          body: {
            name: originalName,
            ...(uploadedAvatar ? { image: originalImage } : {}),
          },
        })
      } catch (rollbackError) {
        console.error(
          "Unable to roll back the authentication profile.",
          rollbackError
        )
      }
    }
    if (uploadedAvatar) {
      try {
        await deleteProfileAvatar(uploadedAvatar.image, userId)
      } catch (cleanupError) {
        console.error(
          "Unable to remove the failed profile photo upload.",
          cleanupError
        )
      }
    }
    if (error instanceof InvalidProfileAvatarError) {
      return { ok: false, error: error.message }
    }
    console.error(`Unable to update ${role} profile.`, error)
    return {
      ok: false,
      error: "Unable to save your profile. Please try again.",
    }
  }
}

export function profileEndpoint(role: ProfileRole, id: string): string {
  const resource = role === "customer" ? "customers" : "technicians"
  return `${API_BASE_URL}/${resource}/${encodeURIComponent(id)}`
}

export function userEndpoint(id: string): string {
  return `${API_BASE_URL}/users/${encodeURIComponent(id)}`
}

export async function readProfileResponse(
  response: Response
): Promise<unknown> {
  if (!response.ok) {
    throw new Error(`Profile API returned HTTP ${response.status}.`)
  }
  return response.json()
}
