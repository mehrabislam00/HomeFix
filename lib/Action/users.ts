"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

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

function isRecord(value: unknown): value is ApiUser {
  return typeof value === "object" && value !== null
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined
}

function asDate(value: unknown): string {
  if (typeof value !== "string" && !(value instanceof Date)) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
}

async function getCustomerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })
  return session?.user.role === "customer" ? session : null
}

export async function getCustomerProfile(): Promise<ProfileLoadResult> {
  try {
    const session = await getCustomerSession()
    if (!session) {
      return {
        ok: false,
        unauthorized: true,
        error: "Sign in with a customer account to access your profile.",
      }
    }

    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(session.user.id)}`,
      { cache: "no-store" }
    )
    if (!response.ok) {
      throw new Error(`Profile API returned HTTP ${response.status}.`)
    }

    const body: unknown = await response.json()
    if (!isRecord(body)) {
      throw new Error("Profile API returned an invalid user.")
    }

    const apiId = typeof body._id === "string" ? body._id : body.id
    if (apiId !== session.user.id || body.role !== "customer") {
      return {
        ok: false,
        unauthorized: true,
        error: "Your customer profile could not be verified.",
      }
    }
    if (typeof body.name !== "string" || typeof body.email !== "string") {
      throw new Error("Profile API returned incomplete user details.")
    }

    const customer: Customer = {
      name: body.name,
      email: body.email,
      emailVerified: body.emailVerified === true,
      image: asOptionalString(body.image) ?? asOptionalString(session.user.image),
      role: "customer",
      phone: asOptionalString(body.phone),
      address: asOptionalString(body.area),
      bio: asOptionalString(body.bio),
      memberSince: asDate(body.createdAt),
      profileUpdatedAt: asDate(body.updatedAt),
    }

    return { ok: true, customer }
  } catch (error) {
    console.error("Unable to load customer profile.", error)
    return {
      ok: false,
      unauthorized: false,
      error: "Unable to load your profile. Please try again.",
    }
  }
}

export async function updateCustomerProfile(
  values: ProfileValues,
  photo: File | null = null
): Promise<ProfileResult> {
  let uploadedAvatar: Awaited<ReturnType<typeof storeProfileAvatar>> | null =
    null
  let authUserUpdated = false
  let originalName = ""
  let originalImage: string | null = null
  let requestHeaders: Headers | null = null
  let userId = ""

  try {
    const session = await getCustomerSession()
    if (!session) {
      return {
        ok: false,
        error:
          "Your session has expired. Sign in again to update your profile.",
      }
    }

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
    userId = session.user.id
    originalName = session.user.name
    originalImage = session.user.image ?? null
    if (photo) uploadedAvatar = await storeProfileAvatar(session.user.id, photo)

    await auth.api.updateUser({
      headers: requestHeaders,
      body: {
        name,
        ...(uploadedAvatar ? { image: uploadedAvatar.image } : {}),
      },
    })
    authUserUpdated = true

    const response = await fetch(
      `${API_BASE_URL}/users/${encodeURIComponent(session.user.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: values.phone.trim(),
          area: values.area.trim(),
          bio: values.bio.trim(),
          ...(uploadedAvatar ? { image: uploadedAvatar.image } : {}),
        }),
        cache: "no-store",
      }
    )
    if (!response.ok) {
      throw new Error(`Profile API returned HTTP ${response.status}.`)
    }

    const result: unknown = await response.json()
    if (!isRecord(result) || result.matchedCount !== 1) {
      throw new Error("The profile API did not update the customer record.")
    }

    if (uploadedAvatar) {
      try {
        await deleteProfileAvatar(originalImage, session.user.id)
      } catch (error) {
        console.error("Unable to remove the previous profile photo.", error)
      }
    }

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/profile")
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
        console.error("Unable to roll back the authentication profile.", rollbackError)
      }
    }
    if (uploadedAvatar) {
      try {
        await deleteProfileAvatar(uploadedAvatar.image, userId)
      } catch (cleanupError) {
        console.error("Unable to remove the failed profile photo upload.", cleanupError)
      }
    }
    if (error instanceof InvalidProfileAvatarError) {
      return { ok: false, error: error.message }
    }
    console.error("Unable to update customer profile.", error)
    return {
      ok: false,
      error: "Unable to save your profile. Please try again.",
    }
  }
}
