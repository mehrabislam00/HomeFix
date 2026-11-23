"use server"

import { revalidatePath, unstable_cache, updateTag } from "next/cache"

import {
  PUBLIC_SERVICE_LIST_TAG,
  PUBLIC_SERVICE_REVALIDATE_SECONDS,
  publicServiceCacheTag,
  publicServiceDetailCacheTags,
} from "@/lib/cache-tags"
import { getProfileSession } from "@/lib/Action/profile-action-utils"
import {
  normalizeService,
  normalizeTechnicianService,
  unwrapCollection,
} from "@/lib/service-booking-data"
import { requestServiceBookingApi } from "@/lib/service-booking-api"
import type { ServiceListing } from "@/lib/service-booking-data"
import type {
  NewServiceResult,
  NewServiceValues,
  ServiceUpdateValues,
  TechnicianService,
} from "@/lib/technician-data"
import { SERVICE_DESCRIPTION_MAX } from "@/lib/technician-data"
import { serviceCategories } from "@/lib/services-data"

function validateServiceValues(
  values: ServiceUpdateValues
): string | undefined {
  if (
    !values ||
    typeof values.title !== "string" ||
    !values.title.trim() ||
    typeof values.category !== "string" ||
    !serviceCategories.some((category) => category.label === values.category) ||
    typeof values.description !== "string" ||
    values.description.trim().length < 20 ||
    values.description.length > SERVICE_DESCRIPTION_MAX ||
    typeof values.availability !== "string" ||
    typeof values.acceptingBookings !== "boolean" ||
    !Number.isFinite(values.price) ||
    values.price <= 0
  ) {
    return "Enter valid service details before saving."
  }
  return undefined
}

async function getTechnicianId() {
  const access = await getProfileSession("technician")
  if (!access.ok) throw new Error(access.error)
  return access.session.user.id
}

async function servicesAt(path: string): Promise<ServiceListing[]> {
  const result = await requestServiceBookingApi(path)
  return unwrapCollection(result, ["services", "results"]).map(normalizeService)
}

function cachedPublicServices(path: string) {
  return unstable_cache(() => servicesAt(path), ["public-service-list", path], {
    revalidate: PUBLIC_SERVICE_REVALIDATE_SECONDS,
    tags: [PUBLIC_SERVICE_LIST_TAG],
  })()
}

function cachedPublicService(serviceId: string) {
  return unstable_cache(
    async () =>
      normalizeService(
        await requestServiceBookingApi(
          `/services/${encodeURIComponent(serviceId)}`
        )
      ),
    ["public-service-detail", serviceId],
    {
      revalidate: PUBLIC_SERVICE_REVALIDATE_SECONDS,
      tags: publicServiceDetailCacheTags(serviceId),
    }
  )()
}

function invalidatePublicServiceCache(serviceId?: string) {
  updateTag(PUBLIC_SERVICE_LIST_TAG)
  if (serviceId) updateTag(publicServiceCacheTag(serviceId))
}

export async function getAvailableServices(
  category?: string
): Promise<ServiceListing[]> {
  const path = category
    ? `/services/category/${encodeURIComponent(category)}`
    : "/services"
  return cachedPublicServices(path)
}

export async function getServiceById(id: string): Promise<ServiceListing> {
  return cachedPublicService(id)
}

export async function getTechnicianServiceListings(): Promise<
  ServiceListing[]
> {
  const id = await getTechnicianId()
  return servicesAt(`/technicians/${encodeURIComponent(id)}/services`)
}

export async function getTechnicianServices(): Promise<TechnicianService[]> {
  const id = await getTechnicianId()
  const result = await requestServiceBookingApi(
    `/technicians/${encodeURIComponent(id)}/services`
  )
  return unwrapCollection(result, ["services", "results"]).map(
    normalizeTechnicianService
  )
}

async function imageDataUrl(image: File | null) {
  if (!image) return undefined
  const bytes = Buffer.from(await image.arrayBuffer())
  return `data:${image.type};base64,${bytes.toString("base64")}`
}

export async function createTechnicianService(
  values: NewServiceValues
): Promise<NewServiceResult> {
  const validationError = validateServiceValues(values)
  if (validationError) return { ok: false, error: validationError }
  const imageFile = values.image
  if (
    imageFile !== null &&
    (typeof imageFile !== "object" ||
      typeof imageFile.type !== "string" ||
      !["image/jpeg", "image/png"].includes(imageFile.type) ||
      imageFile.size <= 0 ||
      imageFile.size > 5 * 1024 * 1024)
  ) {
    return { ok: false, error: "Choose a JPG or PNG image smaller than 5 MB." }
  }

  try {
    const technicianId = await getTechnicianId()
    const image = await imageDataUrl(values.image)
    await requestServiceBookingApi(
      `/technicians/${encodeURIComponent(technicianId)}/services`,
      {
        method: "POST",
        body: JSON.stringify({
          technicianId,
          title: values.title.trim(),
          category: values.category,
          basePrice: values.price,
          description: values.description.trim(),
          availability: values.availability.trim(),
          isAvailable: values.acceptingBookings,
          ...(image ? { image } : {}),
        }),
      }
    )
    invalidatePublicServiceCache()
    revalidatePath("/")
    revalidatePath("/services")
    revalidatePath("/technician-dashboard")
    revalidatePath("/technician-dashboard/my-services")
    revalidatePath("/admin-dashboard")
    revalidatePath("/admin-dashboard/approvals")
    revalidatePath("/admin-dashboard/users")
    return { ok: true }
  } catch (error) {
    console.error("Unable to create technician service.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit your service. Please try again.",
    }
  }
}

export async function updateTechnicianService(
  serviceId: string,
  values: ServiceUpdateValues
): Promise<NewServiceResult> {
  const validationError = validateServiceValues(values)
  if (validationError) return { ok: false, error: validationError }
  if (typeof serviceId !== "string" || !serviceId.trim()) {
    return { ok: false, error: "Choose a valid service to update." }
  }

  try {
    const technicianId = await getTechnicianId()
    await requestServiceBookingApi(
      `/services/${encodeURIComponent(serviceId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          technicianId,
          title: values.title.trim(),
          category: values.category,
          basePrice: values.price,
          description: values.description.trim(),
          availability: values.availability.trim(),
          isAvailable: values.acceptingBookings,
        }),
      }
    )
    invalidatePublicServiceCache(serviceId)
    revalidatePath("/")
    revalidatePath("/services")
    revalidatePath("/technician-dashboard")
    revalidatePath("/technician-dashboard/my-services")
    revalidatePath("/admin-dashboard")
    revalidatePath("/admin-dashboard/approvals")
    revalidatePath("/admin-dashboard/users")
    return { ok: true }
  } catch (error) {
    console.error("Unable to update technician service.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update your service. Please try again.",
    }
  }
}

export async function updateTechnicianServiceAvailability(
  serviceId: string,
  acceptingBookings: boolean
): Promise<NewServiceResult> {
  if (
    typeof serviceId !== "string" ||
    !serviceId.trim() ||
    typeof acceptingBookings !== "boolean"
  ) {
    return { ok: false, error: "Choose a valid service availability." }
  }

  try {
    const technicianId = await getTechnicianId()
    await requestServiceBookingApi(
      `/services/${encodeURIComponent(serviceId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          technicianId,
          isAvailable: acceptingBookings,
        }),
      }
    )
    invalidatePublicServiceCache(serviceId)
    revalidatePath("/")
    revalidatePath("/services")
    revalidatePath("/technician-dashboard")
    revalidatePath("/technician-dashboard/my-services")
    revalidatePath("/admin-dashboard")
    revalidatePath("/admin-dashboard/approvals")
    revalidatePath("/admin-dashboard/users")
    return { ok: true }
  } catch (error) {
    console.error("Unable to update service availability.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update availability. Please try again.",
    }
  }
}

export async function deleteTechnicianService(
  serviceId: string
): Promise<NewServiceResult> {
  if (typeof serviceId !== "string" || !serviceId.trim()) {
    return { ok: false, error: "Choose a valid service to delete." }
  }

  try {
    const technicianId = await getTechnicianId()
    await requestServiceBookingApi(
      `/services/${encodeURIComponent(serviceId)}`,
      {
        method: "DELETE",
        body: JSON.stringify({ technicianId }),
      }
    )
    invalidatePublicServiceCache(serviceId)
    revalidatePath("/")
    revalidatePath("/services")
    revalidatePath("/technician-dashboard")
    revalidatePath("/technician-dashboard/my-services")
    revalidatePath("/admin-dashboard")
    revalidatePath("/admin-dashboard/approvals")
    revalidatePath("/admin-dashboard/users")
    return { ok: true }
  } catch (error) {
    console.error("Unable to delete technician service.", error)
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to delete your service. Please try again.",
    }
  }
}
