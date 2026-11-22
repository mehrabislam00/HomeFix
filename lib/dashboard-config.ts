import {
  CalendarCheck,
  CirclePlus,
  CreditCard,
  LayoutGrid,
  ListChecks,
  User,
  Wrench,
  type LucideIcon,
} from "lucide-react"

export type DashboardVariant = "customer" | "technician"

export type DashboardNavItem = {
  label: string
  href: string
  icon: LucideIcon
}

type DashboardConfig = {
  /** Pill under the logo in the sidebar. */
  label: string
  /** Overview route; every nav href lives under it. */
  basePath: string
  nav: DashboardNavItem[]
}

const CUSTOMER_BASE = "/customer-dashboard"
const TECHNICIAN_BASE = "/technician-dashboard"

/**
 * Single source of truth for dashboard navigation. Sidebar, mobile drawer and
 * account menus all read from here, so the two dashboards share one shell and
 * only differ by this config. (Resolved on the client: icons are components.)
 */
export const dashboardConfig: Record<DashboardVariant, DashboardConfig> = {
  customer: {
    label: "Customer Dashboard",
    basePath: CUSTOMER_BASE,
    nav: [
      { label: "Overview", href: CUSTOMER_BASE, icon: LayoutGrid },
      {
        label: "My Bookings",
        href: `${CUSTOMER_BASE}/bookings`,
        icon: CalendarCheck,
      },
      {
        label: "Payment History",
        href: `${CUSTOMER_BASE}/payments`,
        icon: CreditCard,
      },
      { label: "Profile", href: `${CUSTOMER_BASE}/profile`, icon: User },
    ],
  },
  technician: {
    label: "Technician Panel",
    basePath: TECHNICIAN_BASE,
    nav: [
      { label: "Overview", href: TECHNICIAN_BASE, icon: LayoutGrid },
      {
        label: "Add Service",
        href: `${TECHNICIAN_BASE}/add-service`,
        icon: CirclePlus,
      },
      {
        label: "My Services",
        href: `${TECHNICIAN_BASE}/my-services`,
        icon: Wrench,
      },
      {
        label: "Manage Requests",
        href: `${TECHNICIAN_BASE}/requests`,
        icon: ListChecks,
      },
      { label: "Profile", href: `${TECHNICIAN_BASE}/profile`, icon: User },
    ],
  },
}

/** Where a signed-in user's "Dashboard" link should go. */
export const dashboardHref = (role?: string | null) =>
  role === "technician" ? TECHNICIAN_BASE : CUSTOMER_BASE