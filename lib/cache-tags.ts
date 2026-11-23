export type CachedProfileRole = "customer" | "technician"

export const PUBLIC_SERVICE_LIST_TAG = "public-service-listings"
export const PUBLIC_SERVICE_CATALOG_TAG = "public-service-catalog"
export const PUBLIC_SERVICE_REVALIDATE_SECONDS = 120

export function profileCacheTag(role: CachedProfileRole, userId: string) {
  return `profile:${role}:${encodeURIComponent(userId)}`
}

export function publicServiceCacheTag(serviceId: string) {
  return `public-service:${encodeURIComponent(serviceId)}`
}

export function publicServiceDetailCacheTags(serviceId: string) {
  return [PUBLIC_SERVICE_CATALOG_TAG, publicServiceCacheTag(serviceId)]
}

export function publicServiceMutationTags(serviceId?: string) {
  return [
    PUBLIC_SERVICE_LIST_TAG,
    ...(serviceId ? [publicServiceCacheTag(serviceId)] : []),
  ]
}

export function publicServiceCatalogMutationTags() {
  return [PUBLIC_SERVICE_LIST_TAG, PUBLIC_SERVICE_CATALOG_TAG]
}
