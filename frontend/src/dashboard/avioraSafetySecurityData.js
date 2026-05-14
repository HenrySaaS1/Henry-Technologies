/**
 * Demo content for Aviora Safety & Security hub.
 * KPIs, observations, and security events are shared demo data; property name, code,
 * site photo, and leads come from `avioraHubForProperty` when embedded on a property.
 * Safety observation photos: `aviora-safety-*.png` (stakeholder assets in repo).
 */

import { AVIORA_PROPERTY_DETAILS, isAvioraPropertyDetailId } from './avioraPropertyDetailData.js'
import siteGreenfield from '../assets/uploads/aviora-site-greenfield-heights.jpg'
import imgScaffold from '../assets/uploads/aviora-safety-scaffolding.png'
import imgWetConcrete from '../assets/uploads/aviora-safety-wet-concrete.png'
import imgPpeHotwork from '../assets/uploads/aviora-safety-hot-work.png'
import imgWalkway from '../assets/uploads/aviora-safety-walkway.png'
import imgBlockedExit from '../assets/uploads/aviora-safety-blocked-exit.png'

import imgGate2Night from '../assets/uploads/aviora-security-gate2-night.png'
import imgYardNight from '../assets/uploads/aviora-security-yard-night.png'
import imgPerimeterRazor from '../assets/uploads/aviora-security-perimeter-razor-wire.png'
import imgGateOpenNight from '../assets/uploads/aviora-security-gate-open-night.png'
import imgSiteVehicleNight from '../assets/uploads/aviora-security-site-vehicle-night.png'

export const AVIORA_HUB = {
  companyLine: 'AVIORA CONSTRUCTION INC',
  propertyName: 'Greenfield Heights',
  propertyCode: 'PR 102',
  locationLine: 'Greenfield Heights | PR 102',
  description: 'Mid-rise apartment community',
  sitePhoto: siteGreenfield,
  projectManager: { name: 'Ethan Brooks', role: 'Project Manager' },
  siteEngineer: { name: 'Sophia Reed', role: 'Site Engineer' },
}

/**
 * Same safety/security demo for every Aviora property; only header/sidebar identity changes.
 * @param {string | undefined} propertyId
 */
export function avioraHubForProperty(propertyId) {
  if (!propertyId || !isAvioraPropertyDetailId(propertyId)) return AVIORA_HUB
  const d = AVIORA_PROPERTY_DETAILS[propertyId]
  return {
    companyLine: AVIORA_HUB.companyLine,
    propertyName: d.name,
    propertyCode: d.code,
    locationLine: `${d.name} | ${d.code}`,
    description: d.description,
    sitePhoto: d.heroImage,
    projectManager: { name: d.projectManager.name, role: 'Project Manager' },
    siteEngineer: { name: d.siteEngineer.name, role: 'Site Engineer' },
  }
}

/** @type {{ id: string; label: string; value: string; icon: 'clipboard' | 'check' | 'alert' | 'warnOrange' | 'clock' }[]} */
export const AVIORA_SAFETY_SIDEBAR_STATS = [
  { id: 'obs', label: 'Total Observations', value: '19', icon: 'clipboard' },
  { id: 'safe', label: 'Safe Conditions', value: '14', icon: 'check' },
  { id: 'vio', label: 'Violations', value: '5', icon: 'alert' },
  { id: 'act', label: 'Actions Taken', value: '6', icon: 'warnOrange' },
  { id: 'open', label: 'Open Actions', value: '4', icon: 'clock' },
]

/** @type {{ id: string; label: string; value: string; tone: 'neutral' | 'bad' | 'warn' | 'low' | 'invest' }[]} */
export const AVIORA_SECURITY_SIDEBAR_STATS = [
  { id: 'ev', label: 'Total Events', value: '14', tone: 'neutral' },
  { id: 'hi', label: 'High Severity', value: '2', tone: 'bad' },
  { id: 'med', label: 'Medium Severity', value: '4', tone: 'warn' },
  { id: 'lo', label: 'Low Severity', value: '8', tone: 'low' },
  { id: 'inv', label: 'Open Investigations', value: '3', tone: 'invest' },
]

/**
 * @type {{ id: string; label: string; kind: 'ring' | 'stat' | 'fraction'; value: string; sub?: string; trend?: string; trendDir?: 'up' | 'down'; trendGood?: boolean; ringPct?: number; ringLabel?: string; num?: string; den?: string; foot?: string }[]}
 */
export const AVIORA_SAFETY_KPI_CARDS = [
  {
    id: 'score',
    label: 'Safety Score',
    kind: 'ring',
    ringPct: 86,
    ringLabel: 'Good',
    value: '86%',
  },
  {
    id: 'tot',
    label: 'Total Observations',
    kind: 'stat',
    value: '19',
    sub: 'Today',
    trend: '↑ 12% vs yesterday',
    trendDir: 'up',
    trendGood: true,
  },
  {
    id: 'vio',
    label: 'Violations',
    kind: 'stat',
    value: '5',
    sub: 'Today',
    trend: '↓ 17% vs yesterday',
    trendDir: 'down',
    trendGood: true,
  },
  {
    id: 'open',
    label: 'Open Actions',
    kind: 'stat',
    value: '4',
    sub: 'Requires Attention',
    trend: '↓ 20% vs yesterday',
    trendDir: 'down',
    trendGood: false,
  },
  {
    id: 'areas',
    label: 'Areas Inspected',
    kind: 'fraction',
    num: '9',
    den: '12',
    sub: 'Areas',
    foot: '75% of total areas',
  },
]

/**
 * @type {{ id: string; label: string; kind: 'ring' | 'stat' | 'fraction'; value?: string; sub?: string; trend?: string; trendDir?: 'up' | 'down'; trendGood?: boolean; ringPct?: number; ringLabel?: string; num?: string; den?: string; foot?: string; icon?: 'cam' | 'shield' | 'calendar' | 'search' }[]}
 */
export const AVIORA_SECURITY_KPI_CARDS = [
  {
    id: 'score',
    label: 'Security Score',
    kind: 'ring',
    ringPct: 91,
    ringLabel: 'Excellent',
    value: '91%',
  },
  {
    id: 'ev',
    label: 'Total Events',
    kind: 'stat',
    value: '14',
    sub: 'Today',
    trend: '↓ 7% vs yesterday',
    trendDir: 'down',
    trendGood: true,
    icon: 'calendar',
  },
  {
    id: 'hi',
    label: 'High Severity',
    kind: 'stat',
    value: '2',
    sub: 'Today',
    trend: '↑ 100% vs yesterday',
    trendDir: 'up',
    trendGood: false,
    icon: 'shield',
  },
  {
    id: 'inv',
    label: 'Open Investigations',
    kind: 'stat',
    value: '3',
    sub: 'Requires Attention',
    trend: '↓ 25% vs yesterday',
    trendDir: 'down',
    trendGood: true,
    icon: 'search',
  },
  {
    id: 'cam',
    label: 'Cameras Online',
    kind: 'fraction',
    num: '42',
    den: '44',
    sub: 'Cameras',
    foot: '95% Online',
    icon: 'cam',
  },
]

/**
 * @typedef {'high' | 'medium' | 'safe'} RiskLevel
 * @typedef {'open' | 'in_progress' | 'safe'} ObsStatus
 */

/**
 * @type {{ id: string; title: string; location: string; description: string; timeLabel: string; risk: RiskLevel; status: ObsStatus; statusLabel: string; topBadge: 'Violation' | 'Safe'; imageSrc: string }[]}
 */
export const AVIORA_SAFETY_OBSERVATIONS = [
  {
    id: 'scaffold',
    title: 'Unsecured Scaffolding',
    location: 'Tower B',
    description: 'Loose edge protection on working platform.',
    timeLabel: 'Today',
    risk: 'high',
    status: 'open',
    statusLabel: 'Open',
    topBadge: 'Violation',
    imageSrc: imgScaffold,
  },
  {
    id: 'spill',
    title: 'Wet Concrete Spill',
    location: 'Podium Deck',
    description: 'Spill not cleaned, slip hazard.',
    timeLabel: 'Today',
    risk: 'medium',
    status: 'open',
    statusLabel: 'Open',
    topBadge: 'Violation',
    imageSrc: imgWetConcrete,
  },
  {
    id: 'ppe',
    title: 'Missing PPE at Cutting Zone',
    location: 'Fabrication Area',
    description: 'Worker observed without eye protection.',
    timeLabel: 'Today',
    risk: 'medium',
    status: 'in_progress',
    statusLabel: 'In Progress',
    topBadge: 'Violation',
    imageSrc: imgPpeHotwork,
  },
  {
    id: 'walk',
    title: 'Clear Access Route',
    location: 'Main Corridor',
    description: 'Walkway clear and marked.',
    timeLabel: 'Today',
    risk: 'safe',
    status: 'safe',
    statusLabel: 'Safe',
    topBadge: 'Safe',
    imageSrc: imgWalkway,
  },
  {
    id: 'exit',
    title: 'Material Blocking Exit',
    location: 'Service Access',
    description: 'Stacked materials obstructing emergency exit.',
    timeLabel: 'Today',
    risk: 'high',
    status: 'open',
    statusLabel: 'Open',
    topBadge: 'Violation',
    imageSrc: imgBlockedExit,
  },
]

/**
 * @typedef {'high' | 'medium' | 'low'} SevLevel
 */

/**
 * @type {{ id: string; title: string; location: string; timeClock: string; detail: string; severity: SevLevel; severityLabel: string; statusLabel: string; statusTone: 'bad' | 'warn' | 'ok'; imageSrc: string }[]}
 */
export const AVIORA_SECURITY_EVENTS = [
  {
    id: 'unauth',
    title: 'Unauthorized Entry',
    location: 'Gate 2',
    timeClock: '5:42 AM',
    detail: 'Access denied for unregistered visitor.',
    severity: 'high',
    severityLabel: 'High',
    statusLabel: 'Investigating',
    statusTone: 'bad',
    imageSrc: imgGate2Night,
  },
  {
    id: 'after',
    title: 'After Hours Movement',
    location: 'Storage Yard',
    timeClock: '2:18 AM',
    detail: 'Motion detected in restricted area.',
    severity: 'medium',
    severityLabel: 'Medium',
    statusLabel: 'Under Review',
    statusTone: 'warn',
    imageSrc: imgYardNight,
  },
  {
    id: 'motion',
    title: 'Perimeter Motion',
    location: 'North Fence',
    timeClock: '1:06 AM',
    detail: 'Movement detected along boundary.',
    severity: 'low',
    severityLabel: 'Low',
    statusLabel: 'Closed',
    statusTone: 'ok',
    imageSrc: imgPerimeterRazor,
  },
  {
    id: 'open-gate',
    title: 'Gate Left Open',
    location: 'Delivery Entrance',
    timeClock: '12:44 AM',
    detail: 'Service gate open longer than permitted.',
    severity: 'low',
    severityLabel: 'Low',
    statusLabel: 'Closed',
    statusTone: 'ok',
    imageSrc: imgGateOpenNight,
  },
  {
    id: 'vehicle',
    title: 'Vehicle in Restricted Zone',
    location: 'Equipment Bay',
    timeClock: '11:58 PM',
    detail: 'Unregistered vehicle in equipment area.',
    severity: 'medium',
    severityLabel: 'Medium',
    statusLabel: 'Under Review',
    statusTone: 'warn',
    imageSrc: imgSiteVehicleNight,
  },
]

/** @type {{ id: string; label: string; value: string; sub?: string; icon: string }[]} */
export const AVIORA_SECURITY_FOOT_METRICS = [
  { id: 'cams', label: 'Active Cameras', value: '44', icon: 'cam' },
  { id: 'staff', label: 'Security Personnel', value: '18', sub: 'On Site', icon: 'people' },
  { id: 'patrol', label: 'Patrols Completed (Today)', value: '12', sub: '100%', icon: 'board' },
  { id: 'resp', label: 'Avg Response Time', value: '3m 42s', icon: 'timer' },
  { id: 'inc', label: 'Open Incidents', value: '3', sub: 'Requires Attention', icon: 'warn' },
]
