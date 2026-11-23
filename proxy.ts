import { NextResponse, type NextRequest } from "next/server"

import { dashboardPathForRole } from "@/lib/route-access"
import { auth } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isGuestOnlyRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/admin/login"

  if (!isGuestOnlyRoute) return NextResponse.next()

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    })
    const dashboardPath = dashboardPathForRole(session?.user.role)
    if (dashboardPath) {
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    }
  } catch (error) {
    console.error("Unable to verify the guest-route session.", error)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/register", "/admin/login"],
}
