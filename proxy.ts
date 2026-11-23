import { NextResponse, type NextRequest } from "next/server"

import { dashboardPathForRole, requiredRoleForPath } from "@/lib/route-access"
import { auth } from "@/lib/auth"

function requestedPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search}`
}

function redirectToLogin(request: NextRequest, role: string) {
  const targetRole = requiredRoleForPath(request.nextUrl.pathname) ?? role
  const loginPath = targetRole === "admin" ? "/admin/login" : "/login"
  const loginUrl = new URL(loginPath, request.url)
  loginUrl.searchParams.set("next", requestedPath(request))
  return NextResponse.redirect(loginUrl)
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const requiredRole = requiredRoleForPath(pathname)
  const isGuestOnlyRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/admin/login"

  if (!requiredRole && !isGuestOnlyRoute) return NextResponse.next()

  let role: string | undefined
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    })
    role = session?.user.role
  } catch (error) {
    console.error("Unable to verify the route session.", error)
    if (requiredRole) return redirectToLogin(request, requiredRole)
    return NextResponse.next()
  }

  if (requiredRole) {
    if (!role) return redirectToLogin(request, requiredRole)
    if (role !== requiredRole) {
      const dashboardPath = dashboardPathForRole(role)
      return NextResponse.redirect(
        new URL(dashboardPath ?? "/login", request.url)
      )
    }
    return NextResponse.next()
  }

  const dashboardPath = dashboardPathForRole(role)
  if (dashboardPath) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/admin",
    "/admin/:path*",
    "/customer-dashboard/:path*",
    "/technician-dashboard/:path*",
    "/admin-dashboard/:path*",
  ],
}
