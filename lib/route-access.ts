export type AppRole = "customer" | "technician" | "admin"

const dashboardPaths: Record<AppRole, string> = {
  customer: "/customer-dashboard",
  technician: "/technician-dashboard",
  admin: "/admin-dashboard",
}

const protectedRoutes: Array<{ prefix: string; role: AppRole }> = [
  { prefix: "/customer-dashboard", role: "customer" },
  { prefix: "/technician-dashboard", role: "technician" },
  { prefix: "/admin-dashboard", role: "admin" },
  { prefix: "/admin", role: "admin" },
]

export function isAppRole(role: unknown): role is AppRole {
  return role === "customer" || role === "technician" || role === "admin"
}

export function dashboardPathForRole(role: unknown): string | null {
  return isAppRole(role) ? dashboardPaths[role] : null
}

export function requiredRoleForPath(pathname: string): AppRole | null {
  if (pathname === "/admin/login") return null

  const route = protectedRoutes.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
  return route?.role ?? null
}

export function safeReturnTo(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f]/.test(value)
  ) {
    return null
  }

  try {
    const url = new URL(value, "https://homefix.invalid")
    if (
      url.origin !== "https://homefix.invalid" ||
      !url.pathname.startsWith("/") ||
      url.pathname.startsWith("//") ||
      url.pathname.includes("\\")
    ) {
      return null
    }
    if (
      url.pathname === "/auth/complete" ||
      url.pathname === "/login" ||
      url.pathname === "/register" ||
      url.pathname === "/admin/login"
    ) {
      return null
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

export function destinationForRole(
  role: unknown,
  returnTo: unknown
): string | null {
  const dashboardPath = dashboardPathForRole(role)
  if (!dashboardPath) return null

  const safePath = safeReturnTo(returnTo)
  if (!safePath) return dashboardPath

  const requestedRole = requiredRoleForPath(
    new URL(safePath, "https://homefix.invalid").pathname
  )
  return requestedRole && requestedRole !== role ? dashboardPath : safePath
}

export function authCompletionPath(returnTo: unknown): string {
  const safePath = safeReturnTo(returnTo)
  return safePath
    ? `/auth/complete?next=${encodeURIComponent(safePath)}`
    : "/auth/complete"
}
