import { NextResponse, type NextRequest } from "next/server"

import { auth } from "@/lib/auth"
import { exchangeAndStoreAccessToken } from "@/lib/server-jwt"
import {
  destinationForRole,
  requiredRoleForPath,
  safeReturnTo,
} from "@/lib/route-access"

export async function GET(request: NextRequest) {
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("next"))
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    })

    const role = session?.user.role
    const destination = destinationForRole(role, returnTo)
    if (!destination) {
      const loginPath =
        requiredRoleForPath(returnTo ?? "") === "admin"
          ? "/admin/login"
          : "/login"
      const loginUrl = new URL(loginPath, request.url)
      if (returnTo) loginUrl.searchParams.set("next", returnTo)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete("homefix-registration-role")
      return response
    }

    try {
      await exchangeAndStoreAccessToken()
    } catch (error) {
      console.error("Unable to exchange the Better Auth session for JWT.", error)
    }

    const response = NextResponse.redirect(new URL(destination, request.url))
    response.cookies.delete("homefix-registration-role")
    return response
  } catch (error) {
    console.error("Unable to complete authentication redirect.", error)
    const loginUrl = new URL(
      requiredRoleForPath(returnTo ?? "") === "admin"
        ? "/admin/login"
        : "/login",
      request.url
    )
    if (returnTo) loginUrl.searchParams.set("next", returnTo)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete("homefix-registration-role")
    return response
  }
}
