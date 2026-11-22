"use server"

import { redirect } from "next/navigation"

/**
 * PLACEHOLDER sign-out. Replace the body with your auth provider's sign-out
 * (invalidate the session server-side and clear the session cookie), then redirect.
 * It runs on the server, so the session can't be left alive by the client.
 */
export async function signOut() {
  // e.g. await auth.signOut(); cookies().delete(<your session cookie>);
  redirect("/login")
}