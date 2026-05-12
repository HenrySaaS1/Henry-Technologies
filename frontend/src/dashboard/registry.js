import henryLogo from '../assets/henry-logo.png'
import harlandMedicalSystemsLogo from '../assets/clients/harland-medical-systems-logo.png'

const VALID_PRESET_KEYS = new Set(['henry1', 'henry3', 'henry10', 'harland'])

/** Demo accounts seeded in prisma/seed.js — kept here for preset + site filtering. */
export const PRESET_DEMO_EMAILS = {
  henry1: 'henry1@gmail.com',
  henry3: 'henry3@gmail.com',
  henry10: 'henry10@gmail.com',
}

/** Shared baseline; matches single-site (Dashboard #2) chrome. Harland overrides back to Dashboard #1. */
export const WORKSPACE = {
  sub: 'Single-site Henry dashboard — United States HQ and production snapshot.',
  dashboardTemplate: {
    name: 'Dashboard #2',
    sub: 'Single-location workspace',
  },
  clientBrand: {
    mode: 'tenant-lockup',
    logoSrc: henryLogo,
    logoAlt: 'HENRY',
  },
  footprintSub:
    'United States site — leadership, local time, headcount, and efficiency for this footprint.',
  locationsLeadSub:
    'United States headquarters — open the building map for zone-level monitoring.',
  pills: [
    { className: 'green', label: 'Running 12' },
    { className: 'yellow', label: 'Idle 4' },
    { className: 'red', label: 'Alert 3' },
  ],
  anomaly: 'Anomaly: Line 07 — vibration spike detected',
  oee: '94%',
  mtbf: '120h',
  unitsLabel: 'Units / hr',
  alertsLead:
    'Live AI watches your lines and critical assets. Unacknowledged items escalate per your runbook — supervisors stay in the loop.',
  alerts: [
    {
      id: 'a1',
      severity: 'high',
      title: 'Line 07 — spindle vibration',
      detail: 'Exceeded baseline for 6 min. Operator notified; maintenance ticket opened.',
      when: '12 min ago',
    },
    {
      id: 'a2',
      severity: 'high',
      title: 'Press Cell 2 — tonnage drift',
      detail: 'Peak force 4% below recipe for 8 cycles. Engineering paged; last similar event was worn die set.',
      when: '28 min ago',
    },
    {
      id: 'a3',
      severity: 'med',
      title: 'Robot R-12 — cycle drift',
      detail: '+8% vs last week. Suggested torque recalibration after next break.',
      when: '48 min ago',
    },
    {
      id: 'a4',
      severity: 'med',
      title: 'Chiller loop B — supply temp',
      detail: 'Running 1.2°C above setpoint for 25 min. No line stop; facilities ticket auto-created.',
      when: '1 hr ago',
    },
    {
      id: 'a5',
      severity: 'low',
      title: 'Compressor room — temperature',
      detail: 'Trending up; no stoppage; facilities team on digest.',
      when: '2 hr ago',
    },
  ],
  alertsFoot: '14 machines monitored · escalation to supervisor if unacked 15 min',
  reportsLead:
    'Shift summaries roll up what happened on the floor: throughput, holds, and sign-offs.',
  reports: [
    {
      title: 'Yesterday 2nd shift',
      text: 'OEE 91.2% (target 90%). Assembly West beat plan by 240 units; Line 03 changeover added 22 min downtime.',
    },
    {
      title: 'Quality summary',
      text: '99.4% first-pass yield. Three holds on lot M-884; quarantine released after QA sign-off.',
    },
    {
      title: 'Labor & training',
      text: 'New operators on packaging — HENRY flagged slower cycles first 4 hours; coach checklist attached.',
    },
  ],
  insightsLead:
    'HENRY connects signals, MES events, and notes so you see why metrics move — not only that they moved.',
  insights: [
    {
      title: 'Correlation',
      text: 'Stops on Line 05 spike after cold starts on Line 02. Shared utility load suspected.',
    },
    {
      title: 'Forecast',
      text: 'Cell C may miss Friday ship by ~3.5 hrs unless overtime or partial offload.',
    },
    {
      title: 'Best performers',
      text: 'Maria’s crew holds lowest rework on similar SKUs; playbook shared.',
    },
  ],
}

/** Per-preset overrides (#3 / #10 multi-site, Harland branding + Dashboard #1 chrome). */
const PRESET_OVERRIDES = {
  harland: {
    sub: 'Harland Medical Systems operations dashboard — live line performance, quality, and alerts.',
    clientBrand: {
      mode: 'tenant-lockup',
      logoSrc: harlandMedicalSystemsLogo,
      logoAlt: 'Harland Medical Systems',
    },
    dashboardTemplate: {
      name: 'Dashboard #1',
      sub: 'Multi-location & multi-site clients',
    },
    footprintSub:
      'Global footprint — site leadership, local time, headcount, and efficiency by region.',
    locationsLeadSub:
      'Regional production sites — open a building map for zone-level monitoring.',
  },
  henry3: {
    sub: 'Three-site Henry dashboard — Americas and Ireland production snapshot.',
    clientBrand: {
      mode: 'tenant-lockup',
      logoSrc: henryLogo,
      logoAlt: 'HENRY',
    },
    dashboardTemplate: {
      name: 'Dashboard #3',
      sub: 'Three-location workspace',
    },
    footprintSub:
      'United States, Ireland, and Costa Rica — leadership, local time, headcount, and efficiency by site.',
    locationsLeadSub:
      'Three production sites — open a building map for zone-level monitoring.',
  },
  henry10: {
    sub: 'Ten-site Henry footprint — Americas, EU, and Asia-Pacific production snapshot.',
    clientBrand: {
      mode: 'tenant-lockup',
      logoSrc: henryLogo,
      logoAlt: 'HENRY',
    },
    dashboardTemplate: {
      name: 'Dashboard #10',
      sub: 'Ten-location workspace',
    },
    footprintSub:
      'Atlanta · Miami · Denver · Santiago · Taipei · Cape Town · Mexico City · Warsaw · Brisbane · Montréal — directors, shift health, headcount, and efficiency by hub.',
    locationsLeadSub:
      'Ten hubs across regions — choose a location to open the building-level map.',
  },
}

/**
 * Stored API `dashboardPreset` wins when valid; else legacy inference (slug, demo emails, Harland).
 * @returns {'' | 'henry1' | 'henry3' | 'henry10' | 'harland'}
 */
export function resolveDashboardPresetKey(user) {
  if (!user || typeof user !== 'object') return ''
  const raw = typeof user.dashboardPreset === 'string' ? user.dashboardPreset.trim().toLowerCase() : ''
  if (raw && VALID_PRESET_KEYS.has(raw)) return raw
  const norm = String(user.email || '').trim().toLowerCase()
  const slugKey = String(user.slug || '').trim().toLowerCase()
  if (norm === PRESET_DEMO_EMAILS.henry1 || slugKey === 'henry1') return 'henry1'
  if (norm === PRESET_DEMO_EMAILS.henry3 || slugKey === 'henry3') return 'henry3'
  if (norm === PRESET_DEMO_EMAILS.henry10 || slugKey === 'henry10') return 'henry10'
  if (/@harlandmedical\.com$/i.test(norm)) return 'harland'
  if (slugKey === 'harland') return 'harland'
  const company = user.company
  if (typeof company === 'string' && company.toLowerCase().includes('harland')) return 'harland'
  return ''
}

export function getDashboardContext(presetKey) {
  const key = typeof presetKey === 'string' ? presetKey.trim().toLowerCase() : ''
  const override = key && PRESET_OVERRIDES[key] ? PRESET_OVERRIDES[key] : null
  return override ? { ...WORKSPACE, ...override } : WORKSPACE
}
