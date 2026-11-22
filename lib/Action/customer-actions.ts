"use server"

import type { ProfileResult, ProfileValues } from "@/lib/profile-types"
import {
  getProfileSession,
  loadProfile,
  profileEndpoint,
  readProfileResponse,
  saveProfile,
  userEndpoint,
} from "./profile-action-utils"

async function fetchCustomerProfile(id: string): Promise<unknown> {
  const response = await fetch(profileEndpoint("customer", id), {
    cache: "no-store",
  })
  return readProfileResponse(response)
}

async function updateCustomerProfileRecord(
  id: string,
  values: Record<string, string>
): Promise<unknown> {
  const response = await fetch(userEndpoint(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
    cache: "no-store",
  })
  return readProfileResponse(response)
}

export async function getCustomerProfile() {
  const access = await getProfileSession("customer")
  if (!access.ok) return access
  return loadProfile("customer", fetchCustomerProfile, access.session)
}

export async function updateCustomerProfile(
  values: ProfileValues,
  photo: File | null = null
): Promise<ProfileResult> {
  return saveProfile("customer", values, photo, updateCustomerProfileRecord)
}
