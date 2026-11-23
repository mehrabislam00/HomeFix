"use server"

import { updateTag } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { profileCacheTag } from "@/lib/cache-tags"
import {
  getCustomerProfile as loadCustomerProfile,
  updateCustomerProfile as saveCustomerProfile,
} from "./customer-actions"
import {
  getTechnicianProfile as loadTechnicianProfile,
  updateTechnicianProfile as saveTechnicianProfile,
} from "./technician-actions"
import type { ProfileResult, ProfileValues } from "@/lib/profile-types"

export async function getCustomerProfile() {
  return loadCustomerProfile()
}

export async function updateCustomerProfile(
  values: ProfileValues,
  photo: File | null = null
): Promise<ProfileResult> {
  return saveCustomerProfile(values, photo)
}

export async function getTechnicianProfile() {
  return loadTechnicianProfile()
}

export async function updateTechnicianProfile(
  values: ProfileValues,
  photo: File | null = null
): Promise<ProfileResult> {
  return saveTechnicianProfile(values, photo)
}

export async function invalidateCurrentProfileCache(): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })
  const role = session?.user.role
  if (session && (role === "customer" || role === "technician")) {
    updateTag(profileCacheTag(role, session.user.id))
  }
}
