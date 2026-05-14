/**
 * Demo data for Aviora Safety & Security — aligns to stakeholder reference imagery.
 * Swap imports below for files in `../assets/uploads/` (e.g. `aviora-safety-exit.png`).
 */

import imgBlockedExit from '../assets/uploads/safety-blocked-exit.png'
import imgHotWork from '../assets/uploads/harland-528-coater.png'
import imgWalkway from '../assets/uploads/safety-clear-walkway.png'
import imgGate from '../assets/uploads/security-unauthorized.png'
import imgScaffold from '../assets/uploads/security-perimeter.png'
import imgWetSlab from '../assets/uploads/safety-floor-spill.png'

/** @typedef {'critical' | 'warning' | 'positive' | 'security' | 'structural' | 'weather'} SafetyTone */

/** @type {{ id: string; label: string; value: string; hint: string; tone: 'ok' | 'warn' | 'bad' }[]} */
export const AVIORA_SAFETY_KPIS = [
  { id: 'index', label: 'Site safety index', value: '86', hint: 'Rolling 7-day composite', tone: 'ok' },
  { id: 'open', label: 'Open findings', value: '12', hint: '3 critical · 5 high', tone: 'warn' },
  { id: 'patrol', label: 'Patrol coverage', value: '94%', hint: 'vs route plan', tone: 'ok' },
  { id: 'gates', label: 'Gate compliance', value: '100%', hint: 'Auth logs last 24h', tone: 'ok' },
]

/**
 * @type {{ id: string; title: string; site: string; when: string; tone: SafetyTone; summary: string; imageSrc: string | null }[]}
 */
export const AVIORA_SAFETY_FEED = [
  {
    id: 'exit-block',
    title: 'Blocked emergency egress',
    site: 'Warehouse B · Exit 4',
    when: '22 min ago',
    tone: 'critical',
    summary: 'Materials stacked inside minimum clearance zone. Supervisor notified.',
    imageSrc: imgBlockedExit,
  },
  {
    id: 'hot-work',
    title: 'Hot work — PPE verified',
    site: 'Fab shop · Bay 2',
    when: '1 hr ago',
    tone: 'positive',
    summary: 'Hard hat, face shield, and FR vest confirmed before cut. Permit active.',
    imageSrc: imgHotWork,
  },
  {
    id: 'walkway',
    title: 'Pedestrian lane audit',
    site: 'Plant 1 · Corridor C',
    when: '2 hr ago',
    tone: 'positive',
    summary: 'Green path and yellow guardrails within spec. No obstructions.',
    imageSrc: imgWalkway,
  },
  {
    id: 'gate',
    title: 'After-hours gate check',
    site: 'Gate 2 · Perimeter',
    when: '3 hr ago',
    tone: 'security',
    summary: 'Unauthorized approach cleared. Badge reader and camera triage complete.',
    imageSrc: imgGate,
  },
  {
    id: 'scaffold',
    title: 'Scaffold inspection',
    site: 'Tower 3 · East face',
    when: '5 hr ago',
    tone: 'structural',
    summary: 'Tie-ins and toe boards logged. Minor rust noted — PM scheduled.',
    imageSrc: imgScaffold,
  },
  {
    id: 'weather',
    title: 'Slip risk — wet slab',
    site: 'Podium pour · Zone D',
    when: '6 hr ago',
    tone: 'weather',
    summary: 'Standing water after rain. Barriers extended; crews briefed at shift.',
    imageSrc: imgWetSlab,
  },
]
