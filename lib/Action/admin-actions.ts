"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth, db } from "@/lib/auth"
import {
  sampleUsers,
  type AdminRole,
  type AdminUser,
} from "@/lib/admin-data"
import type { Customer } from "@/lib/dashboard-data"
import type {
  ProfileLoadResult,
  ProfileResult,
  ProfileValues,
} from "@/lib/profile-types"

const ADMIN_PATH = "/admin-dashboard"

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined
}

function asDate(value: unknown): string {
  if (typeof value !== "string" && !(value instanceof Date)) return ""
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10)
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

export type AdminUsersResult = { users: AdminUser[]; live: boolean }

/** Reads accounts from the auth database (read-only). Falls back to sample data. */
export async function getAdminUsers(): Promise<AdminUsersResult> {
  const access = await getAdminSession()
  if (!access.ok) return { users: [], live: false }

  try {
    const docs = await db
      .collection("user")
      .find({})
      .sort({ createdAt: 1 })
      .toArray()

    const users = docs.map((doc): AdminUser => {
      const role: AdminRole =
        doc.role === "admin" || doc.role === "technician"
          ? doc.role
          : "customer"
      return {
        id: String(doc._id),
        name: asOptionalString(doc.name) ?? "Unnamed user",
        email: asOptionalString(doc.email) ?? "",
        role,
        status: doc.banned === true ? "suspended" : "active",
        image: asOptionalString(doc.image),
        phone: asOptionalString(doc.phone),
        area: asOptionalString(doc.area),
        joinedAt: asDate(doc.createdAt),
      }
    })
    return { users, live: true }
  } catch (error) {
    console.error("Unable to load users for the admin dashboard.", error)
    return { users: sampleUsers, live: false }
  }
}