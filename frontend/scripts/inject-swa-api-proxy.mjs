/**
 * At build time, injects an Azure Static Web Apps route so /api/* is proxied
 * to VITE_API_URL. The browser then calls same-origin /api/... (no CORS to App Service).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = join(__dirname, '..', 'public', 'staticwebapp.config.json')

let raw = (process.env.VITE_API_URL || '').trim()
if (!raw) {
  console.warn('[inject-swa-api-proxy] VITE_API_URL is empty; skipping /api proxy (local or misconfigured CI).')
  process.exit(0)
}

// Common typo: Azure default domain uses "cycpd", not "cvcpd" (DNS fails for cvcpd).
if (raw.includes('henry-dev-api-cvcpd')) {
  raw = raw.replaceAll('henry-dev-api-cvcpd', 'henry-dev-api-cycpd')
  console.warn('[inject-swa-api-proxy] Corrected hostname typo cvcpd → cycpd in VITE_API_URL.')
}

const backend = raw.replace(/\/$/, '')
const cfg = JSON.parse(readFileSync(configPath, 'utf8'))

const proxyRoute = {
  route: '/api/*',
  allowedRoles: ['anonymous'],
  rewrite: `${backend}/api/*`,
}

const existing = Array.isArray(cfg.routes) ? cfg.routes : []
const withoutDup = existing.filter((r) => r?.route !== '/api/*')
cfg.routes = [proxyRoute, ...withoutDup]

cfg.navigationFallback = cfg.navigationFallback || {}
const ex = Array.isArray(cfg.navigationFallback.exclude) ? cfg.navigationFallback.exclude : []
if (!ex.includes('/api/*')) {
  cfg.navigationFallback.exclude = [...ex, '/api/*']
}

writeFileSync(configPath, `${JSON.stringify(cfg, null, 2)}\n`)
console.log('[inject-swa-api-proxy] Wrote /api/* proxy to', backend)
