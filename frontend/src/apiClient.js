const TOKEN_KEY = 'henry_auth_token_v1'

export function getApiBase() {
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
  } catch (err) {
    const base = getApiBase()
    const hint =
      typeof window !== 'undefined' && window.location?.protocol === 'https:' && base.startsWith('http:')
        ? ' The site is HTTPS but VITE_API_URL uses HTTP — use an https API URL or a proxy.'
        : ' Is the API running? Check VITE_API_URL and browser Network tab for CORS errors.'
    throw new Error(`Cannot reach API at ${base}.${hint}`)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.message || `Request failed (${res.status})`
    throw new Error(msg)
  }
  return data
}
