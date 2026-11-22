import { NextResponse, type NextRequest } from "next/server"

import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    })

    const destination =
      session?.user.role === "customer"
        ? "/customer-dashboard"
        : session?.user.role === "technician"
          ? "/technician-dashboard"
          : "/login"
    const response = NextResponse.redirect(new URL(destination, request.url))
    response.cookies.delete("homefix-registration-role")
    return response
  } catch (error) {
    console.error("Unable to complete authentication redirect.", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
