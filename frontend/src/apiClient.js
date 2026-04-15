const TOKEN_KEY = 'henry_auth_token_v1'

export function getApiBase() {
  // On Azure Static Web Apps, build injects a same-origin /api/* proxy to App Service
  // (see scripts/inject-swa-api-proxy.mjs + public/staticwebapp.config.json).
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.azurestaticapps.net')) {
    return ''
  }

  const fromEnv = import.meta.env.VITE_API_URL
  if (import.meta.env.PROD && (!fromEnv || !String(fromEnv).trim())) {
    console.error(
      '[henry] VITE_API_URL is missing. Set it in GitHub Actions (secret) for Azure Static Web Apps.',
    )
  }
  return (fromEnv || 'http://localhost:5000').replace(/\/$/, '')
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
}

export async function apiJson(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const t = token === undefined ? getToken() : token
  if (t) headers.Authorization = `Bearer ${t}`
  const url = `${getApiBase()}${path}`
  let res
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch {
    const base = getApiBase()
    const where =
      base ||
      (typeof window !== 'undefined'
        ? `${window.location.origin}/api (same-origin proxy)`
        : '/api (same-origin proxy)')
    const hint =
      typeof window !== 'undefined' && window.location?.protocol === 'https:' && base.startsWith('http:')
        ? ' The site is HTTPS but VITE_API_URL uses HTTP — use an https API URL or a proxy.'
        : ' Is the API running? Check VITE_API_URL, Static Web App /api proxy, and the Network tab.'
    throw new Error(`Cannot reach API at ${where}.${hint}`)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data
}
