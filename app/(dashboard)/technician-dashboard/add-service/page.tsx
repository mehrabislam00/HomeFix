import type { Metadata } from "next"

import { PageHeader } from "@/components/Dashboard/page-header"
import { AddServiceForm } from "@/components/Technician/add-service-form"

export const metadata: Metadata = { title: "Add Service — HomeFix Technician" }

const AddService = () => (
  <div className="flex flex-col gap-6">
    <PageHeader
      title="Add a new service"
      description="Describe what you offer. Our team reviews every listing before it goes live."
    />
    {/* Pass `onSubmit` (a server action that creates the service) to go live. */}
    <AddServiceForm />
  </div>
)

export default AddService