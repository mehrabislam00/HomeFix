"use server"

import type { ProfileResult, ProfileValues } from "@/lib/profile-types"
import { authenticatedBackendFetch } from "@/lib/server-jwt"
import {
  getProfileSession,
  loadProfile,
  readProfileResponse,
  saveProfile,
} from "./profile-action-utils"

async function updateTechnicianProfileRecord(
  id: string,
  values: Record<string, string>
): Promise<unknown> {
  const response = await authenticatedBackendFetch(`/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
    cache: "no-store",
  })
  return readProfileResponse(response)
}

export async function getTechnicianProfile() {
  const access = await getProfileSession("technician")
  if (!access.ok) return access
  return loadProfile("technician", access.session)
}

export async function updateTechnicianProfile(
  values: ProfileValues,
  photo: File | null = null
): Promise<ProfileResult> {
  return saveProfile("technician", values, photo, updateTechnicianProfileRecord)
}
