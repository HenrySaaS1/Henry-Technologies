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
    lead: 'Olivia Carter',
    dayProgress: { current: 72, total: 120, cyclePct: 40 },
    crewWorkers: 68,
    weatherDelayHrs: 4.5,
    completion: { pct: 72, label: 'On Track', arrow: 'check' },
    schedule: { pct: 96, status: 'On Track' },
    quality: { pct: 92, status: 'Excellent' },
    safety: { pct: 90, status: 'Good' },
    issues: { count: 3, level: 'Low' },
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
    lead: 'Ethan Brooks',
    dayProgress: { current: 48, total: 120, cyclePct: 40 },
    crewWorkers: 54,
    weatherDelayHrs: 12.0,
    completion: { pct: 48, label: 'Behind', arrow: 'down' },
    schedule: { pct: 79, status: 'Behind' },
    quality: { pct: 88, status: 'Good' },
    safety: { pct: 85, status: 'Good' },
    issues: { count: 7, level: 'Medium' },
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
    lead: 'Maya Singh',
    dayProgress: { current: 36, total: 120, cyclePct: 30 },
    crewWorkers: 41,
    weatherDelayHrs: 18.5,
    completion: { pct: 30, label: 'At Risk', arrow: 'down' },
    schedule: { pct: 58, status: 'At Risk' },
    quality: { pct: 82, status: 'Fair' },
    safety: { pct: 88, status: 'Good' },
    issues: { count: 12, level: 'High' },
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
