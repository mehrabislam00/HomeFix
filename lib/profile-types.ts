import type { Customer } from "@/lib/dashboard-data"

/** Editable fields supported by Better Auth's authenticated user update API. */
export type ProfileValues = {
  name: string
  phone: string
  area: string
  bio: string
}

export type ProfileResult =
  | { ok: true; image?: string }
  | { ok: false; error: string }

export type ProfileLoadResult =
  | { ok: true; customer: Customer }
  | {
      ok: false
      unauthorized: boolean
      error: string
      redirectTo?: string
    }
