"use server"

import { updateTag } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { profileCacheTag } from "@/lib/cache-tags"

export async function signOut() {
  const requestHeaders = await headers()
  try {
    const session = await auth.api.getSession({
      headers: requestHeaders,
      query: { disableCookieCache: true },
    })
    const role = session?.user.role
    if (session && (role === "customer" || role === "technician")) {
      updateTag(profileCacheTag(role, session.user.id))
    }
  } catch (error) {
    console.error("Unable to clear the signed-in profile cache.", error)
  }
  await auth.api.signOut({ headers: requestHeaders })
  redirect("/login")
}
