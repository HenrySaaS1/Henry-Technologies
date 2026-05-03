import { AUTH_BYPASS } from '../authBypass.js'
import { DEFAULT_PRODUCT_IDS } from '../productCatalog.js'
import { PRESET_DEMO_EMAILS } from './registry.js'

/** Bearer value stored locally — never sent to `/api`; apiClient skips Authorization for this marker. */
export const DEMO_DASHBOARD_TOKEN = '__HENRY_DASHBOARD_DEMO_V1'

/** Preset keys for the three Henry product dashboards (+ Harland). */
export const DASHBOARD_DEMO_PRESETS_ORDER = /** @type {const} */ [
  ['henry1', 'Dashboard #2 · single-site'],
  ['henry3', 'Dashboard #3 · three-site'],
  ['henry10', 'Dashboard #10 · ten-site'],
  ['harland', 'Harland Medical'],
]

const PRESET_META = {
  henry1: {
    email: PRESET_DEMO_EMAILS.henry1,
    company: 'Henry Workspace',
    slug: 'henry1',
    planId: 'plus',
    dashboardPreset: 'henry1',
  },
  henry3: {
    email: PRESET_DEMO_EMAILS.henry3,
    company: 'Henry Workspace — 3 sites',
    slug: 'henry3',
    planId: 'plus',
    dashboardPreset: 'henry3',
  },
  henry10: {
    email: PRESET_DEMO_EMAILS.henry10,
    company: 'Henry Workspace — 10 sites',
    slug: 'henry10',
    planId: 'plus',
    dashboardPreset: 'henry10',
  },
  harland: {
    email: 'landerson@harlandmedical.com',
    company: 'Harland Medical Systems',
    slug: 'harland',
    planId: 'premium',
    dashboardPreset: 'harland',
  },
}

/**
 * Demo shortcuts on Sign In / Sign Up: on in production builds unless `VITE_DASHBOARD_DEMOS=false`;
 * hidden when dev auth bypass is on; in dev, show only if explicitly enabled.
 */
export function dashboardDemoShortcutsVisible() {
  if (AUTH_BYPASS) return false
  try {
    if (typeof import.meta === 'undefined' || !import.meta.env) return false
    const env = String(import.meta.env.VITE_DASHBOARD_DEMOS || '').trim().toLowerCase()
    if (env === 'false' || env === '0') return false
    if (env === 'true' || env === '1') return true
    return import.meta.env.PROD === true
  } catch {
    return false
  }
}

/** @returns {'henry1' | 'henry3' | 'henry10' | 'harland' | null} */
export function normalizeDashboardDemoPreset(raw) {
  const k = String(raw || '').trim().toLowerCase()
  return k in PRESET_META ? /** @type {any} */ (k) : null
}

/** Client `mapUser`-shaped object for dashboards (no API). */
export function dashboardDemoUser(presetKey) {
  const k = normalizeDashboardDemoPreset(presetKey) ?? 'henry1'
  const meta = PRESET_META[k]
  const nowIso = new Date().toISOString()
  return {
    email: meta.email,
    company: meta.company,
    slug: meta.slug,
    dashboardPreset: meta.dashboardPreset,
    products: [...DEFAULT_PRODUCT_IDS],
    planId: meta.planId,
    createdAt: nowIso,
    lastLoginAt: nowIso,
    onboardingComplete: true,
    onboarding: null,
  }
}
