import type { Metadata } from "next"
import Link from "next/link"
import { CirclePlus } from "lucide-react"

import { PageHeader } from "@/components/Dashboard/page-header"
import { ApiError } from "@/components/Dashboard/api-error"

import { Button } from "@/components/ui/button"
import { btn } from "@/lib/button-styles"
import {
  getTechnicianServices,
  updateTechnicianService,
  updateTechnicianServiceAvailability,
  deleteTechnicianService,
} from "@/lib/Action/service-actions"
import { cn } from "@/lib/utils"
import { ServicesList } from "@/components/Technician/services-list"
import type { TechnicianService } from "@/lib/technician-data"

export const metadata: Metadata = { title: "My Services — HomeFix Technician" }

const MyServices = async () => {
  let services: TechnicianService[]
  try {
    services = await getTechnicianServices()
  } catch (error) {
    console.error("Unable to load technician services.", error)
    return (
      <ApiError
        message={
          error instanceof Error
            ? error.message
            : "Please try again in a moment."
        }
      />
    )
  }
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Services"
        description="Manage your listings, availability and approval status."
        action={
          <Button
            className={cn(
              btn.lg,
              btn.primary,
              "shine relative overflow-hidden"
            )}
            asChild
          >
            <Link href="/technician-dashboard/add-service">
              <CirclePlus aria-hidden className="size-4" />
              Add service
            </Link>
          </Button>
        }
      />
      <ServicesList
        services={services}
        actions={{
          onToggleAvailable: updateTechnicianServiceAvailability,
          onUpdate: updateTechnicianService,
          onDelete: deleteTechnicianService,
        }}
      />
    </div>
  )
}

export default MyServices
