import type { Metadata } from "next"
import Link from "next/link"
import { CirclePlus } from "lucide-react"

import { PageHeader } from "@/components/Dashboard/page-header"
import { SampleDataNotice } from "@/components/Dashboard/sample-data-notice"
import { ServicesList } from "@/components/Technician/services-list"
import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import { getTechnicianServices } from "@/lib/technician-data"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "My Services — HomeFix Technician" }

const MyServices = async () => {
  const services = await getTechnicianServices()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Services"
        description="Manage your listings, availability and approval status."
        action={
          <Button
            className={cn(btn.lg, btn.primary, "shine relative overflow-hidden")}
            asChild
          >
            <Link href="/technician-dashboard/add-service">
              <CirclePlus aria-hidden className="size-4" />
              Add service
            </Link>
          </Button>
        }
      />
      <SampleDataNotice />
      {/* Pass `actions` (toggle / edit / delete handlers) to enable the controls. */}
      <ServicesList services={services} />
    </div>
  )
}

export default MyServices