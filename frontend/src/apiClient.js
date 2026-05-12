import { DEMO_DASHBOARD_TOKEN, normalizeDashboardDemoPreset } from './dashboard/dashboardDemo.js'

const TOKEN_KEY = 'henry_auth_token_v1'
const DEMO_PRESET_KEY = 'henry_demo_dashboard_preset_v1'

/** Thrown when the API responds with a non-OK status; preserves `status` and optional `code` from JSON. */
export class ApiError extends Error {
  constructor(message, { status = 0, code = null, detail = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code ?? null
    this.detail = detail ?? null
  }
}

function normalizeApiBase(raw) {
  const trimmed = String(raw || '').trim().replace(/\/$/, '')
  // Common Azure hostname typo seen in deployment secrets.
  return trimmed.replace('henry-dev-api-cvcpd', 'henry-dev-api-cycpd')
}

export function getApiBase() {
  const fromEnv = import.meta.env.VITE_API_URL

  // For non-local browser hosts, prefer explicit backend URL when provided.
  // This keeps custom domains working even if /api proxy rewriting is missing.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    const isLocalHost =
      host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.local')
    if (!isLocalHost) {
      if (fromEnv && String(fromEnv).trim()) {
        return normalizeApiBase(fromEnv)
      }
      return ''
    }
    // Local dev: same-origin `/api/...` — Vite proxies to the backend (see `vite.config.js`) to avoid CORS.
    if (import.meta.env.DEV && import.meta.env.VITE_API_DIRECT !== 'true') {
      return ''
    }
  }

  if (import.meta.env.PROD && (!fromEnv || !String(fromEnv).trim())) {
    console.error(
      '[henry] VITE_API_URL is missing. Set it in GitHub Actions (secret) for Azure Static Web Apps.',
    )
  }
  return normalizeApiBase(fromEnv || 'http://localhost:5000')
}

/** Keep in sync with `backend/lib/tenantSlugFromHost.js`. */
function tenantSlugFromHost(hostname) {
  let host = String(hostname || '')
    .trim()
    .toLowerCase()
  if (!host) return null
  while (host.startsWith('www.')) host = host.slice(4)
  if (host === 'harland.goaskhenry.com' || host === 'harlandmedical.goaskhenry.com') return 'harland'
  if (
    (host.startsWith('harland.') || host.startsWith('harlandmedical.')) &&
    host.endsWith('.goaskhenry.com')
  ) {
    return 'harland'
  }
  return null
}

/** Harland workspace on apex host: `goaskhenry.com/harland` (and `/harland/...` routes). */
function tenantSlugFromPathname(pathname) {
  const p = String(pathname || '').split('?')[0]
  if (/^\/harland(\/|$)/i.test(p)) return 'harland'
  return null
}

export function isHarlandTenantHostname(hostname) {
  return Boolean(tenantSlugFromHost(hostname))
}

/** True for Harland Medical demo / production workspace users (slug, preset, or email domain). */
export function isHarlandWorkspaceUser(user) {
  if (!user || typeof user !== 'object') return false
  if (user.slug === 'harland') return true
  if (user.dashboardPreset === 'harland') return true
  const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : ''
  if (/@harlandmedical\.com$/i.test(email)) return true
  return false
}

/**
 * Browser URL for Harland on apex / localhost (not on `harland.*` subdomains). Honors Vite `base` / `VITE_BASE_PATH`.
 */
export function harlandApexDashboardPath() {
  const raw = import.meta.env.BASE_URL
  const viteTrim = typeof raw === 'string' && raw !== '/' ? String(raw).replace(/\/$/, '') : ''
  if (!viteTrim) return '/harland'
  return `${viteTrim}/harland`
}

/**
 * React Router basename for the client dashboard. Harland on apex uses `/harland` (or `{base}/harland`).
 * On `harland.*.goaskhenry.com`, basename stays the Vite app base only so URLs stay on the subdomain root.
 */
export function clientDashboardBasename(user) {
  const raw = import.meta.env.BASE_URL
  const viteTrim = typeof raw === 'string' && raw !== '/' ? String(raw).replace(/\/$/, '') : ''
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const onHarlandHost = Boolean(tenantSlugFromHost(host))
  const useHarlandPath =
    Boolean(user && isHarlandWorkspaceUser(user)) && typeof window !== 'undefined' && !onHarlandHost

  if (!useHarlandPath) {
    return viteTrim || undefined
  }
  if (!viteTrim) return '/harland'
  return `${viteTrim}/harland`
}

export function getTenantSlug() {
  if (typeof window === 'undefined') return null
  const byQuery = new URLSearchParams(window.location.search).get('tenant')
  if (byQuery) return String(byQuery).trim().toLowerCase()

  const fromPath = tenantSlugFromPathname(window.location.pathname)
  if (fromPath) return fromPath

  const host = window.location.hostname
  const isLocal =
    host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host.endsWith('.local')
  if (isLocal) {
    // `VITE_TENANT_SLUG` was causing sign-in 401s on localhost (user slug in DB != harland). Use
    // `?tenant=...` or open `/harland` when you need the Harland tenant locally.
    return null
  }

  // Hostname beats build-time VITE_TENANT_SLUG so one SWA build works for goaskhenry.com (no tenant)
  // and harland*.goaskhenry.com (Harland) without sending the wrong X-Tenant-Slug on the apex domain.
  const fromHost = tenantSlugFromHost(host)
  if (fromHost) return fromHost

  const fromEnv = String(import.meta.env.VITE_TENANT_SLUG || '')
    .trim()
    .toLowerCase()
  if (fromEnv) return fromEnv
  return null
}

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('henry_session_v1')
  localStorage.removeItem(DEMO_PRESET_KEY)
}

export function isDemoDashboardToken(token) {
  return typeof token === 'string' && token === DEMO_DASHBOARD_TOKEN
}

/** Local-only dashboard preview (Dashboard #2 / #3 / #10 + Harland). Does not hit `/api/auth/*`. */
export function activateDashboardDemo(presetRaw) {
  const k = normalizeDashboardDemoPreset(presetRaw)
  if (!k) return false
  localStorage.setItem(TOKEN_KEY, DEMO_DASHBOARD_TOKEN)
  localStorage.setItem(DEMO_PRESET_KEY, k)
  return true
}

export function readPersistedDemoPresetKey() {
  if (typeof window === 'undefined') return null
  return normalizeDashboardDemoPreset(localStorage.getItem(DEMO_PRESET_KEY) || '') ?? 'henry1'
}

function bearerForApi(raw) {
  return raw && !isDemoDashboardToken(raw) ? raw : undefined
}

async function requestJson(url, { method, headers, body, signal }) {
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })
  const data = await res.json().catch(() => ({}))
  return { res, data }
}

export async function apiJson(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const tenantSlug = getTenantSlug()
  if (tenantSlug) headers['X-Tenant-Slug'] = tenantSlug
  const t = token === undefined ? getToken() : token
  const bearer = bearerForApi(t)
  if (bearer) headers.Authorization = `Bearer ${bearer}`
  const base = getApiBase()
  const directBase = normalizeApiBase(import.meta.env.VITE_API_URL)
  const primaryUrl = `${base}${path}`
  const canTryProxy = typeof window !== 'undefined' && String(path).startsWith('/')
  let primary
  try {
    primary = await requestJson(primaryUrl, { method, headers, body, signal })
  } catch {
    // If direct API is down, try same-origin /api proxy once.
    if (base && canTryProxy) {
      try {
        const fallback = await requestJson(path, { method, headers, body, signal })
        if (!fallback.res.ok) {
          const msg = fallback.data.message || `Request failed (${fallback.res.status})`
          throw new ApiError(msg, {
            status: fallback.res.status,
            code: fallback.data.code ?? null,
            detail: fallback.data.debug ?? null,
          })
        }
        return fallback.data
      } catch {
        // fall through to user-facing network error below
      }
    }
    // If proxy/base is empty and failed, try direct API URL once.
    if (!base && directBase) {
      try {
        const fallback = await requestJson(`${directBase}${path}`, { method, headers, body, signal })
        if (!fallback.res.ok) {
          const msg = fallback.data.message || `Request failed (${fallback.res.status})`
          throw new ApiError(msg, {
            status: fallback.res.status,
            code: fallback.data.code ?? null,
            detail: fallback.data.debug ?? null,
          })
        }
        return fallback.data
      } catch {
        // fall through to user-facing network error below
      }
    }
    const where = base || (typeof window !== 'undefined'
      ? `${window.location.origin}/api (same-origin proxy)`
      : '/api (same-origin proxy)')
    const hint =
      typeof window !== 'undefined' && window.location?.protocol === 'https:' && base.startsWith('http:')
        ? ' The site is HTTPS but VITE_API_URL uses HTTP — use an https API URL or a proxy.'
        : ' Is the API running? Check VITE_API_URL, Static Web App /api proxy, and the Network tab.'
    throw new Error(`Cannot reach API at ${where}.${hint}`)
  }

  const { res, data } = primary

  // Retry once with alternate endpoint for common proxy/backend mismatch statuses.
  if (res.status === 404 || res.status === 405 || res.status === 502 || res.status === 503 || res.status === 504) {
    if (base && canTryProxy) {
      const retry = await requestJson(path, { method, headers, body, signal })
      if (retry.res.ok) return retry.data
    } else if (!base && directBase) {
      const retry = await requestJson(`${directBase}${path}`, { method, headers, body, signal })
      if (retry.res.ok) return retry.data
    }
  }

  if (!res.ok) {
    const msg = data.message || `Request failed (${res.status})`
    throw new ApiError(msg, {
      status: res.status,
      code: data.code ?? null,
      detail: data.debug ?? null,
    })
  }
  return data
}
