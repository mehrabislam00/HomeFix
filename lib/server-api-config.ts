import "server-only"

const DEVELOPMENT_BACKEND_API_URL = "http://localhost:5000"
const BACKEND_API_URL_ENV = "NEXT_PUBLIC_API_BASE_URL"
const LEGACY_BACKEND_API_URL_ENV = "HOMEFIX_BACKEND_API_URL"

function isProductionRuntime() {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  )
}

function isLoopbackHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "")
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "::1" ||
    /^127(?:\.\d{1,3}){3}$/.test(host)
  )
}

function parseBaseUrl(value: string, name: string) {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${name} must be a valid absolute URL.`)
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      `${name} must be an HTTP(S) base URL without credentials or query parameters.`
    )
  }

  return url
}

export function assertProductionHttpsUrl(
  name: string,
  value: string | undefined
) {
  if (!isProductionRuntime()) return
  if (!value) {
    throw new Error(`${name} must be configured for production.`)
  }

  const url = parseBaseUrl(value, name)
  if (url.protocol !== "https:" || isLoopbackHostname(url.hostname)) {
    throw new Error(`${name} must use HTTPS and a non-localhost host in production.`)
  }
}

export function backendApiBaseUrl() {
  const configuredUrl =
    process.env[BACKEND_API_URL_ENV]?.trim() ||
    process.env[LEGACY_BACKEND_API_URL_ENV]?.trim()
  const productionRuntime = isProductionRuntime()
  if (productionRuntime && !configuredUrl) {
    throw new Error(
      `${BACKEND_API_URL_ENV} must be configured for production.`
    )
  }

  const value = configuredUrl || DEVELOPMENT_BACKEND_API_URL
  const url = parseBaseUrl(value, BACKEND_API_URL_ENV)
  if (
    productionRuntime &&
    (url.protocol !== "https:" || isLoopbackHostname(url.hostname))
  ) {
    throw new Error(
      `${BACKEND_API_URL_ENV} must use HTTPS and a non-localhost host in production.`
    )
  }

  return value.replace(/\/+$/, "")
}
