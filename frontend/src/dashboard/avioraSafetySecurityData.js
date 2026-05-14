/**
 * Demo data for Aviora Safety & Security.
 * Security thumbnails live in `../assets/uploads/aviora-security-*.png`.
 */

import imgBlockedExit from '../assets/uploads/safety-blocked-exit.png'
import imgWalkway from '../assets/uploads/safety-clear-walkway.png'
import imgGateOpenNight from '../assets/uploads/aviora-security-gate-open-night.png'
import imgGate2Night from '../assets/uploads/aviora-security-gate2-night.png'
import imgPerimeterRazor from '../assets/uploads/aviora-security-perimeter-razor-wire.png'
import imgSiteVehicleNight from '../assets/uploads/aviora-security-site-vehicle-night.png'
import imgYardNight from '../assets/uploads/aviora-security-yard-night.png'

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
    id: 'gate-open',
    title: 'Vehicle gate held open',
    site: 'North truck lane · Gate A',
    when: '35 min ago',
    tone: 'warning',
    summary: 'Swing gates clear of lane per DO NOT BLOCK policy. Auto-timer reset; guard acknowledged.',
    imageSrc: imgGateOpenNight,
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
    id: 'gate-2-check',
    title: 'After-hours gate check',
    site: 'Gate 2 · Perimeter',
    when: '3 hr ago',
    tone: 'security',
    summary: 'Approach logged; badge reader and PTZ triage complete. No tailgate.',
    imageSrc: imgGate2Night,
  },
  {
    id: 'perimeter-line',
    title: 'Perimeter line scan',
    site: 'East fence · Zones E1–E3',
    when: '4 hr ago',
    tone: 'security',
    summary: 'Razor wire and motion grid nominal. Patrol path matched route plan.',
    imageSrc: imgPerimeterRazor,
  },
  {
    id: 'night-vehicle',
    title: 'Night yard — vehicle on roster',
    site: 'Laydown · Row 4',
    when: '4 hr ago',
    tone: 'positive',
    summary: 'Plate and fleet decal match issued work order. Camera pair correlation OK.',
    imageSrc: imgSiteVehicleNight,
  },
  {
    id: 'yard-sweep',
    title: 'Outdoor laydown sweep',
    site: 'Beam storage · Yard 2',
    when: '5 hr ago',
    tone: 'security',
    summary: 'Flood lighting within spec; stacks unchanged vs prior shift. Forklift idle, keys secured.',
    imageSrc: imgYardNight,
  },
]
