"use server"

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
