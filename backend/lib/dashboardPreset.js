/** Valid stored/API dashboard preset keys (productized layouts #1 base + #2/#3/#10 variants, Harland branding). */
const VALID = new Set(['henry1', 'henry3', 'henry10', 'harland'])

function normalizePreset(value) {
  if (typeof value !== 'string') return null
  const s = value.trim().toLowerCase()
  return VALID.has(s) ? s : null
}

/**
 * Resolve preset from optional DB value plus legacy rules (demo emails, slug, Harland domain/company).
 */
export function inferDashboardPreset({ email, slug, company, dashboardPreset }) {
  const stored = normalizePreset(dashboardPreset)
  if (stored) return stored
  const norm = String(email || '').trim().toLowerCase()
  const slugKey = String(slug || '').trim().toLowerCase()
  if (norm === 'henry1@gmail.com' || slugKey === 'henry1') return 'henry1'
  if (norm === 'henry3@gmail.com' || slugKey === 'henry3') return 'henry3'
  if (norm === 'henry10@gmail.com' || slugKey === 'henry10') return 'henry10'
  if (/@harlandmedical\.com$/i.test(norm) || slugKey === 'harland') return 'harland'
  if (typeof company === 'string' && company.toLowerCase().includes('harland')) return 'harland'
  return null
}

/** For register/create: optional client `dashboardPreset` wins; else infer from tenant slug + email/company. */
export function resolveDashboardPresetForCreate({ email, slug, company, requestedPreset }) {
  const fromBody = normalizePreset(requestedPreset)
  if (fromBody) return fromBody
  return inferDashboardPreset({
    email,
    slug,
    company,
    dashboardPreset: null,
  })
}

export const VALID_DASHBOARD_PRESETS = VALID
export { normalizePreset as normalizeDashboardPreset }
