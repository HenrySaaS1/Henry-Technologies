/** Demo portfolio for Aviora Construction — aligned to stakeholder reference deck. */

/**
 * Remote placeholder portrait for Skyline lead (Olivia Carter) — demo only; not production PII.
 * Pravatar seed keeps the same face across sessions.
 */
export const AVIORA_OLIVIA_LEAD_IMAGE_URL =
  'https://i.pravatar.cc/400?u=aviora-construction-skyline-lead'

export const AVIORA_CONSTRUCTION_PROJECTS = [
  {
    id: 'skyline',
    statusKey: 'operational',
    name: 'Skyline Residences',
    location: 'Austin, TX',
    /** IANA zone for on-card “site local time” (demo). */
    siteTimeZone: 'America/Chicago',
    lead: 'Olivia Carter',
    dayProgress: { current: 72, total: 120, cyclePct: 40 },
    crewWorkers: 68,
    weatherDelayHrs: 4.5,
    completion: { pct: 72, label: 'On Track', arrow: 'check' },
    pillars: {
      safetyPct: 90,
      securityLevel: 'High',
      systemsPct: 88,
    },
    footer: {
      tone: 'good',
      text: 'Project is on schedule and performing well.',
    },
  },
  {
    id: 'greenfield',
    statusKey: 'monitoring',
    name: 'Greenfield Heights',
    location: 'Phoenix, AZ',
    siteTimeZone: 'America/Phoenix',
    lead: 'Ethan Brooks',
    dayProgress: { current: 48, total: 120, cyclePct: 40 },
    crewWorkers: 54,
    weatherDelayHrs: 12.0,
    completion: { pct: 48, label: 'Behind', arrow: 'down' },
    pillars: {
      safetyPct: 85,
      securityLevel: 'Medium',
      systemsPct: 76,
    },
    footer: {
      tone: 'warn',
      text: 'Behind schedule. Increased monitoring in progress.',
    },
  },
  {
    id: 'riverstone',
    statusKey: 'risk',
    name: 'Riverstone Villas',
    location: 'Orlando, FL',
    siteTimeZone: 'America/New_York',
    lead: 'Maya Singh',
    dayProgress: { current: 36, total: 120, cyclePct: 30 },
    crewWorkers: 41,
    weatherDelayHrs: 18.5,
    completion: { pct: 30, label: 'At Risk', arrow: 'down' },
    pillars: {
      safetyPct: 82,
      securityLevel: 'Medium',
      systemsPct: 64,
    },
    footer: {
      tone: 'bad',
      text: 'Significant delays and risks require immediate attention.',
    },
  },
]

export const AVIORA_PORTFOLIO_FOOTER = {
  activeProperties: 3,
  totalWorkforce: 163,
  portfolioCompletionAvg: 50,
  scheduleAdherenceAvg: 78,
  qualityScoreAvg: 85,
  openIssuesTotal: 22,
}
