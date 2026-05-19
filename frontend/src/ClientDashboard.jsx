import { useCallback, useState, useEffect, useId, useRef, useMemo } from 'react'
import { matchPath, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { titlesForProductIds } from './productCatalog.js'
import henryLogo from './assets/henry-logo.png'
import { LogoSpreadLine } from './LogoSpreadLine.jsx'
import { getDashboardContext, resolveDashboardPresetKey } from './dashboard/registry.js'
import AvioraConstructionPortfolio from './dashboard/AvioraConstructionPortfolio.jsx'
import AvioraPropertyDetailPage from './dashboard/AvioraPropertyDetailPage.jsx'
import AvioraSafetySecurityDashboard from './dashboard/AvioraSafetySecurityDashboard.jsx'
import FactoryPulseChartsPanel from './FactoryPulseChartsPanel.jsx'
import { isAvioraPropertyDetailId } from './dashboard/avioraPropertyDetailData.js'
import { AVIORA_OLIVIA_LEAD_IMAGE_URL } from './dashboard/avioraPortfolioData.js'
import { formatSiteLocalTime } from './dashboard/siteLocalTime.js'
import snapshotWordmarkWhite from './assets/snapshot-wordmark-white.png'
import harlandMedicalSystemsLogo from './assets/clients/harland-medical-systems-logo.png'
import harland528Coater from './assets/uploads/harland-528-coater.png'
import harlandTts1000 from './assets/uploads/harland-tts1000.png'
import harlandCustomRig from './assets/uploads/harland-custom-rig.png'
import harlandRdx195 from './assets/uploads/harland-rdx-195.png'
import harlandFts7000 from './assets/uploads/harland-fts7000.png'
import harlandCts1100 from './assets/uploads/harland-cts1100.png'
// Safety observation thumbnails (user-supplied mock images).
// Save these five PNGs into frontend/src/assets/uploads with the exact filenames.
import safetyTripHazard from './assets/uploads/safety-trip-hazard.png'
import safetyFloorSpill from './assets/uploads/safety-floor-spill.png'
import safetyGuardMissing from './assets/uploads/safety-guard-missing.png'
import safetyClearWalkway from './assets/uploads/safety-clear-walkway.png'
import safetyBlockedExit from './assets/uploads/safety-blocked-exit.png'
// Security CCTV-style thumbnails (user-supplied mock images).
// Save the five PNGs into frontend/src/assets/uploads with these exact filenames.
import secUnauthorized from './assets/uploads/security-unauthorized.png'
import secAfterHours from './assets/uploads/security-after-hours.png'
import secPerimeter from './assets/uploads/security-perimeter.png'
import secDoorHeld from './assets/uploads/security-door-held.png'
import secVehicle from './assets/uploads/security-vehicle.png'
import leadMarkStockhowe from './assets/uploads/lead-mark-stockhowe.png'
import leadKevinConlon from './assets/uploads/lead-kevin-conlon.png'
import leadMiguelZaballa from './assets/uploads/lead-miguel-zaballa.png'
import avioraLeadEthan from './assets/uploads/aviora-lead-ethan-brooks.jpg'
import avioraLeadMaya from './assets/uploads/aviora-lead-maya-singh.jpg'
import leadItamarHaran from './assets/uploads/lead-itamar-haran.png'
import leadDeepakTeja from './assets/uploads/lead-deepak-teja.png'
/** Demo equipment visuals per Harland BU job tile (job id like `125-2`). */
const JOB_MACHINE_IMAGES = {
  '120-1': harlandRdx195,
  '120-2': harlandRdx195,
  '120-3': harlandRdx195,
  '120-4': harlandFts7000,
  '120-5': harlandFts7000,
  '120-6': harlandCts1100,
  '125-1': harland528Coater,
  '125-2': harland528Coater,
  '125-3': harland528Coater,
  '125-4': harlandTts1000,
  '125-5': harlandTts1000,
  '125-6': harlandCustomRig,
  '140-1': harlandCts1100,
  '140-2': harlandCts1100,
  '140-3': harlandFts7000,
  '140-4': harlandFts7000,
  '140-5': harlandTts1000,
  '140-6': harlandTts1000,
  '150-1': harland528Coater,
  '150-2': harland528Coater,
  '150-3': harlandCustomRig,
  '150-4': harlandCustomRig,
  '150-5': harlandRdx195,
  '150-6': harlandRdx195,
  '180-1': harland528Coater,
  '180-2': harland528Coater,
  '180-3': harlandRdx195,
  '180-4': harlandRdx195,
  '180-5': harlandFts7000,
  '180-6': harlandFts7000,
  '190-1': harlandTts1000,
  '190-2': harlandTts1000,
  '190-3': harlandCustomRig,
  '190-4': harlandCts1100,
  '190-5': harlandCts1100,
  '190-6': harlandRdx195,
  '220-1': harlandCts1100,
  '220-2': harlandCts1100,
  '220-3': harlandFts7000,
  '220-4': harlandTts1000,
  '220-5': harlandTts1000,
  '220-6': harlandCustomRig,
}

const DASH_KPIS = [
  { label: 'OEE', value: '94.2%', hint: 'vs target 90%', trend: '+1.2%', up: true },
  { label: 'Throughput', value: '512', hint: 'units / hr', trend: '+3.8%', up: true },
  { label: 'Uptime', value: '99.4%', hint: 'rolling 7d', trend: 'flat', up: null },
  { label: 'Open alerts', value: '3', hint: 'need attention', trend: '-1 vs yesterday', up: null },
]

const ACTIVITY_FEED = [
  { when: '2 min ago', text: 'Shift B acknowledged Line 07 vibration alert' },
  { when: '18 min ago', text: 'Auto-report exported — Yesterday 2nd shift PDF' },
  { when: '1 hr ago', text: 'Recipe change logged on Press Cell 2 (approved)' },
]

const QUICK_ACTIONS = [
  { id: 'export', label: 'Export snapshot', detail: 'PDF + CSV bundle' },
  { id: 'digest', label: 'Schedule digest', detail: 'Email to distribution list' },
  { id: 'runbook', label: 'Open runbook', detail: 'Escalation & on-call' },
]

const PRODUCTION_LINES = [
  {
    id: 'L01',
    name: 'Assembly East 01',
    status: 'running',
    oee: '92.1%',
    target: '90%',
    sku: 'SKU-4412-B',
    note: 'Ahead of takt · 12 operators',
  },
  {
    id: 'L02',
    name: 'Press Cell 2',
    status: 'idle',
    oee: '—',
    target: '88%',
    sku: 'Die changeover',
    note: 'Tooling swap approved · est. 18 min',
  },
  {
    id: 'L03',
    name: 'Packaging Line C',
    status: 'running',
    oee: '88.4%',
    target: '90%',
    sku: 'SKU-9081',
    note: 'New hire shadowing · coach on station 4',
  },
  {
    id: 'L04',
    name: 'Robot weld R-12',
    status: 'alert',
    oee: '81.0%',
    target: '85%',
    sku: 'Lot W-221',
    note: 'Cycle drift +8% · torque review queued',
  },
  {
    id: 'L05',
    name: 'Chiller loop B',
    status: 'running',
    oee: '—',
    target: '—',
    sku: 'Utilities',
    note: 'Supply temp +1.2°C · facilities ticket #8842',
  },
  {
    id: 'L06',
    name: 'Clean room fill',
    status: 'down',
    oee: '0%',
    target: '92%',
    sku: 'Sterile batch S-12',
    note: 'Unplanned stop · QA hold pending release',
  },
]

const TODAY_PRIORITIES = [
  { id: 'p1', done: false, label: 'Close out Line 07 vibration root cause (maintenance + QA)', due: 'Today 15:00' },
  { id: 'p2', done: false, label: 'Sign off Press Cell 2 die change checklist before restart', due: 'Today 16:30' },
  { id: 'p3', done: true, label: 'Post morning stand-up notes to shift digest', due: 'Done' },
  { id: 'p4', done: false, label: 'Review Cell C ship-risk forecast with planner', due: 'Tomorrow 09:00' },
]

const SHIFT_SEGMENTS = [
  { label: 'Shift A', pct: 35, tone: 'a' },
  { label: 'Shift B', pct: 40, tone: 'b' },
  { label: 'Shift C', pct: 25, tone: 'c' },
]

const NOTIFICATION_ITEMS = [
  { id: 'n1', title: 'High · Line 07 spindle vibration', detail: 'Unacknowledged · escalates in 8 min', when: '12 min ago' },
  { id: 'n2', title: 'Export ready · 2nd shift PDF', detail: 'Yesterday wrap-up report', when: '18 min ago' },
  { id: 'n3', title: 'Integration · Historian sync lag', detail: 'OPC node 3 · 90s behind real-time', when: '1 hr ago' },
]

const REPORT_RANGE_PRESETS = [
  { id: 'shift', label: 'This shift' },
  { id: '24h', label: 'Last 24h' },
  { id: '7d', label: 'Last 7 days' },
  { id: 'mtd', label: 'Month to date' },
]

/** Demo floor asset — same PNG used as placeholder map for all sites until you upload per-site plans. */
const DEFAULT_FLOOR_PLAN_SRC = `${import.meta.env.BASE_URL}site-floor-plan-us.png`
const HARLAND_US_FLOOR_PLAN_SRC = `${import.meta.env.BASE_URL}site-floor-plan-us-v4.png`

const BUILDING_FOOTER_TABS = [
  { id: 'safety', label: 'Safety' },
  { id: 'security', label: 'Security' },
  { id: 'settings', label: 'Settings' },
]

const FACTORY_PULSE_REPORT_URL =
  typeof import.meta.env.VITE_POWERBI_FACTORY_PULSE_URL === 'string' &&
  import.meta.env.VITE_POWERBI_FACTORY_PULSE_URL.trim()
    ? import.meta.env.VITE_POWERBI_FACTORY_PULSE_URL.trim()
    : 'https://app.powerbi.com/groups/e404cc31-4af3-4c05-9633-5e21eb2f9afc/reports/c8bb3fe2-c9d5-440d-a803-048a3682ea8f/bdab7bb7e177ab11e652?experience=power-bi'

/** Inline chart panel + “Open in Power BI” for every US HQ business unit with a full unit panel. */
const FACTORY_PULSE_UNIT_LINK = {
  title: 'Factory Pulse',
  reportUrl: FACTORY_PULSE_REPORT_URL,
}

/** Short clock for footprint cards (24-hour, site time zone). */
function formatSiteShortTime(date, timeZone) {
  const opts = { hour: '2-digit', minute: '2-digit', hour12: false }
  if (!timeZone) return date.toLocaleTimeString(undefined, opts)
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      ...opts,
    }).format(date)
  } catch {
    return date.toLocaleTimeString(undefined, opts)
  }
}

function leadInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function siteOperationalLabel(light) {
  if (light === 'green') return 'OPERATIONAL'
  if (light === 'amber') return 'MONITORING'
  if (light === 'red') return 'INACTIVE'
  return 'OFFLINE'
}

function SiteFootprintPeopleIcon() {
  return (
    <svg className="client-site-fp-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  )
}

function SiteFootprintClockIcon() {
  return (
    <svg className="client-site-fp-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v7l4.25 2.55.75-1.23-3-1.82z"
      />
    </svg>
  )
}

function SiteFootprintPulseIcon() {
  return (
    <svg className="client-site-fp-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M3 12h4l2-6 4 12 2-6h6v-2h-5l-2 6-4-12-2 6H3z"
      />
    </svg>
  )
}

function SiteFootprintNoAssetsIcon() {
  return (
    <svg className="client-site-fp-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31A7.95 7.95 0 0 1 12 20zm6.31-3.1L7.1 5.69A7.95 7.95 0 0 1 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"
      />
    </svg>
  )
}

/** Demo global sites — replace with API data for your tenant. */
const GLOBAL_SITES = [
  {
    id: 'us',
    country: 'United States',
    flagCode: 'US',
    flagEmoji: '🇺🇸',
    leadRole: 'Site Director',
    leadName: 'Mark Stockhowe',
    leadPhoto: leadMarkStockhowe,
    timeZone: 'America/Chicago',
    employees: 118,
    efficiency: 89,
    address: '7418 Washington Ave. South, Eden Prairie, MN 55344',
    phoneDisplay: '+1-952-941-0475',
    phoneTel: '+19529410475',
    building: {
      name: 'Harland United States',
      // Client-approved US building visual
      floorPlanSrc: HARLAND_US_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Last floor walkthrough 06:00 local · 0 open near-miss actions for this building.',
        security: 'Perimeter logged · 22 badged entries in the last 4 hours.',
        settings: 'Map layers and zone labels are demo data — swap in your CAD or BIM exports.',
      },
      zones: [
        {
          id: 'us-bu-125',
          label: '125',
          pct: { left: 15, top: 21, width: 7.8, height: 19 },
          machinery: {
            title: 'BU 125',
            status: 'running',
            unitPanel: {
              unit: 'BU125',
              description: 'Machines Commercialization',
              manager: 'Alex Anderson',
              assistant: 'Nikolai Zorichev',
              activeMachines: '9/10',
              activeOperators: '14',
              updatedAt: 'Timestamp',
              todaysOutput: '1,180 units',
              targetVsActual: '1,440 vs 1,180',
              cycleTime: '42 sec',
              throughput: '106 units/hr',
              focus: { x: 26, y: 45 },
              powerBiEmbed: FACTORY_PULSE_UNIT_LINK,
            },
            lines: [
              { k: 'Line status', v: 'Running' },
              { k: 'Operational efficiency', v: '91%' },
              { k: 'Assigned team', v: 'Day shift — Team A' },
            ],
            foot: 'BU 125 monitoring view — Henry US production campus.',
          },
        },
        {
          id: 'us-bu-120',
          label: '120',
          pct: { left: 23.2, top: 21, width: 7.2, height: 19 },
          machinery: {
            title: 'BU 120',
            status: 'running',
            unitPanel: {
              unit: 'BU120',
              description: 'Machines Commercialization',
              manager: 'Kevin Langeberg',
              assistant: 'Mikhail Shimko',
              activeMachines: '7/10',
              activeOperators: '11',
              updatedAt: 'Timestamp',
              todaysOutput: '985 units',
              targetVsActual: '1,200 vs 985',
              cycleTime: '48 sec',
              throughput: '92 units/hr',
              focus: { x: 34, y: 45 },
              powerBiEmbed: FACTORY_PULSE_UNIT_LINK,
            },
            lines: [
              { k: 'Line status', v: 'Running' },
              { k: 'Operational efficiency', v: '86%' },
              { k: 'Assigned team', v: 'Swing shift — Team B' },
            ],
            foot: 'BU 120 monitoring view — Henry US production campus.',
          },
        },
        {
          id: 'us-wh',
          label: 'WH',
          pct: { left: 30.8, top: 21, width: 12.6, height: 19 },
          machinery: {
            title: 'Warehouse (WH)',
            status: 'running',
            lines: [
              { k: 'Inbound today', v: '14 trucks · 92 pallets' },
              { k: 'Outbound today', v: '11 trucks · 68 pallets' },
              { k: 'Capacity utilization', v: '78%' },
              { k: 'Inventory accuracy', v: '99.2%' },
              { k: 'Assigned team', v: 'Logistics — Team L' },
            ],
            foot: 'Warehouse hub — receiving, putaway, kitting and ship-out for the US campus.',
          },
        },
        {
          id: 'us-bu-190',
          label: '190',
          pct: { left: 43.8, top: 21, width: 7.4, height: 19 },
          machinery: {
            title: 'BU 190',
            status: 'running',
            unitPanel: {
              unit: 'BU190',
              description: 'Sub-Assembly & Kitting',
              manager: 'Lina Park',
              assistant: 'Tomás Ribeiro',
              activeMachines: '8/9',
              activeOperators: '13',
              updatedAt: 'Timestamp',
              todaysOutput: '1,040 units',
              targetVsActual: '1,300 vs 1,040',
              cycleTime: '46 sec',
              throughput: '98 units/hr',
              focus: { x: 54, y: 45 },
              powerBiEmbed: FACTORY_PULSE_UNIT_LINK,
            },
            lines: [
              { k: 'Line status', v: 'Running' },
              { k: 'Operational efficiency', v: '88%' },
              { k: 'Assigned team', v: 'Day shift — Team D' },
            ],
            foot: 'BU 190 monitoring view — sub-assembly cells.',
          },
        },
        {
          id: 'us-bu-180',
          label: '180',
          pct: { left: 62, top: 21, width: 7.2, height: 19 },
          machinery: {
            title: 'BU 180',
            status: 'running',
            unitPanel: {
              unit: 'BU180',
              description: 'Coating & Curing',
              manager: 'Marcus Reilly',
              assistant: 'Sofía Navarro',
              activeMachines: '6/8',
              activeOperators: '12',
              updatedAt: 'Timestamp',
              todaysOutput: '880 units',
              targetVsActual: '1,050 vs 880',
              cycleTime: '53 sec',
              throughput: '82 units/hr',
              focus: { x: 62, y: 45 },
              powerBiEmbed: FACTORY_PULSE_UNIT_LINK,
            },
            lines: [
              { k: 'Line status', v: 'Running' },
              { k: 'Operational efficiency', v: '83%' },
              { k: 'Assigned team', v: 'Day shift — Team E' },
            ],
            foot: 'BU 180 monitoring view — coating and curing cells.',
          },
        },
        {
          id: 'us-bu-140',
          label: '140',
          pct: { left: 73, top: 21, width: 6.8, height: 19 },
          machinery: {
            title: 'BU 140',
            status: 'alert',
            unitPanel: {
              unit: 'BU140',
              description: 'Production',
              manager: 'Ravi Deshpande',
              assistant: 'Tessa Brooks',
              activeMachines: '6/10',
              activeOperators: '10',
              updatedAt: 'Timestamp',
              todaysOutput: '902 units',
              targetVsActual: '1,100 vs 902',
              cycleTime: '51 sec',
              throughput: '84 units/hr',
              focus: { x: 69, y: 45 },
              powerBiEmbed: FACTORY_PULSE_UNIT_LINK,
            },
            lines: [
              { k: 'Line status', v: 'Attention required' },
              { k: 'Operational efficiency', v: '79%' },
              { k: 'Assigned team', v: 'Night shift — Team C' },
            ],
            foot: 'BU 140 monitoring view — Henry US production campus.',
          },
        },
        {
          id: 'us-bu-150',
          label: '150',
          pct: { left: 80.4, top: 21, width: 7, height: 19 },
          machinery: {
            title: 'BU 150',
            status: 'running',
            unitPanel: {
              unit: 'BU150',
              description: 'Final Assembly',
              manager: 'Diego Alvarez',
              assistant: 'Hannah Cole',
              activeMachines: '7/8',
              activeOperators: '13',
              updatedAt: 'Timestamp',
              todaysOutput: '1,005 units',
              targetVsActual: '1,150 vs 1,005',
              cycleTime: '44 sec',
              throughput: '101 units/hr',
              focus: { x: 77, y: 45 },
              powerBiEmbed: FACTORY_PULSE_UNIT_LINK,
            },
            lines: [
              { k: 'Line status', v: 'Running' },
              { k: 'Operational efficiency', v: '89%' },
              { k: 'Assigned team', v: 'Swing shift — Team F' },
            ],
            foot: 'BU 150 monitoring view — final assembly cells.',
          },
        },
        {
          id: 'us-bu-220',
          label: '220',
          pct: { left: 88, top: 21, width: 8.5, height: 19 },
          machinery: {
            title: 'BU 220',
            status: 'running',
            unitPanel: {
              unit: 'BU220',
              description: 'Quality Lab & Test',
              manager: 'Priya Mehta',
              assistant: 'Marcus Reilly',
              activeMachines: '5/6',
              activeOperators: '8',
              updatedAt: 'Timestamp',
              todaysOutput: '612 lots tested',
              targetVsActual: '720 vs 612',
              cycleTime: '38 sec',
              throughput: '94 lots/hr',
              focus: { x: 85, y: 45 },
              powerBiEmbed: FACTORY_PULSE_UNIT_LINK,
            },
            lines: [
              { k: 'Line status', v: 'Running' },
              { k: 'First-pass yield', v: '96.4%' },
              { k: 'Assigned team', v: 'Day shift — Team Q' },
            ],
            foot: 'BU 220 monitoring view — quality lab and test cells.',
          },
        },
      ],
    },
  },
  {
    id: 'ie',
    country: 'Ireland',
    flagCode: 'IE',
    flagEmoji: '🇮🇪',
    leadRole: 'Site Lead',
    leadName: 'Kevin Conlon',
    leadPhoto: leadMiguelZaballa,
    timeZone: 'Europe/Dublin',
    employees: 64,
    efficiency: 87,
    address: 'Ringmahon Industrial Estate, Block C, Cork, Ireland T23 V6F2',
    phoneDisplay: '+353 (0) 21 555 0173',
    phoneTel: '+353215550173',
    building: {
      name: 'Harland Ireland',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Chemical store inspection due tomorrow · eyewash tested today.',
        security: 'Visitor escort policy active · 5 contractors on floor.',
        settings: 'EU data residency profile (demo) — align retention with DPA.',
      },
      zones: [
        {
          id: 'ie-fill',
          label: 'Sterile fill suite',
          pct: { left: 48, top: 24, width: 22, height: 30 },
          machinery: {
            title: 'Sterile fill suite — Lines F1–F2',
            status: 'running',
            lines: [
              { k: 'Batch', v: 'S-18 (release pending)' },
              { k: 'Room pressure', v: '+14 Pa vs corridor' },
              { k: 'Particle count', v: 'Class ISO 7 · OK' },
            ],
            foot: 'Environmental logs roll to batch record automatically in production.',
          },
        },
        {
          id: 'ie-pack',
          label: 'Packaging lane C',
          pct: { left: 70, top: 44, width: 20, height: 22 },
          machinery: {
            title: 'Packaging lane C',
            status: 'running',
            lines: [
              { k: 'Throughput', v: '438 units / hr' },
              { k: 'Label verifier', v: '99.6% read rate (shift)' },
            ],
            foot: 'HENRY is flagging a 3% takt drift vs yesterday on lane C during handover.',
          },
        },
      ],
    },
  },
  {
    id: 'cr',
    country: 'Costa Rica',
    flagCode: 'CR',
    flagEmoji: '🇨🇷',
    leadRole: 'Site Lead',
    leadName: 'Miguel Zaballa',
    leadPhoto: leadKevinConlon,
    timeZone: 'America/Costa_Rica',
    employees: 71,
    efficiency: 82,
    address: 'La Aurora Free Zone, Heredia 40105, Costa Rica',
    phoneDisplay: '+506 4002 8840',
    phoneTel: '+50640028840',
    building: {
      name: 'Harland Costa Rica',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Ergonomics audit scheduled next week.',
        security: 'Night shift handover complete.',
        settings: 'Spanish + English UI labels supported (demo).',
      },
      zones: [
        {
          id: 'cr-press',
          label: 'Press cell 2',
          pct: { left: 58, top: 28, width: 24, height: 28 },
          machinery: {
            title: 'Press cell 2 — tonnage & stroke',
            status: 'alert',
            lines: [
              { k: 'Peak force', v: '2% below recipe (5 cycles)' },
              { k: 'Ticket', v: 'ENG-6201 opened' },
            ],
            foot: 'Die maintenance window scheduled — compare tonnage curve to last service.',
          },
        },
      ],
    },
  },
  {
    id: 'il',
    country: 'Israel',
    flagCode: 'IL',
    flagEmoji: '🇮🇱',
    leadRole: 'Site Lead',
    leadName: 'Itamar Haran',
    leadPhoto: leadItamarHaran,
    timeZone: 'Asia/Jerusalem',
    employees: 34,
    efficiency: 75,
    address: '20 Alon ha-Tavor St, Building 5, Caesarea, Israel',
    phoneDisplay: '+972 549 985610',
    phoneTel: '+972549985610',
    building: {
      name: 'Harland Israel',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Laser enclosure interlocks tested.',
        security: 'SCIF zone badge required beyond checkpoint 2 (demo).',
        settings: 'Link Jira epics to floor assets when wired.',
      },
      zones: [
        {
          id: 'il-lab',
          label: 'Pilot line',
          pct: { left: 52, top: 30, width: 28, height: 32 },
          machinery: {
            title: 'Pilot line — build 0.9',
            status: 'idle',
            lines: [
              { k: 'Next run', v: 'Fri 09:00 IDT' },
              { k: 'Firmware', v: 'v2.4.1 staged on benches' },
            ],
            foot: 'HENRY will ingest test-stand CSVs and git build IDs in production.',
          },
        },
      ],
    },
  },
  {
    id: 'in',
    country: 'India',
    flagCode: 'IN',
    flagEmoji: '🇮🇳',
    leadRole: 'Site Lead',
    leadName: 'Deepak Teja',
    leadPhoto: leadDeepakTeja,
    timeZone: 'Asia/Kolkata',
    employees: 78,
    efficiency: 84,
    address: 'Nsl Centrum Mall, Kukatpally Housing Board Colony, KPHB Phase 2, Kukatpally, Hyderabad, Telangana 500085',
    phoneDisplay: '+1 (952) 941-0475',
    phoneTel: '+19529410475',
    building: {
      name: 'Harland India',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Fire drill logged last quarter.',
        security: '24/7 access control on floor 4.',
        settings: 'Replace this map with your India floor when co-locating gear.',
      },
      zones: [
        {
          id: 'in-noc',
          label: 'NOC / racks',
          pct: { left: 56, top: 26, width: 30, height: 36 },
          machinery: {
            title: 'NOC — edge compute & VPN',
            status: 'running',
            lines: [
              { k: 'Uplink', v: 'Redundant · 0 drops (24h)' },
              { k: 'Tickets', v: '2 in queue (P3)' },
            ],
            foot: 'This view mirrors “inside machinery” for IT-heavy sites.',
          },
        },
      ],
    },
  },
  {
    id: 'my',
    country: 'Malaysia',
    flagCode: 'MY',
    flagEmoji: '🇲🇾',
    leadRole: 'Site Lead',
    leadName: 'KS',
    timeZone: 'Asia/Kuala_Lumpur',
    employees: 56,
    efficiency: 78,
    address: 'TBD',
    phoneDisplay: '+1 (952) 941-0475',
    phoneTel: '+19529410475',
    operationalLabel: 'WATCH',
    building: {
      name: 'Harland Malaysia',
      /** Top bar shows building name only (no date/time line under the title). */
      omitTopbarLocal: true,
      // Site-specific floor plan image (user provided).
      floorPlanSrc: `${import.meta.env.BASE_URL}site-floor-plan-my.png`,
      /** Artwork includes a top “Kuala Lumpur — planned facility” banner; clip it off in the viewer. */
      floorPlanClipTopPct: 12,
      footerBlurb: {
        safety: '—',
        security: '—',
        settings: 'Assign building name, zones, and image per site from admin API.',
      },
      zones: [
        {
          id: 'my-placeholder',
          label: 'Future production zone',
          /** Floor plan artwork already includes this title — hide HTML label to avoid doubling. */
          omitMapLabel: true,
          pct: { left: 50, top: 28, width: 32, height: 34 },
          machinery: {
            title: 'Placeholder zone',
            status: 'idle',
            lines: [
              { k: 'Status', v: 'No assets commissioned' },
            ],
            foot: 'When the site goes live, define hotspots on the real floor plan.',
          },
        },
      ],
    },
  },
]

/** Henry10-only footprint — omitted from GLOBAL_SITES so Harland stays six regions. */
const HENRY10_ONLY_SITES = [
  {
    id: 'atl',
    country: 'Atlanta · USA',
    flagCode: 'US',
    flagEmoji: '🇺🇸',
    leadRole: 'VP Operations',
    leadName: 'Camille Rowe',
    timeZone: 'America/New_York',
    employees: 203,
    efficiency: 93,
    address: '1200 West Peachtree St NW Suite 440, Atlanta GA 30309 USA',
    phoneDisplay: '+1 (470) 555-2104',
    phoneTel: '+14705552104',
    building: {
      name: 'Atlanta Fulton Assembly Campus',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'LOTO audit passed · 2 open ergonomic actions tracked to completion Friday.',
        security: 'Keycard anomalies 0 · visitor escorts 6 since 06:00.',
        settings: 'Demo floor plan · replace with your Atlanta CAD export.',
      },
      zones: [
        {
          id: 'atl-robot-a',
          label: 'Robotics lane A',
          pct: { left: 42, top: 30, width: 24, height: 28 },
          machinery: {
            title: 'Robotics lane A — pallet builds',
            status: 'running',
            lines: [
              { k: 'Cycle variance', v: '-1.2% vs nominal' },
              { k: 'Pick accuracy', v: '99.88% (rolling 8 hr)' },
            ],
            foot: 'Throughput aligned with APS window; spare gripper staged on cart 12.',
          },
        },
      ],
    },
  },
  {
    id: 'mia',
    country: 'Miami · USA',
    flagCode: 'US',
    flagEmoji: '🇺🇸',
    leadRole: 'Plant Manager',
    leadName: 'Jordan Pascal',
    timeZone: 'America/New_York',
    employees: 141,
    efficiency: 88,
    address: '8800 NW 119th Terrace, Miami FL 33178 USA',
    phoneDisplay: '+1 (786) 555-0931',
    phoneTel: '+17865550931',
    building: {
      name: 'Miami Dade Components',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Heat stress protocol active for yard crew · rest cycles logged.',
        security: 'Guard tour 4/4 complete · gate 2 camera verified.',
        settings: 'Demo floor plan — Spanish UI labels available in production.',
      },
      zones: [
        {
          id: 'mia-coat',
          label: 'Coating line 3',
          pct: { left: 55, top: 24, width: 28, height: 32 },
          machinery: {
            title: 'Coating line 3 — film thickness',
            status: 'alert',
            lines: [
              { k: 'Film μm', v: '2.1σ high on panel B' },
              { k: 'Hold', v: 'Lots H-902x quarantined' },
            ],
            foot: 'HENRY correlated drift with viscosity batch change at 03:40 local.',
          },
        },
      ],
    },
  },
  {
    id: 'den',
    country: 'Denver · USA',
    flagCode: 'US',
    flagEmoji: '🇺🇸',
    leadRole: 'Site Director',
    leadName: 'Riley Thornton',
    timeZone: 'America/Denver',
    employees: 96,
    efficiency: 90,
    address: '5600 Greenwood Plaza Blvd, Greenwood Village CO 80111 USA',
    phoneDisplay: '+1 (303) 555-4481',
    phoneTel: '+13035554481',
    building: {
      name: 'Front Range Packaging Center',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Near-miss from fork truck corner posted · coaching scheduled.',
        security: 'Perimeter RFID sync OK.',
        settings: 'Demo zoning — uplink redundancy shown in telemetry rail.',
      },
      zones: [
        {
          id: 'den-pkg',
          label: 'Ergo pack island',
          pct: { left: 62, top: 36, width: 22, height: 26 },
          machinery: {
            title: 'Ergo pack island',
            status: 'running',
            lines: [
              { k: 'Units / hr', v: '286 vs target 274' },
              { k: 'RSI watches', v: '0 open' },
            ],
            foot: 'Shift handoff noted faster changeovers after jig swap yesterday.',
          },
        },
      ],
    },
  },
  {
    id: 'scl',
    country: 'Santiago · Chile',
    flagCode: 'CL',
    flagEmoji: '🇨🇱',
    leadRole: 'Gerente planta',
    leadName: 'Valentina Soto',
    timeZone: 'America/Santiago',
    employees: 118,
    efficiency: 86,
    address: 'Av. Chicureo 445, Huechuraba Región Metropolitana, Chile',
    phoneDisplay: '+56 9 7442 1105',
    phoneTel: '+56974421105',
    building: {
      name: 'Planta Norte Maipú',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Charla extintores registrada ayer.',
        security: 'Ronda nocturna completa.',
        settings: 'Mapa demo — cargar BIM real por API admin.',
      },
      zones: [
        {
          id: 'scl-extrusion',
          label: 'Extrusión norte',
          pct: { left: 48, top: 28, width: 26, height: 34 },
          machinery: {
            title: 'Extrusión norte — temperatura zonas',
            status: 'running',
            lines: [
              { k: 'Barril Z3', v: '+2.3°C sobre setpoint (15 min)' },
              { k: 'Scrap rolling', v: '0.7% objetivo ≤1%' },
            ],
            foot: 'Ajuste menor en ventilador de baranda planificado tras turno C.',
          },
        },
      ],
    },
  },
  {
    id: 'tpe',
    country: 'Taipei · Taiwan',
    flagCode: 'TW',
    flagEmoji: '🇹🇼',
    leadRole: 'Facility Lead',
    leadName: 'Mei-Ling Chao',
    timeZone: 'Asia/Taipei',
    employees: 172,
    efficiency: 94,
    address: 'No. 221, Guangfu S. Rd., Xinyi District, Taipei 110, Taiwan',
    phoneDisplay: '+886 2 555 8820',
    phoneTel: '+88625558820',
    building: {
      name: 'Xinyi EMS Floor',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'ESD audit score 96 · minor findings closed same day.',
        security: 'Cage access 18 events · all matched badges.',
        settings: 'ESD map overlay simulated on this JPEG placeholder.',
      },
      zones: [
        {
          id: 'tpe-reflow',
          label: 'Reflow line 02',
          pct: { left: 50, top: 32, width: 30, height: 30 },
          machinery: {
            title: 'Reflow line 02 — thermal profile',
            status: 'running',
            lines: [
              { k: 'Δ peak', v: 'Within ±1.8°C envelope' },
              { k: 'Pass yield', v: '99.3% shifts A+B' },
            ],
            foot: 'SPI upstream stable; carousel buffer at 82% fullness.',
          },
        },
      ],
    },
  },
  {
    id: 'cpt',
    country: 'Cape Town · South Africa',
    flagCode: 'ZA',
    flagEmoji: '🇿🇦',
    leadRole: 'Technical Director',
    leadName: 'Thabo Ndlovu',
    timeZone: 'Africa/Johannesburg',
    employees: 84,
    efficiency: 83,
    address: '10 Brackengate Business Park, Cape Town 7560 South Africa',
    phoneDisplay: '+27 21 555 7740',
    phoneTel: '+27215557740',
    building: {
      name: 'Brackengate Modular Line',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Hydration checkpoints · heat index monitored.',
        security: 'Perimeter intrusion 0 · patrol log signed.',
        settings: 'Grid stability widget is demo KPI only.',
      },
      zones: [
        {
          id: 'cpt-test',
          label: 'EOL test bays',
          pct: { left: 54, top: 26, width: 28, height: 36 },
          machinery: {
            title: 'EOL test bay cluster',
            status: 'running',
            lines: [
              { k: 'First-pass yield', v: '97.4%' },
              { k: 'Retest queue', v: '14 units (< SLA)' },
            ],
            foot: 'False fails down 38% vs last week after fixture pin replacement.',
          },
        },
      ],
    },
  },
  {
    id: 'mex',
    country: 'Mexico City · Mexico',
    flagCode: 'MX',
    flagEmoji: '🇲🇽',
    leadRole: 'Director de Operaciones',
    leadName: 'Esteban Aguilar-Vega',
    timeZone: 'America/Mexico_City',
    employees: 156,
    efficiency: 89,
    address: 'Parque Industrial Tlalpan, Miguel Hidalgo, Ciudad de México CP 02630',
    phoneDisplay: '+52 55 5555 6612',
    phoneTel: '+525555556612',
    building: {
      name: 'Tlapan Stamping & Weld',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Monthly confined-space tabletop completed.',
        security: 'Contractor onboarding 11 cleared.',
        settings: 'NOM compliance narrative is illustrative — wire your permits.',
      },
      zones: [
        {
          id: 'mex-weld',
          label: 'Weld arc cell 05',
          pct: { left: 56, top: 30, width: 26, height: 34 },
          machinery: {
            title: 'Weld arc cell 05',
            status: 'idle',
            lines: [
              { k: 'Reason', v: 'Tip dress & rework tip bank' },
              { k: 'ETA', v: '~35 min post sign-off' },
            ],
            foot: 'Henry suggests mirroring Tucson recipe offset on torch angle.',
          },
        },
      ],
    },
  },
  {
    id: 'waw',
    country: 'Warsaw · Poland',
    flagCode: 'PL',
    flagEmoji: '🇵🇱',
    leadRole: 'Dyrektor Produkcji',
    leadName: 'Katarzyna Zielinski',
    timeZone: 'Europe/Warsaw',
    employees: 132,
    efficiency: 91,
    address: 'ul. Prosta 125, 00-834 Warszawa, Poland',
    phoneDisplay: '+48 22 555 0491',
    phoneTel: '+48225550491',
    building: {
      name: 'Warsaw Prosta Campus',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'PPE vending compliance 98%.',
        security: 'GDPR data residency posture shown in footer API stub.',
        settings: 'Euro pallet lane metric is demo.',
      },
      zones: [
        {
          id: 'waw-assembly',
          label: 'Heijunka assembly',
          pct: { left: 44, top: 34, width: 32, height: 28 },
          machinery: {
            title: 'Heijunka assembly — sequence board',
            status: 'running',
            lines: [
              { k: 'Sequence adherence', v: '97.9%' },
              { k: 'FIFO violations', v: '0 shifts A/B' },
            ],
            foot: 'Kaizen carousel tag #WAW-048 still open for jig shadow board.',
          },
        },
      ],
    },
  },
  {
    id: 'bne',
    country: 'Brisbane · Australia',
    flagCode: 'AU',
    flagEmoji: '🇦🇺',
    leadRole: 'Operations Manager',
    leadName: 'Harriet Bowen',
    timeZone: 'Australia/Brisbane',
    employees: 107,
    efficiency: 87,
    address: '7 Murarrie Rd, Murarrie QLD 4172 Australia',
    phoneDisplay: '+61 7 5551 9930',
    phoneTel: '+61755519930',
    building: {
      name: 'Murarrie Distribution Annex',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Site medic hours extended on heat watch.',
        security: 'Yard CCTV failover test passed.',
        settings: 'Timezone shown as Brisbane local for demo.',
      },
      zones: [
        {
          id: 'bne-dock',
          label: 'Cross-dock scanners',
          pct: { left: 58, top: 30, width: 28, height: 32 },
          machinery: {
            title: 'Cross-dock scanner bank',
            status: 'running',
            lines: [
              { k: 'Reads / hr', v: '612 vs target 585' },
              { k: 'No-read', v: '0.06%' },
            ],
            foot: 'RFID choke point upgrade shadowed overnight window.',
          },
        },
      ],
    },
  },
  {
    id: 'yul',
    country: 'Montréal · Canada',
    flagCode: 'CA',
    flagEmoji: '🇨🇦',
    leadRole: 'Directeur Technique',
    leadName: 'Luc Moreau-Gagnon',
    timeZone: 'America/Toronto',
    employees: 124,
    efficiency: 90,
    address: '3000 Rue Marie-Curie, Saint-Laurent QC H4S 2C2 Canada',
    phoneDisplay: '+1 (514) 555-7720',
    phoneTel: '+15145557720',
    building: {
      name: 'Saint-Laurent Pharma-grade Suite',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        safety: 'Bilingual evacuation drill scheduled Thursday.',
        security: 'Gowning throughput within capacity · no tailbacks.',
        settings: 'Annex layout uses generic photo until your GMP CAD imports.',
      },
      zones: [
        {
          id: 'yul-pressure',
          label: 'Suite airlocks',
          pct: { left: 52, top: 28, width: 26, height: 38 },
          machinery: {
            title: 'Suite airlocks — ΔP cascade',
            status: 'running',
            lines: [
              { k: 'Lock A→B', v: '+18 Pa nominal' },
              { k: 'Alarm history', v: '0 spikes (72h)' },
            ],
            foot: 'Environmental batch export queued for QA batch record appendix.',
          },
        },
      ],
    },
  },
]

/** Site health for global cards: one lit lamp — green ok, amber attention, red critical, all dim = not live. */
const SITE_SNAPSHOT = {
  us: { status: 'Stable', light: 'green', tone: 'good', quality: 98.7, onTime: 94, downtimeMins: 28, escalations: 2 },
  ie: { status: 'Strong', light: 'green', tone: 'good', quality: 99.1, onTime: 98, downtimeMins: 19, escalations: 0 },
  cr: { status: 'Stable', light: 'green', tone: 'good', quality: 98.4, onTime: 95, downtimeMins: 51, escalations: 1 },
  il: { status: 'Stable', light: 'green', tone: 'good', quality: 99.0, onTime: 95, downtimeMins: 29, escalations: 0 },
  in: { status: 'Pilot', light: 'amber', tone: 'idle', quality: 98.1, onTime: 90, downtimeMins: 58, escalations: 1 },
  my: { status: 'Planned', light: 'red', tone: 'warn', quality: null, onTime: null, downtimeMins: null, escalations: 0 },
  atl: { status: 'Strong', light: 'green', tone: 'good', quality: 99.4, onTime: 97, downtimeMins: 18, escalations: 1 },
  mia: { status: 'Watch', light: 'amber', tone: 'warn', quality: 97.9, onTime: 91, downtimeMins: 49, escalations: 3 },
  den: { status: 'Stable', light: 'green', tone: 'good', quality: 98.8, onTime: 95, downtimeMins: 33, escalations: 0 },
  scl: { status: 'Stable', light: 'green', tone: 'good', quality: 98.2, onTime: 93, downtimeMins: 41, escalations: 1 },
  tpe: { status: 'Strong', light: 'green', tone: 'good', quality: 99.6, onTime: 98, downtimeMins: 12, escalations: 0 },
  cpt: { status: 'Stable', light: 'green', tone: 'good', quality: 97.8, onTime: 92, downtimeMins: 55, escalations: 2 },
  mex: { status: 'Ready', light: 'amber', tone: 'idle', quality: 98.9, onTime: 94, downtimeMins: 38, escalations: 1 },
  waw: { status: 'Strong', light: 'green', tone: 'good', quality: 99.2, onTime: 96, downtimeMins: 22, escalations: 0 },
  bne: { status: 'Stable', light: 'green', tone: 'good', quality: 98.0, onTime: 93, downtimeMins: 44, escalations: 1 },
  yul: { status: 'Stable', light: 'green', tone: 'good', quality: 99.5, onTime: 97, downtimeMins: 16, escalations: 0 },
  'aviora-skyline': {
    status: 'On track',
    light: 'green',
    tone: 'good',
    quality: 92,
    onTime: 96,
    downtimeMins: null,
    escalations: 3,
  },
  'aviora-greenfield': {
    status: 'Behind',
    light: 'amber',
    tone: 'warn',
    quality: 88,
    onTime: 79,
    downtimeMins: null,
    escalations: 7,
  },
  'aviora-riverstone': {
    status: 'At risk',
    light: 'red',
    tone: 'bad',
    quality: 82,
    onTime: 58,
    downtimeMins: null,
    escalations: 12,
  },
}

/** Aviora Construction — three portfolio properties (no Harland footprint demo). */
const AVORIA_LOCATION_SITES = [
  {
    id: 'aviora-skyline',
    country: 'Skyline Residences',
    flagCode: 'US',
    flagEmoji: '🏗️',
    leadRole: 'Project Lead',
    leadName: 'Olivia Carter',
    leadPhoto: AVIORA_OLIVIA_LEAD_IMAGE_URL,
    leadPhotoFocus: '50% 38%',
    timeZone: 'America/Chicago',
    employees: 68,
    efficiency: 72,
    address: 'Austin, TX · PR 101 · High-rise residential (demo)',
    phoneDisplay: '—',
    phoneTel: '',
    avioraPropertyId: 'skyline',
    primaryChip: 'Weather delay 4.5 hrs',
    footprintThirdKpiStrong: '4.5 hrs',
    footprintThirdKpiCaption: 'Weather impact',
    operationalLabel: 'OPERATIONAL',
    fpEscalationsLabel: 'Open issues',
    fpEscalationsCount: 3,
    openHint: 'Property detail →',
  },
  {
    id: 'aviora-greenfield',
    country: 'Greenfield Heights',
    flagCode: 'US',
    flagEmoji: '🏗️',
    leadRole: 'Project Lead',
    leadName: 'Ethan Brooks',
    leadPhoto: avioraLeadEthan,
    timeZone: 'America/Phoenix',
    employees: 54,
    efficiency: 48,
    address: 'Phoenix, AZ · PR 102 · Mid-rise community (demo)',
    phoneDisplay: '—',
    phoneTel: '',
    avioraPropertyId: 'greenfield',
    primaryChip: 'Weather delay 12.0 hrs',
    footprintThirdKpiStrong: '12.0 hrs',
    footprintThirdKpiCaption: 'Weather impact',
    operationalLabel: 'MONITORING',
    fpEscalationsLabel: 'Open issues',
    fpEscalationsCount: 7,
    openHint: 'Property detail →',
  },
  {
    id: 'aviora-riverstone',
    country: 'Riverstone Villas',
    flagCode: 'US',
    flagEmoji: '🏗️',
    leadRole: 'Project Lead',
    leadName: 'Maya Singh',
    leadPhoto: avioraLeadMaya,
    timeZone: 'America/New_York',
    employees: 41,
    efficiency: 30,
    address: 'Orlando, FL · PR 103 · Gated villas (demo)',
    phoneDisplay: '—',
    phoneTel: '',
    avioraPropertyId: 'riverstone',
    primaryChip: 'Weather delay 18.5 hrs',
    footprintThirdKpiStrong: '18.5 hrs',
    footprintThirdKpiCaption: 'Weather impact',
    operationalLabel: 'AT RISK',
    fpEscalationsLabel: 'Open issues',
    fpEscalationsCount: 12,
    openHint: 'Property detail →',
  },
]

/** Henry1/Henry3 use ids from `GLOBAL_SITES`; Henry10 uses `HENRY10_ONLY_SITES` (`dashboard/registry` + prisma seed). */
function parseRequestedLocationCount(user) {
  const raw = user?.onboarding?.profile?.locationCount
  const parsed = Number.parseInt(String(raw || '').trim(), 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

function defaultSitesForPreset(user) {
  const preset = resolveDashboardPresetKey(user)
  if (preset === 'henry1') {
    return GLOBAL_SITES.filter((s) => s.id === 'us')
  }
  if (preset === 'henry3') {
    return GLOBAL_SITES.filter((s) => ['us', 'ie', 'cr'].includes(s.id))
  }
  if (preset === 'aviora') {
    return AVORIA_LOCATION_SITES
  }
  if (preset === 'henry10') {
    return HENRY10_ONLY_SITES
  }
  return GLOBAL_SITES
}

function workspaceSitesForUser(user) {
  const requestedCount = parseRequestedLocationCount(user)
  const preset = resolveDashboardPresetKey(user)
  const defaultSites = defaultSitesForPreset(user)
  if (preset === 'aviora') {
    if (!requestedCount) return defaultSites
    return defaultSites.slice(0, Math.max(1, requestedCount))
  }
  if (!requestedCount) return defaultSites

  const uniquePool = [
    ...defaultSites,
    ...HENRY10_ONLY_SITES.filter((site) => !defaultSites.some((s) => s.id === site.id)),
    ...GLOBAL_SITES.filter((site) => !defaultSites.some((s) => s.id === site.id)),
  ]
  return uniquePool.slice(0, Math.max(1, requestedCount))
}

/**
 * Single status lamp. `active` is which color to show; `label` is for a11y + search.
 * Green uses Harland web lime; red/amber are standard signal colors; off = dim grey.
 */
function SiteTrafficLight({ active, label, blink = false }) {
  const safe = ['red', 'amber', 'green'].includes(active) ? active : null
  const signal =
    safe === 'red'
      ? 'Red — critical attention.'
      : safe === 'amber'
        ? 'Amber — watch or rollout.'
        : safe === 'green'
          ? 'Green — operating within target.'
          : 'Status dim — not live or awaiting data.'
  const aria = [label ? `Status: ${label}.` : null, signal].filter(Boolean).join(' ')
  const colorClass =
    safe === 'red'
      ? 'client-site-tl__lamp--red'
      : safe === 'amber'
        ? 'client-site-tl__lamp--amber'
        : safe === 'green'
          ? 'client-site-tl__lamp--green'
          : 'client-site-tl__lamp--off'
  return (
    <span className="client-site-tl" role="img" aria-label={aria}>
      <span className="client-site-tl__track">
        <span
          className={`client-site-tl__lamp client-site-tl__lamp--single ${colorClass}${safe ? ' is-on' : ''}${blink && safe === 'red' ? ' client-site-tl__lamp--blink' : ''}`}
          aria-hidden="true"
        />
      </span>
      {label ? <span className="client-sr-only">{label}</span> : null}
    </span>
  )
}

/** White SnapShot mark for the global footprint ribbon (imported asset, includes TM in artwork). */
function SnapshotWordmark({ compact = false }) {
  return (
    <span
      className={compact ? 'client-snapshot-wordmark client-snapshot-wordmark--sm' : 'client-snapshot-wordmark'}
    >
      <img
        src={snapshotWordmarkWhite}
        alt="SnapShot"
        className="client-snapshot-wordmark__img"
        width={1000}
        height={140}
        loading="lazy"
        decoding="async"
      />
    </span>
  )
}

/** Power BI–style chart strip for the Activities tab (demo SVGs — wire to your warehouse). */
function ActivitiesAnalyticsPanel({ actId, reportRange, onReportRange, leadText, sites = GLOBAL_SITES }) {
  const siteEff = sites.map((s) => ({
    id: s.id,
    code: s.flagCode,
    label: s.id.toUpperCase(),
    v: Math.min(100, Math.max(0, Number(s.efficiency) || 0)),
  }))

  return (
    <div className="client-activities-bi">
      <div className="client-activities-toolbar">
        <span className="client-activities-toolbar-label">Time range</span>
        <div className="client-filter-row" role="toolbar" aria-label="Activity time range">
          {REPORT_RANGE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`client-filter-chip${reportRange === p.id ? ' active' : ''}`}
              onClick={() => onReportRange(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <span className="client-activities-toolbar-hint">Demo visuals · connect Power BI or your lake for live data</span>
      </div>
      {leadText ? <p className="client-text-lead client-activities-bi-lead">{leadText}</p> : null}
      <div className="client-activities-kpis" aria-label="Key metrics">
        <div className="client-activities-kpi">
          <span className="client-activities-kpi-v">91.2%</span>
          <span className="client-activities-kpi-l">Blended OEE</span>
        </div>
        <div className="client-activities-kpi">
          <span className="client-activities-kpi-v">512</span>
          <span className="client-activities-kpi-l">Units / hr (peak)</span>
        </div>
        <div className="client-activities-kpi">
          <span className="client-activities-kpi-v">99.1%</span>
          <span className="client-activities-kpi-l">First-pass yield</span>
        </div>
        <div className="client-activities-kpi">
          <span className="client-activities-kpi-v">186</span>
          <span className="client-activities-kpi-l">Downtime min (shift)</span>
        </div>
      </div>
      <div className="client-activities-charts">
        <article className="client-activities-chart-card">
          <h3 className="client-activities-chart-title">Operational efficiency by site</h3>
          <div className="client-activities-chart-body">
            <svg className="client-activities-svg" viewBox="0 0 100 48" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <linearGradient id={`${actId}-bar1`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
              </defs>
              {siteEff.map((row, i) => {
                const w = 12
                const gap = 1.2
                const x = 4 + i * (w + gap)
                const h = (row.v / 100) * 36
                const y = 40 - h
                return (
                  <g key={row.id}>
                    <rect x={x} y={y} width={w} height={h} rx="1" fill={`url(#${actId}-bar1)`} opacity="0.92" />
                    <text x={x + w / 2} y="46" textAnchor="middle" fontSize="3.2" fill="#64748b" fontFamily="system-ui, sans-serif">
                      {row.code}
                    </text>
                  </g>
                )
              })}
            </svg>
            <p className="client-activities-chart-foot">
              Hotter bars = better efficiency. US pilot metrics may run lower until steady state.
            </p>
          </div>
        </article>
        <article className="client-activities-chart-card">
          <h3 className="client-activities-chart-title">Line output trend</h3>
          <div className="client-activities-chart-body">
            <svg className="client-activities-svg" viewBox="0 0 100 48" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <linearGradient id={`${actId}-trend`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id={`${actId}-line`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <path
                d="M 4 38 L 18 32 L 32 35 L 46 24 L 60 28 L 74 16 L 88 20 L 96 14 L 96 44 L 4 44 Z"
                fill={`url(#${actId}-trend)`}
              />
              <path
                d="M 4 38 L 18 32 L 32 35 L 46 24 L 60 28 L 74 16 L 88 20 L 96 14"
                fill="none"
                stroke={`url(#${actId}-line)`}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="client-activities-chart-foot">
              Correlation view: output dips track with Line 02 cold starts (same as narrative insight).
            </p>
          </div>
        </article>
        <article className="client-activities-chart-card">
          <h3 className="client-activities-chart-title">Scrap &amp; yield mix</h3>
          <div className="client-activities-chart-body client-activities-chart-body--split">
            <svg className="client-activities-svg" viewBox="0 0 100 22" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <rect x="4" y="8" width="92" height="8" rx="1" fill="#e2e8f0" />
              <rect x="4" y="8" width="68" height="8" rx="1" fill="#6d28d9" />
              <rect x="72" y="8" width="17" height="8" fill="#f59e0b" />
              <rect x="89" y="8" width="7" height="8" rx="0 1 1 0" fill="#ef4444" />
            </svg>
            <ul className="client-activities-legend">
              <li>
                <span className="client-activities-legend-swatch client-activities-legend-swatch--fp" /> First-pass 74%
              </li>
              <li>
                <span className="client-activities-legend-swatch client-activities-legend-swatch--rw" /> Rework 18%
              </li>
              <li>
                <span className="client-activities-legend-swatch client-activities-legend-swatch--sc" /> Scrap 8%
              </li>
            </ul>
            <p className="client-activities-chart-foot client-activities-chart-foot--full">
              Pareto drill-down links machine, lot, and shift in production.
            </p>
          </div>
        </article>
        <article className="client-activities-chart-card">
          <h3 className="client-activities-chart-title">Ship window vs plan</h3>
          <div className="client-activities-chart-body">
            <svg className="client-activities-svg" viewBox="0 0 100 48" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <line x1="4" y1="10" x2="96" y2="10" stroke="#c4b5fd" strokeWidth="0.4" strokeDasharray="2 2" />
              <text x="6" y="8" fontSize="2.5" fill="#6d28d9" fontFamily="system-ui, sans-serif">
                Plan
              </text>
              <rect x="8" y="20" width="20" height="16" rx="1" fill="#94a3b8" opacity="0.5" />
              <rect x="32" y="16" width="20" height="20" rx="1" fill="#7c3aed" />
              <rect x="56" y="18" width="20" height="18" rx="1" fill="#a78bfa" />
              <text x="18" y="46" textAnchor="middle" fontSize="2.5" fill="#64748b" fontFamily="system-ui, sans-serif">
                Mon
              </text>
              <text x="42" y="46" textAnchor="middle" fontSize="2.5" fill="#64748b" fontFamily="system-ui, sans-serif">
                Wed
              </text>
              <text x="66" y="46" textAnchor="middle" fontSize="2.5" fill="#64748b" fontFamily="system-ui, sans-serif">
                Fri
              </text>
            </svg>
            <p className="client-activities-chart-foot">
              Forecast: Cell C at risk of missing Friday target without overtime (demo scenario).
            </p>
          </div>
        </article>
      </div>
    </div>
  )
}

function SitePhoneIcon() {
  return (
    <svg className="client-site-phone-icon" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      />
    </svg>
  )
}

function SiteMapPinIcon() {
  return (
    <svg className="client-harland-fp-ico" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
      />
    </svg>
  )
}

function SiteEnvelopeIcon() {
  return (
    <svg className="client-harland-fp-ico" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5L4 8V6l8 5 8-5v2z" />
    </svg>
  )
}

function harlandAccentFromLight(light) {
  if (light === 'green') return { main: '#43a12a', track: '#dcfce7' }
  if (light === 'amber') return { main: '#ea580c', track: '#ffedd5' }
  if (light === 'red') return { main: '#94a3b8', track: '#e2e8f0' }
  return { main: '#5b21b6', track: '#ede9fe' }
}

function harlandSecurityLevel(snap) {
  const light = snap.light ?? 'off'
  if (light === 'red') return 'N/A'
  if (light === 'amber') return 'Medium'
  const esc = snap.escalations ?? 0
  if (esc >= 2) return 'Medium'
  return 'High'
}

function harlandSecurityBarHeights(level) {
  if (level === 'High') return [38, 50, 62, 76, 92]
  if (level === 'Medium') return [32, 42, 50, 58, 66]
  return [16, 18, 14, 20, 16]
}

function harlandSparkPercents(siteId, base) {
  const seed = String(siteId)
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0)
  return Array.from({ length: 8 }, (_, i) => {
    const w = Math.sin(seed * 0.07 + i * 0.55) * 3.2 + (i - 3.5) * 0.4
    return Math.round(Math.max(52, Math.min(100, base + w)))
  })
}

function harlandStatusStepperFilled(light) {
  if (light === 'green') return 4
  if (light === 'amber') return 3
  if (light === 'red') return 1
  return 2
}

function harlandCardStatusCaption(opLabel) {
  const u = String(opLabel || '').toUpperCase()
  if (u === 'WATCH' || u === 'INACTIVE') return 'Inactive'
  if (u === 'MONITORING') return 'Monitoring'
  if (u === 'OPERATIONAL') return 'Operational'
  const s = String(opLabel || '').trim()
  if (!s) return '—'
  return s.charAt(0) + s.slice(1).toLowerCase()
}

function harlandDemoSiteEmail(site) {
  if (site.leadEmail) return site.leadEmail
  return `${String(site.id || 'site').toUpperCase()}@HMS.COM`
}

/** SnapStat-style footprint card (Harland Overview / Locations). */
function HarlandFootprintSiteCard({ site, snap, nowTick, onOpenBuilding, onOpenAvioraProperty }) {
  const light = snap.light ?? 'off'
  const opLabel = site.operationalLabel ?? siteOperationalLabel(light)
  const accent = harlandAccentFromLight(light)
  const fc = String(site.flagCode || '').toLowerCase()
  const inactive = light === 'red'
  const safetyPct = inactive || snap.quality == null ? null : Math.round(Number(snap.quality))
  const securityLevel = harlandSecurityLevel(snap)
  const systemsPct =
    inactive || site.efficiency == null ? null : Math.round(Number(site.efficiency))
  const sparkPts = harlandSparkPercents(site.id, systemsPct ?? 88)
  const sparkMin = Math.min(...sparkPts)
  const sparkSpan = Math.max(1, Math.max(...sparkPts) - sparkMin)
  const w = 88
  const h = 36
  const sparkLinePts = sparkPts
    .map((p, i) => {
      const x = 4 + (i / Math.max(1, sparkPts.length - 1)) * (w - 8)
      const y = h - 5 - ((p - sparkMin) / sparkSpan) * (h - 10)
      return `${x},${y}`
    })
    .join(' ')
  const secBars = harlandSecurityBarHeights(securityLevel)
  const stepFill = harlandStatusStepperFilled(light)
  const cardMods = ['client-site-card', 'client-site-card--fp', 'client-site-card--harland-fp'].join(' ')

  return (
    <article className={cardMods}>
      <button
        type="button"
        className="client-site-card-main client-site-card-main--harland-fp"
        onClick={() => {
          if (site.avioraPropertyId && onOpenAvioraProperty) {
            onOpenAvioraProperty(site.avioraPropertyId)
            return
          }
          onOpenBuilding(site)
        }}
        aria-label={
          site.avioraPropertyId
            ? `Open property dashboard for ${site.country}`
            : `Open building view for ${site.country}`
        }
      >
        <div className="client-harland-fp-top">
          <div className="client-harland-fp-status">
            <SiteTrafficLight
              active={light === 'off' ? null : light}
              label={opLabel}
              blink={light === 'red'}
            />
            <span className={`client-harland-fp-status-txt client-harland-fp-status-txt--${light}`}>
              {opLabel}
            </span>
          </div>
          <div className="client-harland-fp-clock">
            <div className="client-harland-fp-flag" title={site.country}>
              <span className="client-site-flag-emoji" aria-hidden="true">
                {site.flagEmoji || '🏳️'}
              </span>
              <img
                className="client-site-flag-img"
                src={`https://flagcdn.com/w80/${fc}.png`}
                srcSet={`https://flagcdn.com/w160/${fc}.png 2x`}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <div className="client-harland-fp-clock-text">
              <strong>{formatSiteShortTime(nowTick, site.timeZone)}</strong>
              <span>Local time</span>
            </div>
          </div>
        </div>

        <div className="client-harland-fp-lead">
          <div className="client-site-fp-photo" aria-hidden="true">
            {site.leadPhoto ? (
              <img
                src={site.leadPhoto}
                alt=""
                loading="lazy"
                decoding="async"
                style={site.leadPhotoFocus ? { objectPosition: site.leadPhotoFocus } : undefined}
              />
            ) : (
              <span className="client-site-fp-photo-ph">{leadInitials(site.leadName)}</span>
            )}
          </div>
          <div className="client-harland-fp-lead-copy">
            <h3 className="client-site-country client-site-country--harland-fp">{site.country}</h3>
            <p className="client-harland-fp-lead-name">
              <strong>{site.leadName}</strong>
            </p>
            <p className="client-harland-fp-lead-role">{site.leadRole || 'Site Leader'}</p>
          </div>
        </div>

        <div className="client-harland-fp-metrics">
          <div className="client-harland-fp-mcol">
            <span className="client-harland-fp-mcap">Safety</span>
            {safetyPct != null ? (
              <MiniDonut
                value={safetyPct}
                max={100}
                color={accent.main}
                track={accent.track}
                size={72}
                label={`${safetyPct}%`}
              />
            ) : (
              <div className="client-harland-fp-na-donut" aria-hidden="true">
                <span>N/A</span>
              </div>
            )}
          </div>
          <div className="client-harland-fp-mcol">
            <span className="client-harland-fp-mcap">Security</span>
            <div
              className={`client-harland-fp-sec-bars${securityLevel === 'N/A' ? ' client-harland-fp-sec-bars--na' : ''}`}
              style={securityLevel !== 'N/A' ? { ['--harland-bar']: accent.main } : undefined}
              aria-hidden="true"
            >
              {secBars.map((pct, i) => (
                <span key={i} className="client-harland-fp-sec-bar" style={{ height: `${pct}%` }} />
              ))}
            </div>
            <span className="client-harland-fp-mfoot">{securityLevel}</span>
          </div>
          <div className="client-harland-fp-mcol">
            <span className="client-harland-fp-mcap">Systems</span>
            {systemsPct != null ? (
              <>
                <svg
                  className="client-harland-fp-spark"
                  viewBox={`0 0 ${w} ${h}`}
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <polyline
                    points={sparkLinePts}
                    fill="none"
                    stroke={accent.main}
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="client-harland-fp-mfoot">{systemsPct}%</span>
              </>
            ) : (
              <>
                <div className="client-harland-fp-spark-ph" aria-hidden="true" />
                <span className="client-harland-fp-mfoot">N/A</span>
              </>
            )}
          </div>
          <div className="client-harland-fp-mcol">
            <span className="client-harland-fp-mcap">Status</span>
            <div className="client-harland-fp-stepper" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`client-harland-fp-stepper-dot${i < stepFill ? ' is-on' : ''}`}
                  style={
                    i < stepFill
                      ? { background: accent.main, borderColor: accent.main }
                      : undefined
                  }
                />
              ))}
            </div>
            <span className="client-harland-fp-mfoot">{harlandCardStatusCaption(opLabel)}</span>
          </div>
        </div>

        <div className="client-harland-fp-footer">
          <p className="client-harland-fp-foot-row">
            <SiteMapPinIcon />
            <span>{site.address}</span>
          </p>
          <p className="client-harland-fp-foot-row">
            <SiteEnvelopeIcon />
            <a
              className="client-harland-fp-mail"
              href={`mailto:${harlandDemoSiteEmail(site)}`}
              onClick={(e) => e.stopPropagation()}
            >
              {harlandDemoSiteEmail(site)}
            </a>
          </p>
          {site.phoneTel ? (
            <a
              className="client-harland-fp-foot-row client-harland-fp-phone"
              href={`tel:${site.phoneTel}`}
              onClick={(e) => e.stopPropagation()}
            >
              <SitePhoneIcon />
              <span>{site.phoneDisplay}</span>
            </a>
          ) : (
            <p className="client-harland-fp-foot-row">
              <SitePhoneIcon />
              <span>{site.phoneDisplay}</span>
            </p>
          )}
        </div>

        <span className="client-site-open-hint">{site.openHint ?? 'Building view →'}</span>
      </button>
    </article>
  )
}

function buildingMachineryToneClass(status) {
  if (status === 'running') return 'client-building-machinery-badge--run'
  if (status === 'alert') return 'client-building-machinery-badge--alert'
  return 'client-building-machinery-badge--idle'
}

function locationDrivenCardCount(user) {
  const raw = user?.onboarding?.profile?.locationCount
  const parsed = Number.parseInt(String(raw || '').trim(), 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return 6
  return Math.max(3, Math.min(12, parsed))
}

/** Manufacturing reference data per machine model description. */
const MACHINE_SPECS = {
  '528-COATER': {
    manufacturer: 'Harland Medical Systems',
    model: '528 Coater',
    series: 'HMS-CV (vertical cabinet)',
    capability: 'Hydrophilic catheter coating, vertical dip',
    footprint: '48 in × 36 in × 84 in',
    weight: '780 lb',
    power: '230 V / 50 A · 3φ',
    cycleRate: '60–90 s / part',
    firmware: 'HMS Coat OS v4.2.1',
    commissioned: '2022-08-14',
    nextPm: 'Hydraulic seal kit',
  },
  'RDX-195': {
    manufacturer: 'Harland Medical Systems',
    model: 'RDX-195 / RDX-XL',
    series: 'RDX precision dip cabinet',
    capability: 'Programmable dip coating with closed-loop dwell control',
    footprint: '52 in × 38 in × 86 in',
    weight: '910 lb',
    power: '230 V / 60 A · 3φ',
    cycleRate: '45–75 s / part',
    firmware: 'RDX Studio v6.1',
    commissioned: '2023-04-02',
    nextPm: 'Linear-drive lubrication',
  },
  FTS7000: {
    manufacturer: 'Harland Medical Systems',
    model: 'FTS7000 Force Tester',
    series: 'Bench-top mobility cart',
    capability: 'Tensile / compression / friction-of-stop testing',
    footprint: '36 in × 30 in × 70 in',
    weight: '480 lb',
    power: '120 V / 15 A',
    cycleRate: '15–30 s / part',
    firmware: 'FTS Test Suite v3.4',
    commissioned: '2021-11-19',
    nextPm: 'Load-cell calibration',
  },
  CTS1100: {
    manufacturer: 'Harland Medical Systems',
    model: 'CTS1100 Coating Thickness Tester',
    series: 'Bench-top mobility cart',
    capability: 'Optical lubricity & coating thickness measurement',
    footprint: '36 in × 30 in × 70 in',
    weight: '460 lb',
    power: '120 V / 15 A',
    cycleRate: '20–35 s / part',
    firmware: 'CTS Vision v2.7',
    commissioned: '2022-02-08',
    nextPm: 'Optical-stage cleaning',
  },
  TTS1000: {
    manufacturer: 'Harland Medical Systems',
    model: 'TTS1000 Tensile Test Station',
    series: 'Workstation cart',
    capability: 'High-precision tensile testing of catheters / wires',
    footprint: '40 in × 28 in × 72 in',
    weight: '520 lb',
    power: '120 V / 15 A',
    cycleRate: '18–28 s / part',
    firmware: 'TTS Connect v5.0',
    commissioned: '2023-01-30',
    nextPm: 'Grip jaws inspection',
  },
  CUSTOM: {
    manufacturer: 'Harland Medical Systems',
    model: 'Custom Chemistry Rig',
    series: 'Engineered-to-order pilot frame',
    capability: 'Reactor + condenser + chiller pilot setup',
    footprint: '78 in × 30 in × 84 in',
    weight: '1 040 lb',
    power: '230 V / 30 A',
    cycleRate: 'Recipe dependent',
    firmware: 'HMS Pilot OS v1.8',
    commissioned: '2024-06-21',
    nextPm: 'Reactor seal & chiller filter',
  },
}

const OPERATORS_POOL = [
  'Priya Mehta',
  'Marcus Reilly',
  'Sofía Navarro',
  'Diego Alvarez',
  'Hannah Cole',
  'Nikolai Zorichev',
  'Lina Park',
  'Tomás Ribeiro',
]

function hashId(id) {
  let h = 0
  const str = String(id)
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function jobRuntimeStats(id, status) {
  const h = hashId(id)
  const baseCompletion = status === 'Critical' ? 22 : status === 'Moderate' ? 48 : 72
  const completion = Math.min(98, baseCompletion + (h % 18))
  const target = 800 + ((h * 7) % 700)
  const completed = Math.round((target * completion) / 100)
  const cycleSeconds = 32 + (h % 28)
  const oeeBase = status === 'Critical' ? 71 : status === 'Moderate' ? 84 : 92
  const oee = Math.min(99, oeeBase + ((h >> 3) % 6))
  const buildNo = `B${String(120000 + (h % 60000)).padStart(6, '0')}`
  const orderNo = `WO-${String(2025 - (h % 2))}-${String(1000 + (h % 8000)).padStart(4, '0')}`
  const lot = `L${String(70000 + ((h * 11) % 25000))}-${(h % 9) + 1}`
  const operator = OPERATORS_POOL[h % OPERATORS_POOL.length]
  const shift = ['A', 'B', 'C'][h % 3]
  const partsPerHour = Math.round((3600 / cycleSeconds) * (oee / 100))
  const nextPmDays = (h % 14) + 1
  const lastService = `2026-${String(((h % 4) + 1)).padStart(2, '0')}-${String((h % 28) + 1).padStart(2, '0')}`
  const shipStatus = status === 'Critical' ? 'delayed' : status === 'Moderate' ? 'at-risk' : 'on-track'
  let timeVarianceDays
  if (shipStatus === 'on-track') {
    timeVarianceDays = (h >> 1) % 4
  } else if (shipStatus === 'at-risk') {
    timeVarianceDays = -1 - ((h >> 2) % 2)
  } else {
    timeVarianceDays = -3 - ((h >> 2) % 4)
  }
  const baseDays = shipStatus === 'on-track' ? 5 : shipStatus === 'at-risk' ? 10 : 15
  const daysRemaining = baseDays + (h % 6)
  return {
    completion,
    target,
    completed,
    cycleSeconds,
    oee,
    buildNo,
    orderNo,
    lot,
    operator,
    shift,
    partsPerHour,
    nextPmDays,
    lastService,
    shipStatus,
    timeVarianceDays,
    daysRemaining,
  }
}

function machineSerialFor(id, modelKey) {
  const h = hashId(`${modelKey}-${id}`)
  const cleanModel = String(modelKey || '').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4) || 'HMS'
  return `${cleanModel}-${String(h % 90000 + 10000)}`
}

const SHIP_STATUS_LABEL = {
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  delayed: 'Delayed',
}

const SHIP_STATUS_TONE = {
  'on-track': 'good',
  'at-risk': 'warn',
  delayed: 'bad',
}

function ShipStatusIcon({ status }) {
  if (status === 'on-track') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#16a34a" />
        <path d="M7 12.5l3 3 7-7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === 'at-risk') {
    return (
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path d="M12 2 22 21H2L12 2z" fill="#f59e0b" />
        <path d="M12 9v6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="12" cy="18" r="1.1" fill="#fff" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#dc2626" />
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="#475569" strokeWidth="1.6" />
      <path d="M3 9h18" stroke="#475569" strokeWidth="1.6" />
      <path d="M8 3v4M16 3v4" stroke="#475569" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function VarianceArrow({ direction }) {
  const color = direction === 'up' ? '#16a34a' : direction === 'down' ? '#dc2626' : '#475569'
  if (direction === 'up') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M12 4v16M5 11l7-7 7 7" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (direction === 'down') {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path d="M12 4v16M5 13l7 7 7-7" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M5 12h14" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M2 12h4l2-7 4 14 2-7h8" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="6" y="4" width="12" height="17" rx="2" fill="none" stroke="#7c3aed" strokeWidth="1.6" />
      <rect x="9" y="2.5" width="6" height="3" rx="1" fill="#7c3aed" />
      <path d="M9 11h6M9 14h6M9 17h4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M2 7h11v9H2zM13 10h5l3 3v3h-8z" fill="none" stroke="#7c3aed" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="1.7" fill="#7c3aed" />
      <circle cx="17" cy="18" r="1.7" fill="#7c3aed" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" fill="none" stroke="#7c3aed" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" fill="#7c3aed" />
    </svg>
  )
}

function formatTimeVariance(days) {
  const abs = Math.abs(days)
  if (days > 0) return { primary: `+${abs} day${abs === 1 ? '' : 's'}`, label: 'Ahead', dir: 'up' }
  if (days < 0) return { primary: `-${abs} day${abs === 1 ? '' : 's'}`, label: 'Behind', dir: 'down' }
  return { primary: '0 days', label: 'On Time', dir: 'flat' }
}

/** BU 120 / BU 125 job row templates (description + status) for unit job cards. */
const EXACT_JOBS_BY_BU = {
  '120': [
    { description: 'RDX-195', status: 'Stable' },
    { description: 'RDX-195', status: 'Moderate' },
    { description: 'RDX-195', status: 'Stable' },
    { description: 'FTS7000', status: 'Stable' },
    { description: 'FTS7000', status: 'Critical' },
    { description: 'CTS1100', status: 'Moderate' },
  ],
  '125': [
    { description: '528-COATER', status: 'Stable' },
    { description: '528-COATER', status: 'Stable' },
    { description: '528-COATER', status: 'Moderate' },
    { description: 'TTS1000', status: 'Critical' },
    { description: 'TTS1000', status: 'Moderate' },
    { description: 'CUSTOM', status: 'Stable' },
  ],
  '140': [
    { description: 'CTS1100', status: 'Critical' },
    { description: 'CTS1100', status: 'Moderate' },
    { description: 'FTS7000', status: 'Stable' },
    { description: 'FTS7000', status: 'Critical' },
    { description: 'TTS1000', status: 'Moderate' },
    { description: 'TTS1000', status: 'Stable' },
  ],
  '150': [
    { description: '528-COATER', status: 'Stable' },
    { description: '528-COATER', status: 'Moderate' },
    { description: 'CUSTOM', status: 'Stable' },
    { description: 'CUSTOM', status: 'Stable' },
    { description: 'RDX-195', status: 'Moderate' },
    { description: 'RDX-195', status: 'Stable' },
  ],
  '180': [
    { description: '528-COATER', status: 'Moderate' },
    { description: '528-COATER', status: 'Stable' },
    { description: 'RDX-195', status: 'Stable' },
    { description: 'RDX-195', status: 'Critical' },
    { description: 'FTS7000', status: 'Moderate' },
    { description: 'FTS7000', status: 'Stable' },
  ],
  '190': [
    { description: 'TTS1000', status: 'Stable' },
    { description: 'TTS1000', status: 'Stable' },
    { description: 'CUSTOM', status: 'Moderate' },
    { description: 'CTS1100', status: 'Stable' },
    { description: 'CTS1100', status: 'Critical' },
    { description: 'RDX-195', status: 'Stable' },
  ],
  '220': [
    { description: 'CTS1100', status: 'Stable' },
    { description: 'CTS1100', status: 'Stable' },
    { description: 'FTS7000', status: 'Moderate' },
    { description: 'TTS1000', status: 'Stable' },
    { description: 'TTS1000', status: 'Moderate' },
    { description: 'CUSTOM', status: 'Stable' },
  ],
}

function digitsFromUnitLabel(unitLabel) {
  const compact = String(unitLabel || '').replace(/\s/g, '')
  const match = compact.match(/(\d{2,})/)
  return match ? match[1] : '125'
}

function unitJobsForPanel(unitLabel, count) {
  const digits = digitsFromUnitLabel(unitLabel)
  const template = EXACT_JOBS_BY_BU[digits] || EXACT_JOBS_BY_BU['125']
  const n = Math.max(1, Math.min(12, count))
  return Array.from({ length: n }, (_, idx) => {
    const row = template[idx % template.length]
    const jobNum = idx + 1
    const id = `${digits}-${jobNum}`
    const stats = jobRuntimeStats(id, row.status)
    return {
      id,
      title: `Job ${digits}-${jobNum}`,
      description: row.description,
      status: row.status,
      machinePhotoSrc: JOB_MACHINE_IMAGES[id] ?? null,
      stats,
    }
  })
}

function statusTone(status) {
  if (status === 'Critical') return 'critical'
  if (status === 'Moderate') return 'moderate'
  return 'stable'
}

function JobDetailModal({ job, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  if (!job) return null
  const { stats, specs, serial } = job
  const tone = statusTone(job.status)
  return (
    <div className="client-job-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="client-job-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-job-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="client-job-modal-head">
          <div className="client-job-modal-titles">
            <h3 id="client-job-modal-title">{job.title}</h3>
            <p>{`Description: ${job.description}`}</p>
          </div>
          <span className={`client-job-modal-status tone-${tone}`}>{`Status: ${job.status}`}</span>
          <button type="button" className="client-job-modal-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="client-job-modal-body">
          <div className="client-job-modal-photo">
            {job.machinePhotoSrc ? (
              <img src={job.machinePhotoSrc} alt={`${specs?.model || job.description} machine`} />
            ) : (
              <div className="client-job-modal-photo-placeholder">No photo</div>
            )}
          </div>

          <div className="client-job-modal-metrics">
            <div className="client-job-modal-progress">
              <div className="client-job-modal-progress-row">
                <span>Job completion</span>
                <strong>{`${stats.completion}%`}</strong>
              </div>
              <div className={`client-job-modal-progress-track tone-${tone}`}>
                <span style={{ width: `${stats.completion}%` }} />
              </div>
              <div className="client-job-modal-progress-foot">
                {`${stats.completed.toLocaleString()} / ${stats.target.toLocaleString()} units`}
              </div>
            </div>

            <ul className="client-job-modal-kpis">
              <li>
                <span>OEE</span>
                <strong>{`${stats.oee}%`}</strong>
              </li>
              <li>
                <span>Cycle time</span>
                <strong>{`${stats.cycleSeconds}s`}</strong>
              </li>
              <li>
                <span>Throughput</span>
                <strong>{`${stats.partsPerHour}/hr`}</strong>
              </li>
              <li>
                <span>Shift</span>
                <strong>{stats.shift}</strong>
              </li>
            </ul>
          </div>
        </div>

        <section className="client-job-modal-section">
          <h4>Production order</h4>
          <dl className="client-job-modal-dl">
            <div><dt>Build #</dt><dd>{stats.buildNo}</dd></div>
            <div><dt>Work order</dt><dd>{stats.orderNo}</dd></div>
            <div><dt>Lot</dt><dd>{stats.lot}</dd></div>
            <div><dt>Operator</dt><dd>{stats.operator}</dd></div>
          </dl>
        </section>

        <section className="client-job-modal-section">
          <h4>Manufacturing details</h4>
          <dl className="client-job-modal-dl">
            <div><dt>Manufacturer</dt><dd>{specs?.manufacturer || 'Harland Medical Systems'}</dd></div>
            <div><dt>Model</dt><dd>{specs?.model || job.description}</dd></div>
            <div><dt>Series</dt><dd>{specs?.series || '—'}</dd></div>
            <div><dt>Serial #</dt><dd>{serial}</dd></div>
            <div><dt>Capability</dt><dd>{specs?.capability || '—'}</dd></div>
            <div><dt>Footprint</dt><dd>{specs?.footprint || '—'}</dd></div>
            <div><dt>Weight</dt><dd>{specs?.weight || '—'}</dd></div>
            <div><dt>Power</dt><dd>{specs?.power || '—'}</dd></div>
            <div><dt>Rated cycle</dt><dd>{specs?.cycleRate || '—'}</dd></div>
            <div><dt>Firmware</dt><dd>{specs?.firmware || '—'}</dd></div>
            <div><dt>Commissioned</dt><dd>{specs?.commissioned || '—'}</dd></div>
            <div><dt>Last service</dt><dd>{stats.lastService}</dd></div>
            <div><dt>Next PM</dt><dd>{`${specs?.nextPm || 'Routine'} · in ${stats.nextPmDays} day${stats.nextPmDays === 1 ? '' : 's'}`}</dd></div>
          </dl>
        </section>

        <footer className="client-job-modal-foot">
          <button type="button" className="client-job-modal-foot-btn" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  )
}

function MiniDonut({ value, max = 100, color = '#7c3aed', track = '#e9d5ff', size = 86, label, sub }) {
  const safe = Math.max(0, Math.min(100, Math.round((Number(value) / Number(max)) * 100) || 0))
  const r = (size / 2) - 8
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const dash = (safe / 100) * circ
  return (
    <div className="client-bu-mini-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} stroke={track} strokeWidth="8" fill="none" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="client-bu-mini-donut-text">
        <strong>{label}</strong>
        {sub ? <span>{sub}</span> : null}
      </div>
    </div>
  )
}

function MiniBars({ data, maxOverride, showValues = true }) {
  const max = maxOverride ?? Math.max(...data.map((d) => d.value), 1)
  const formatNum = (n) => (n >= 1000 ? n.toLocaleString() : String(n))
  return (
    <div className="client-bu-mini-bars">
      <div className="client-bu-mini-bars-grid">
        {data.map((d) => (
          <div key={d.label} className="client-bu-mini-bar-col" title={`${d.label}: ${d.value}`}>
            {showValues ? <span className="client-bu-mini-bar-top">{formatNum(d.value)}</span> : null}
            <div className="client-bu-mini-bar-track">
              <span
                className="client-bu-mini-bar-fill"
                style={{
                  height: `${(d.value / max) * 100}%`,
                  background: d.color || '#1e3a8a',
                }}
              />
            </div>
            <span className="client-bu-mini-bar-label">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniLine({ data, height = 56, color = '#1e3a8a' }) {
  if (!data?.length) return null
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const span = Math.max(1, max - min)
  const w = 200
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (w - 8) + 4
    const y = height - 6 - ((d.value - min) / span) * (height - 14)
    return `${x},${y}`
  }).join(' ')
  return (
    <div className="client-bu-mini-line">
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" width="100%" height={height} aria-hidden="true">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * (w - 8) + 4
          const y = height - 6 - ((d.value - min) / span) * (height - 14)
          return <circle key={d.label} cx={x} cy={y} r="2.5" fill={color} />
        })}
      </svg>
      <div className="client-bu-mini-line-x">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

function MiniHBar({ rows, max }) {
  const m = max ?? Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="client-bu-mini-hbars">
      {rows.map((r) => (
        <div key={r.label} className="client-bu-mini-hbar">
          <span className="client-bu-mini-hbar-label">{r.label}</span>
          <div className="client-bu-mini-hbar-track">
            <span
              className="client-bu-mini-hbar-fill"
              style={{ width: `${(r.value / m) * 100}%`, background: r.color }}
            />
          </div>
          <span className="client-bu-mini-hbar-value">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

const SAFETY_LEADS = [
  'Priya Shah',
  'Marcus Webb',
  'Anika Iyer',
  'Jorge Alvarado',
  'Sophie Tremblay',
  'Devon Carter',
]

const SECURITY_LEADS = [
  'Robert Lin',
  'Aisha Mensah',
  'Diego Vela',
  'Hannah O’Brien',
  'Ren Tanaka',
  'Lila Petrov',
]

/**
 * Fixed five-card image strip for Safety observations row — matches Trip Hazard → Floor Spill → Guard Missing → Clear Walkway → Blocked Exit.
 * Uses the five user-supplied safety photos.
 */
const HMS_DASH_CARD_IMAGES = [safetyTripHazard, safetyFloorSpill, safetyGuardMissing, safetyClearWalkway, safetyBlockedExit]

/** Fixed CCTV-style thumbnails for security events row (Unauthorized → Vehicle in Zone). */
const SECURITY_CARD_IMAGES = [secUnauthorized, secAfterHours, secPerimeter, secDoorHeld, secVehicle]

/** Safety observation row copy aligned to reference “Safety Observations (Today)” cards. */
const SAFETY_OBS_MOCKUP_ROWS = [
  {
    category: 'Violation',
    catTone: 'bad',
    title: 'Trip Hazard in Aisle',
    where: 'Assembly Area 1',
    timeLabel: '6:08 AM',
    body: 'Loose cord across walkway; cord cover staged for install.',
    risk: 'High Risk',
    riskTone: 'bad',
    status: 'Open',
    stTone: 'bad',
  },
  {
    category: 'Observation',
    catTone: 'warn',
    title: 'Floor Spill',
    where: 'Coater Line B',
    timeLabel: '5:52 AM',
    body: 'Small coolant sheen near drain; absorbent applied.',
    risk: 'Medium Risk',
    riskTone: 'warn',
    status: 'In Progress',
    stTone: 'warn',
  },
  {
    category: 'Observation',
    catTone: 'warn',
    title: 'Guard Missing',
    where: 'Cell 2 wrap station',
    timeLabel: '5:41 AM',
    body: 'Fixed guard panel absent on conveyor pinch point; LOTO applied and parts ordered.',
    risk: 'Medium Risk',
    riskTone: 'warn',
    status: 'In Progress',
    stTone: 'warn',
  },
  {
    category: 'Safe',
    catTone: 'good',
    title: 'Clear Walkway',
    where: 'Main aisle B',
    timeLabel: '5:35 AM',
    body: 'Aisles clear; floor markings visible; no pallets in egress path.',
    risk: 'Low Risk',
    riskTone: 'good',
    status: 'Safe',
    stTone: 'good',
  },
  {
    category: 'Violation',
    catTone: 'bad',
    title: 'Blocked Exit',
    where: 'Warehouse east',
    timeLabel: '5:22 AM',
    body: 'Cartons staged in front of designated egress; crew relocating per permit.',
    risk: 'High Risk',
    riskTone: 'bad',
    status: 'Open',
    stTone: 'bad',
  },
]

/** Security event rows (same five thumbnails as safety, fixed order). */
const SECURITY_EVENTS_MOCKUP_ROWS = [
  {
    severity: 'High',
    sevTone: 'bad',
    title: 'Unauthorized Access',
    where: 'Back Entrance',
    timeLabel: '5:58 AM',
    body: 'Badge mismatch at reader; guard dispatched and verified visitor escort.',
    status: 'Investigating',
    stTone: 'bad',
  },
  {
    severity: 'Medium',
    sevTone: 'warn',
    title: 'Perimeter Motion',
    where: 'North fence line',
    timeLabel: '5:44 AM',
    body: 'Camera AI flagged motion outside shift window; patrol cleared debris.',
    status: 'Under Review',
    stTone: 'warn',
  },
  {
    severity: 'Low',
    sevTone: 'info',
    title: 'Door Held Open',
    where: 'Loading Dock 2',
    timeLabel: '5:31 AM',
    body: 'Door propped 42s; auto-chime acknowledged by forklift lead.',
    status: 'Closed',
    stTone: 'good',
  },
  {
    severity: 'Medium',
    sevTone: 'warn',
    title: 'Camera Stream Lag',
    where: 'Server Room corridor',
    timeLabel: '5:18 AM',
    body: 'Stream 2s behind; switch port flapped once then stable.',
    status: 'Under Review',
    stTone: 'warn',
  },
  {
    severity: 'Low',
    sevTone: 'info',
    title: 'Contractor Check-In',
    where: 'Main Lobby',
    timeLabel: '5:05 AM',
    body: 'Two badges issued; escort confirmed to cage work.',
    status: 'Closed',
    stTone: 'good',
  },
]

function fmtTrend(arrow, pct, isGood) {
  const sym = arrow === 'up' ? '↑' : arrow === 'down' ? '↓' : '—'
  let cls = 'client-hms-trend--neutral'
  if (arrow === 'up' || arrow === 'down') cls = isGood ? 'client-hms-trend--good' : 'client-hms-trend--bad'
  const pctPart = pct === 0 && sym === '—' ? '0%' : `${pct}%`
  return { text: `${sym} ${pctPart} vs yesterday`, cls }
}

/** Harland-style safety dashboard (BU120 / BU125 + building scope). */
function safetyDashboardFor(scopeId, unitDigits) {
  const h = hashId(`safety-dash-${scopeId || 'all'}`)
  const bu = unitDigits === '120' ? 120 : unitDigits === '125' ? 125 : 0
  const shift = bu === 120 ? 101 : bu === 125 ? 0 : 37
  const hx = (h + shift) >>> 0
  const observations = SAFETY_OBS_MOCKUP_ROWS.map((row, i) => ({
    ...row,
    id: `so-${i}-${hx}`,
    img: HMS_DASH_CARD_IMAGES[i],
  }))
  const lead = SAFETY_LEADS[hx % SAFETY_LEADS.length]

  if (bu === 125) {
    return {
      scorePct: 91,
      scoreWord: 'Excellent',
      totalObservations: 17,
      violations: 6,
      safeConditions: 10,
      actionsTaken: 4,
      openActions: 3,
      areasInspected: 9,
      areasTotal: 12,
      trends: {
        obs: fmtTrend('up', 15, true),
        viol: fmtTrend('down', 13, false),
        open: fmtTrend('down', 27, false),
      },
      observations,
      lead,
    }
  }

  if (bu === 120) {
    return {
      scorePct: 83,
      scoreWord: 'Good',
      totalObservations: 18,
      violations: 6,
      safeConditions: 12,
      actionsTaken: 5,
      openActions: 3,
      areasInspected: 8,
      areasTotal: 12,
      trends: {
        obs: fmtTrend('up', 12, true),
        viol: fmtTrend('down', 14, false),
        open: fmtTrend('down', 25, false),
      },
      observations,
      lead,
    }
  }

  const totalObs = 14 + (hx % 9)
  const violations = 4 + (hx % 5)
  const safeCond = Math.max(2, totalObs - violations - ((hx >> 3) % 3))
  const actionsTaken = 3 + ((hx >> 2) % 5)
  const openActions = 2 + ((hx >> 4) % 4)
  const areasTotal = 12
  const areasInspected = 6 + ((hx >> 1) % 5)
  const scorePct = 78 + (hx % 14)
  const scoreWord = scorePct >= 90 ? 'Excellent' : scorePct >= 82 ? 'Good' : 'Watch'

  return {
    scorePct,
    scoreWord,
    totalObservations: totalObs,
    violations,
    safeConditions: safeCond,
    actionsTaken,
    openActions,
    areasInspected,
    areasTotal,
    trends: {
      obs: fmtTrend('up', 8 + (hx % 8), true),
      viol: fmtTrend('down', 10 + (hx % 12), false),
      open: fmtTrend('down', 15 + (hx % 15), false),
    },
    observations,
    lead,
  }
}

/** Harland-style security dashboard (BU120 / BU125 + building scope). */
function securityDashboardFor(scopeId, unitDigits) {
  const h = hashId(`sec-dash-${scopeId || 'all'}`)
  const bu = unitDigits === '120' ? 120 : unitDigits === '125' ? 125 : 0
  const shift = bu === 120 ? 59 : bu === 125 ? 0 : 23
  const hx = (h + shift) >>> 0
  const totalEvents = 11 + (hx % 10)
  const highSev = Math.min(2, (hx >> 3) % 3)
  const medSev = 2 + ((hx >> 1) % 4)
  const lowSev = Math.max(0, totalEvents - highSev - medSev)
  const openInv = 1 + ((hx >> 3) % 3)
  const cameraTotal = 48 + (hx % 6)
  const cameraOnline = Math.max(cameraTotal - 2, cameraTotal - ((hx >> 4) % 3))
  const cameraPct = Math.round((cameraOnline / cameraTotal) * 100)
  const scorePct = 88 + (hx % 10)
  const scoreWord = scorePct >= 91 ? 'Excellent' : scorePct >= 84 ? 'Good' : 'Watch'
  const events = SECURITY_EVENTS_MOCKUP_ROWS.map((row, i) => ({
    ...row,
    id: `se-${i}-${hx}`,
    img: SECURITY_CARD_IMAGES[i] || SECURITY_CARD_IMAGES[SECURITY_CARD_IMAGES.length - 1],
  }))
  const lead = SECURITY_LEADS[hx % SECURITY_LEADS.length]
  return {
    scorePct,
    scoreWord,
    totalEvents,
    highSev,
    medSev,
    lowSev,
    openInvestigations: openInv,
    cameraOnline,
    cameraTotal,
    cameraPct,
    trends: {
      events: fmtTrend('down', 8 + (hx % 12), true),
      high: fmtTrend('flat', 0, true),
      inv: fmtTrend('down', 20 + (hx % 20), true),
    },
    events,
    lead,
  }
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5L12 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12.5l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SystemsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="15.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

function ShieldPlusDashIcon() {
  return (
    <svg className="client-hms-dash-shield" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function HmsDashTimeRange({ value, onChange, variant }) {
  return (
    <div className={`client-hms-dash-range client-hms-dash-range--${variant}`} role="group" aria-label="Report range">
      {(['daily', 'weekly', 'monthly']).map((r) => (
        <button
          key={r}
          type="button"
          className={value === r ? 'is-active' : ''}
          aria-pressed={value === r}
          onClick={() => onChange(r)}
        >
          {r === 'daily' ? 'Daily' : r === 'weekly' ? 'Weekly' : 'Monthly'}
        </button>
      ))}
    </div>
  )
}

function SafetyPanel({ scopeId, scopeName, localLine, unitDigits }) {
  const ud = unitDigits || ''
  const [timeRange, setTimeRange] = useState('daily')
  const data = useMemo(() => safetyDashboardFor(scopeId, ud), [scopeId, ud])
  const areasPct = Math.round((data.areasInspected / Math.max(1, data.areasTotal)) * 100)

  const inner = (
    <div className={`client-hms-dash${unitDigits ? ' client-hms-dash--in-unit' : ''}`} aria-label={`${scopeName} safety dashboard`}>
      {unitDigits ? (
        <header className="client-hms-dash-strip client-hms-dash-strip--safety">
          <div className="client-hms-dash-top-left">
            <ShieldPlusDashIcon />
            <span className="client-hms-dash-title">Safety Dashboard</span>
          </div>
        </header>
      ) : (
        <header className="client-hms-dash-top client-hms-dash-top--safety">
          <div className="client-hms-dash-top-left">
            <ShieldPlusDashIcon />
            <span className="client-hms-dash-title">Safety Dashboard</span>
          </div>
          <HmsDashTimeRange value={timeRange} onChange={setTimeRange} variant="safety" />
        </header>
      )}

      <div className="client-hms-dash-kpis">
        <div className="client-hms-dash-kpi client-hms-dash-kpi--score">
          <p className="client-hms-dash-kpi-cap">Safety Score</p>
          <MiniDonut
            value={data.scorePct}
            color="#16a34a"
            track="#dcfce7"
            size={100}
            label={`${data.scorePct}%`}
            sub={data.scoreWord}
          />
        </div>
        <div className="client-hms-dash-kpi">
          <p className="client-hms-dash-kpi-value">{data.totalObservations}</p>
          <p className="client-hms-dash-kpi-label">Total Observations</p>
          <p className="client-hms-dash-kpi-sub">Today</p>
          <p className={`client-hms-dash-kpi-trend ${data.trends.obs.cls}`}>{data.trends.obs.text}</p>
        </div>
        <div className="client-hms-dash-kpi">
          <p className="client-hms-dash-kpi-value">{data.violations}</p>
          <p className="client-hms-dash-kpi-label">Violations</p>
          <p className="client-hms-dash-kpi-sub">Today</p>
          <p className={`client-hms-dash-kpi-trend ${data.trends.viol.cls}`}>{data.trends.viol.text}</p>
        </div>
        <div className="client-hms-dash-kpi">
          <p className="client-hms-dash-kpi-value">{data.openActions}</p>
          <p className="client-hms-dash-kpi-label">Open Actions</p>
          <p className="client-hms-dash-kpi-sub">Requires Attention</p>
          <p className={`client-hms-dash-kpi-trend ${data.trends.open.cls}`}>{data.trends.open.text}</p>
        </div>
        <div className="client-hms-dash-kpi">
          <p className="client-hms-dash-kpi-value">{`${data.areasInspected} / ${data.areasTotal}`}</p>
          <p className="client-hms-dash-kpi-label">Areas Inspected</p>
          <p className="client-hms-dash-kpi-sub">Areas</p>
          <p className="client-hms-dash-kpi-trend client-hms-trend--neutral">{`${areasPct}% of total areas`}</p>
        </div>
      </div>

      <section className="client-hms-dash-section">
        <div className="client-hms-dash-section-head">
          <h3 className="client-hms-dash-section-title">Safety Observations (Today)</h3>
          <button type="button" className="client-hms-dash-viewall">
            View All
          </button>
        </div>
        <div className="client-hms-dash-card-row">
          {data.observations.map((o) => (
            <article key={o.id} className="client-hms-dash-obs-card">
              <div className="client-hms-dash-obs-imgwrap">
                <img src={o.img} alt="" className="client-hms-dash-obs-img" loading="lazy" decoding="async" />
                <span className={`client-hms-tag client-hms-tag--${o.catTone}`}>{o.category}</span>
              </div>
              <div className="client-hms-dash-obs-body">
                <h4 className="client-hms-dash-obs-title">{o.title}</h4>
                <p className="client-hms-dash-obs-meta">{`${o.where}  ${o.timeLabel}`}</p>
                <p className="client-hms-dash-obs-desc">{o.body}</p>
                <span className={`client-hms-risk client-hms-risk--${o.riskTone}`}>{o.risk}</span>
                <p className={`client-hms-dash-obs-status client-hms-dash-obs-status--${o.stTone}`}>{`Status: ${o.status}`}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="client-hms-dash-foot">
        <span>
          <strong>EHS Lead:</strong> {data.lead}
        </span>
        {localLine ? <span>{`Updated · ${localLine}`}</span> : null}
      </footer>
    </div>
  )

  if (unitDigits) {
    return (
      <section className="client-unit-dash-panel" aria-label={`BU ${unitDigits} safety`}>
        <UnitHarlandPanelHeader unitDigits={unitDigits} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <div className="client-hms-dash-wrap client-hms-dash-wrap--unit">{inner}</div>
      </section>
    )
  }

  return (
    <section className="client-hms-dash-wrap" aria-label="Building safety">
      {inner}
    </section>
  )
}

function SecurityPanel({ scopeId, scopeName, localLine, unitDigits }) {
  const ud = unitDigits || ''
  const [timeRange, setTimeRange] = useState('daily')
  const data = useMemo(() => securityDashboardFor(scopeId, ud), [scopeId, ud])

  const inner = (
    <div className={`client-hms-dash${unitDigits ? ' client-hms-dash--in-unit' : ''}`} aria-label={`${scopeName} security dashboard`}>
      {unitDigits ? (
        <header className="client-hms-dash-strip client-hms-dash-strip--security">
          <div className="client-hms-dash-top-left">
            <ShieldIcon />
            <span className="client-hms-dash-title">Security Dashboard</span>
          </div>
        </header>
      ) : (
        <header className="client-hms-dash-top client-hms-dash-top--security">
          <div className="client-hms-dash-top-left">
            <ShieldIcon />
            <span className="client-hms-dash-title">Security Dashboard</span>
          </div>
          <HmsDashTimeRange value={timeRange} onChange={setTimeRange} variant="security" />
        </header>
      )}

      <div className="client-hms-dash-kpis">
        <div className="client-hms-dash-kpi client-hms-dash-kpi--score">
          <p className="client-hms-dash-kpi-cap">Security Score</p>
          <MiniDonut
            value={data.scorePct}
            color="#22c55e"
            track="#bbf7d0"
            size={100}
            label={`${data.scorePct}%`}
            sub={data.scoreWord}
          />
        </div>
        <div className="client-hms-dash-kpi">
          <p className="client-hms-dash-kpi-value">{data.totalEvents}</p>
          <p className="client-hms-dash-kpi-label">Total Events</p>
          <p className="client-hms-dash-kpi-sub">Today</p>
          <p className={`client-hms-dash-kpi-trend ${data.trends.events.cls}`}>{data.trends.events.text}</p>
        </div>
        <div className="client-hms-dash-kpi">
          <p className="client-hms-dash-kpi-value">{data.highSev}</p>
          <p className="client-hms-dash-kpi-label">High Severity</p>
          <p className="client-hms-dash-kpi-sub">Today</p>
          <p className={`client-hms-dash-kpi-trend ${data.trends.high.cls}`}>{data.trends.high.text}</p>
        </div>
        <div className="client-hms-dash-kpi">
          <p className="client-hms-dash-kpi-value">{data.openInvestigations}</p>
          <p className="client-hms-dash-kpi-label">Open Investigations</p>
          <p className="client-hms-dash-kpi-sub">Requires Attention</p>
          <p className={`client-hms-dash-kpi-trend ${data.trends.inv.cls}`}>{data.trends.inv.text}</p>
        </div>
        <div className="client-hms-dash-kpi">
          <p className="client-hms-dash-kpi-value">{`${data.cameraOnline} / ${data.cameraTotal}`}</p>
          <p className="client-hms-dash-kpi-label">Cameras Online</p>
          <p className="client-hms-dash-kpi-sub">Cameras</p>
          <p className="client-hms-dash-kpi-trend client-hms-trend--neutral">{`${data.cameraPct}% Online`}</p>
        </div>
      </div>

      <section className="client-hms-dash-section">
        <div className="client-hms-dash-section-head">
          <h3 className="client-hms-dash-section-title">Latest Security Events (Today)</h3>
          <button type="button" className="client-hms-dash-viewall">
            View All
          </button>
        </div>
        <div className="client-hms-dash-card-row">
          {data.events.map((ev) => (
            <article key={ev.id} className="client-hms-dash-obs-card client-hms-dash-obs-card--sec">
              <div className="client-hms-dash-obs-imgwrap client-hms-dash-obs-imgwrap--sec">
                <img src={ev.img} alt="" className="client-hms-dash-obs-img" loading="lazy" decoding="async" />
                <span className={`client-hms-tag client-hms-tag--${ev.sevTone}`}>{ev.severity}</span>
              </div>
              <div className="client-hms-dash-obs-body">
                <h4 className="client-hms-dash-obs-title">{ev.title}</h4>
                <p className="client-hms-dash-obs-meta">{`${ev.where}  ${ev.timeLabel}`}</p>
                <p className="client-hms-dash-obs-desc">{ev.body}</p>
                <p className={`client-hms-dash-obs-status client-hms-dash-obs-status--${ev.stTone}`}>{`Status: ${ev.status}`}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer className="client-hms-dash-foot">
        <span>
          <strong>Security Lead:</strong> {data.lead}
        </span>
        {localLine ? <span>{`Updated · ${localLine}`}</span> : null}
      </footer>
    </div>
  )

  if (unitDigits) {
    return (
      <section className="client-unit-dash-panel" aria-label={`BU ${unitDigits} security`}>
        <UnitHarlandPanelHeader unitDigits={unitDigits} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <div className="client-hms-dash-wrap client-hms-dash-wrap--unit">{inner}</div>
      </section>
    )
  }

  return (
    <section className="client-hms-dash-wrap" aria-label="Building security">
      {inner}
    </section>
  )
}

function UnitSystemsPanel({ unitPanel }) {
  const embed = unitPanel?.powerBiEmbed
  const reportUrl = typeof embed === 'string' ? embed : embed?.reportUrl
  const unitLabel = unitPanel?.unit ? String(unitPanel.unit).replace(/^BU/i, 'BU ') : 'BU'
  const unitDigits = digitsFromUnitLabel(String(unitPanel?.unit || '').replace(/^BU\s*/i, ''))
  const [timeRange, setTimeRange] = useState('daily')
  return (
    <section className="client-unit-dash-panel" aria-label={`${unitLabel} systems`}>
      <UnitHarlandPanelHeader unitDigits={unitDigits} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      <FactoryPulseChartsPanel reportUrl={reportUrl} heading={`Systems — ${unitLabel}`} />
    </section>
  )
}

function UnitOverviewSide({
  unitPanel,
  statusLabel,
  cards,
  localLine,
  onClose,
  digits,
  scopeId,
  unitView = 'jobs',
  onUnitViewChange,
}) {
  const tally = cards.reduce(
    (acc, c) => {
      const k = c.stats.shipStatus
      if (k === 'on-track') acc.onTrack += 1
      else if (k === 'at-risk') acc.atRisk += 1
      else acc.delayed += 1
      return acc
    },
    { onTrack: 0, atRisk: 0, delayed: 0 },
  )
  const aheadCount = cards.filter((c) => c.stats.timeVarianceDays > 0).length
  const onTimeCount = cards.filter((c) => c.stats.timeVarianceDays === 0).length
  const behindCount = cards.filter((c) => c.stats.timeVarianceDays < 0).length
  const avgCompletion = cards.length
    ? Math.round(cards.reduce((s, c) => s + c.stats.completion, 0) / cards.length)
    : 0
  const avgDaysRemaining = cards.length
    ? (cards.reduce((s, c) => s + c.stats.daysRemaining, 0) / cards.length).toFixed(1)
    : '0.0'

  const isBu120 = digits === '120'

  const targetMatch = String(unitPanel.targetVsActual || '').match(/([\d,]+)\s*vs\s*([\d,]+)/i)
  const targetNum = targetMatch ? Number(targetMatch[1].replace(/,/g, '')) : 0
  const actualNum = targetMatch ? Number(targetMatch[2].replace(/,/g, '')) : 0
  const cycleNum = Number(String(unitPanel.cycleTime || '').match(/\d+/)?.[0] || 0)
  const throughputNum = Number(String(unitPanel.throughput || '').match(/\d+/)?.[0] || 0)
  const activeMachinesParts = String(unitPanel.activeMachines || '0/0').split('/').map((s) => Number(s.trim()) || 0)

  const cycleTrend = [
    { label: '3 AM', value: cycleNum + 6 },
    { label: '6 AM', value: cycleNum + 1 },
    { label: '9 AM', value: cycleNum - 2 },
    { label: '12 PM', value: cycleNum - 4 },
    { label: '3 PM', value: cycleNum + 3 },
  ]
  const throughputTrend = [
    { label: '3 AM', value: Math.max(20, Math.round(throughputNum * 0.75)) },
    { label: '6 AM', value: Math.max(20, Math.round(throughputNum * 1.04)) },
    { label: '9 AM', value: Math.max(30, Math.round(throughputNum * 1.18)) },
    { label: '12 PM', value: Math.max(30, Math.round(throughputNum * 0.94)) },
    { label: '3 PM', value: Math.max(28, Math.round(throughputNum * 0.99)) },
  ]

  const showStatusSide = !onUnitViewChange || unitView === 'jobs'
  const showSystemsSide = onUnitViewChange && unitView === 'systems'
  const dashSafety = onUnitViewChange && scopeId ? safetyDashboardFor(scopeId, digits || '') : null
  const dashSec = onUnitViewChange && scopeId ? securityDashboardFor(scopeId, digits || '') : null

  return (
    <aside className="client-bu-side client-bu-side--v2">
      <button type="button" className="client-building-back" onClick={onClose}>
        ← Back to home page
      </button>
      <h3 className="client-bu-title">Business Unit: {unitPanel.unit}</h3>

      <div className="client-bu-text client-bu-text--meta">
        <p><strong>Description:</strong> {unitPanel.description}</p>
        <p><strong>BU Manager:</strong> {unitPanel.manager}</p>
        <p><strong>Assistant:</strong> {unitPanel.assistant}</p>
      </div>

      {onUnitViewChange && unitView === 'safety' && dashSafety ? (
        <section className="client-bu-section">
          <h5 className="client-bu-section-title"><ShieldIcon /> Safety Summary (Today):</h5>
          <ul className="client-bu-section-list client-hms-side-sum">
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--neutral" aria-hidden />
              Total Observations: <strong>{dashSafety.totalObservations}</strong>
            </li>
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--good" aria-hidden />
              Safe Conditions: <strong>{dashSafety.safeConditions}</strong>
            </li>
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--bad" aria-hidden />
              Violations: <strong>{dashSafety.violations}</strong>
            </li>
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--warn" aria-hidden />
              Actions Taken: <strong>{dashSafety.actionsTaken}</strong>
            </li>
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--info" aria-hidden />
              Open Actions: <strong>{dashSafety.openActions}</strong>
            </li>
          </ul>
        </section>
      ) : null}

      {onUnitViewChange && unitView === 'security' && dashSec ? (
        <section className="client-bu-section">
          <h5 className="client-bu-section-title"><LockIcon /> Security Summary (Today):</h5>
          <ul className="client-bu-section-list client-hms-side-sum">
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--neutral" aria-hidden />
              Total Events: <strong>{dashSec.totalEvents}</strong>
            </li>
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--bad" aria-hidden />
              High Severity: <strong>{dashSec.highSev}</strong>
            </li>
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--warn" aria-hidden />
              Medium Severity: <strong>{dashSec.medSev}</strong>
            </li>
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--info" aria-hidden />
              Low Severity: <strong>{dashSec.lowSev}</strong>
            </li>
            <li>
              <span className="client-hms-sum-dot client-hms-sum-dot--info" aria-hidden />
              Open Investigations: <strong>{dashSec.openInvestigations}</strong>
            </li>
          </ul>
        </section>
      ) : null}

      {showStatusSide ? (
      <>
      <section className="client-bu-section">
        <h5 className="client-bu-section-title"><PulseIcon /> Real-Time Status:</h5>
        {isBu120 ? (
          <ul className="client-bu-section-list">
            <li>Current Status: {String(statusLabel).charAt(0).toUpperCase() + String(statusLabel).slice(1)}</li>
            <li>Active Jobs: {cards.length}</li>
            <li>On-Track to Ship: {tally.onTrack}</li>
            <li>At Risk / Delayed: {tally.atRisk + tally.delayed}</li>
            <li>Active Operators: {unitPanel.activeOperators}</li>
            <li>Last Updated: {localLine}</li>
          </ul>
        ) : (
          <ul className="client-bu-section-list">
            <li>Current Status: {String(statusLabel).charAt(0).toUpperCase() + String(statusLabel).slice(1)}</li>
            <li>Active Machines: {unitPanel.activeMachines}</li>
            <li>Active Operators: {unitPanel.activeOperators}</li>
            <li>Last Updated: {localLine}</li>
          </ul>
        )}
      </section>

      <section className="client-bu-section">
        <h5 className="client-bu-section-title"><ClipboardIcon /> {isBu120 ? 'Production Overview:' : 'Production Details:'}</h5>
        {isBu120 ? (
          <ul className="client-bu-section-list">
            <li>Avg Completion: {avgCompletion}%</li>
            <li>Ahead / On Time / Behind: {aheadCount} / {onTimeCount} / {behindCount}</li>
            <li>Avg Days Remaining: {avgDaysRemaining}</li>
            <li>Daily Throughput: {cards.length} active builds</li>
          </ul>
        ) : (
          <ul className="client-bu-section-list">
            <li>Today&apos;s Output: {unitPanel.todaysOutput}</li>
            <li>Target vs Actual: {unitPanel.targetVsActual}</li>
            <li>Cycle Time (Avg): {unitPanel.cycleTime}</li>
            <li>Throughput: {unitPanel.throughput}</li>
          </ul>
        )}
      </section>

      <section className="client-bu-section">
        <h5 className="client-bu-section-title"><TruckIcon /> Shipping Outlook:</h5>
        <ul className="client-bu-section-list client-bu-shipout">
          <li><span className="client-bu-shipdot tone-good" />On Track: <strong>{tally.onTrack}</strong></li>
          <li><span className="client-bu-shipdot tone-warn" />At Risk: <strong>{tally.atRisk}</strong></li>
          <li><span className="client-bu-shipdot tone-bad" />Delayed: <strong>{tally.delayed}</strong></li>
        </ul>
      </section>

      {isBu120 ? (
      <section className="client-bu-section">
        <h5 className="client-bu-section-title"><EyeIcon /> Visual Snapshot</h5>
        <div className="client-bu-snap-grid">
            <>
              <div className="client-bu-snap-card">
                <p className="client-bu-snap-card-title">Active Jobs</p>
                <div className="client-bu-snap-row">
                  <MiniDonut
                    value={cards.length}
                    max={Math.max(cards.length, 6)}
                    color="#5b21b6"
                    track="#ede9fe"
                    label={String(cards.length)}
                    sub="Active Jobs"
                  />
                  <div className="client-bu-snap-aux">
                    <strong>{unitPanel.activeOperators}</strong>
                    <span>Operators</span>
                  </div>
                </div>
              </div>
              <div className="client-bu-snap-card">
                <p className="client-bu-snap-card-title">Average Completion</p>
                <div className="client-bu-snap-row">
                  <MiniDonut
                    value={avgCompletion}
                    color="#5b21b6"
                    track="#ede9fe"
                    label={`${avgCompletion}%`}
                  />
                </div>
                <p className="client-bu-snap-foot">{`Avg Days Remaining: ${avgDaysRemaining}`}</p>
              </div>
              <div className="client-bu-snap-card">
                <p className="client-bu-snap-card-title">Build Schedule Status</p>
                <MiniHBar
                  rows={[
                    { label: 'Ahead', value: aheadCount, color: '#16a34a' },
                    { label: 'On Time', value: onTimeCount, color: '#1e3a8a' },
                    { label: 'Behind', value: behindCount, color: '#dc2626' },
                  ]}
                />
              </div>
              <div className="client-bu-snap-card">
                <p className="client-bu-snap-card-title">Shipping Outlook</p>
                <MiniHBar
                  rows={[
                    { label: 'On Track', value: tally.onTrack, color: '#16a34a' },
                    { label: 'At Risk', value: tally.atRisk, color: '#f59e0b' },
                    { label: 'Delayed', value: tally.delayed, color: '#dc2626' },
                  ]}
                />
              </div>
            </>
        </div>
      </section>
      ) : null}
      </>
      ) : null}

      {showSystemsSide ? (
        <section className="client-bu-section">
          <h5 className="client-bu-section-title"><SystemsIcon /> Systems Overview</h5>
          <div className="client-bu-snap-grid">
              <div className="client-bu-snap-card">
                <p className="client-bu-snap-card-title">Active Machines</p>
                <div className="client-bu-snap-row">
                  <MiniDonut
                    value={activeMachinesParts[0]}
                    max={activeMachinesParts[1] || activeMachinesParts[0] || 1}
                    color="#5b21b6"
                    track="#ede9fe"
                    label={`${activeMachinesParts[0]}/${activeMachinesParts[1]}`}
                    sub="Active"
                  />
                  <div className="client-bu-snap-aux">
                    <strong>{unitPanel.activeOperators}</strong>
                    <span>Operators</span>
                  </div>
                </div>
              </div>
              <div className="client-bu-snap-card">
                <p className="client-bu-snap-card-title">Target vs Actual</p>
                <MiniBars
                  data={[
                    { label: 'Target', value: targetNum, color: '#1e3a8a' },
                    { label: 'Actual', value: actualNum, color: '#7c3aed' },
                  ]}
                />
                <p className="client-bu-snap-foot">{unitPanel.targetVsActual}</p>
              </div>
              <div className="client-bu-snap-card">
                <p className="client-bu-snap-card-title">Cycle Time Trend (sec)</p>
                <MiniLine data={cycleTrend} color="#5b21b6" />
                <p className="client-bu-snap-foot">{`Average: ${unitPanel.cycleTime}`}</p>
              </div>
              <div className="client-bu-snap-card">
                <p className="client-bu-snap-card-title">Throughput (units/hr)</p>
                <MiniBars data={throughputTrend.map((d) => ({ ...d, color: '#1e3a8a' }))} />
                <p className="client-bu-snap-foot">{`Average: ${unitPanel.throughput}`}</p>
              </div>
        </div>
      </section>
      ) : null}

      <div className="client-side-panel-foot">
        <div className="client-bu-local">{`Local Time: ${localLine}`}</div>

        {onUnitViewChange ? (
        <div className="client-bu-side-viewnav" role="tablist" aria-label="Business unit pages">
          <button
            type="button"
            role="tab"
            aria-selected={unitView === 'safety'}
            className={`client-bu-side-viewbtn client-bu-side-viewbtn--safety${unitView === 'safety' ? ' is-active' : ''}`}
            onClick={() => onUnitViewChange('safety')}
          >
            SAFETY
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={unitView === 'security'}
            className={`client-bu-side-viewbtn client-bu-side-viewbtn--security${unitView === 'security' ? ' is-active' : ''}`}
            onClick={() => onUnitViewChange('security')}
          >
            SECURITY
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={unitView === 'systems'}
            className={`client-bu-side-viewbtn client-bu-side-viewbtn--systems${unitView === 'systems' ? ' is-active' : ''}`}
            onClick={() => onUnitViewChange('systems')}
          >
            SYSTEMS
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={unitView === 'jobs'}
            className={`client-bu-side-viewbtn client-bu-side-viewbtn--status${unitView === 'jobs' ? ' is-active' : ''}`}
            onClick={() => onUnitViewChange('jobs')}
          >
            STATUS
          </button>
          </div>
        ) : null}
      </div>
    </aside>
  )
}

/** Same top chrome as the jobs grid: BU chip, Harland logo, Daily / Weekly / Monthly (matches Harland unit screenshots). */
function UnitHarlandPanelHeader({ unitDigits, timeRange, onTimeRangeChange, rangeGroupLabel = 'Report range' }) {
  return (
    <header className="client-unit-jobs-head">
      <div className="client-unit-jobs-head-row1">
        <span className="client-unit-chip">{`BU ${unitDigits}`}</span>
        <div className="client-unit-brand">
          <img
            src={harlandMedicalSystemsLogo}
            alt="Harland Medical Systems"
            className="client-unit-brand-logo"
            decoding="async"
          />
        </div>
        <span className="client-unit-jobs-head-spacer" aria-hidden="true" />
      </div>
      <div className="client-unit-jobs-head-row2">
        <div className="client-unit-range" role="group" aria-label={rangeGroupLabel}>
          {(['daily', 'weekly', 'monthly']).map((r) => (
            <button
              key={r}
              type="button"
              className={timeRange === r ? 'is-active' : ''}
              aria-pressed={timeRange === r}
              onClick={() => onTimeRangeChange && onTimeRangeChange(r)}
            >
              {r === 'daily' ? 'Daily' : r === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}

function UnitJobsPanel({ user, unitLabel }) {
  const [jobTimeRange, setJobTimeRange] = useState('daily')
  const [selectedJob, setSelectedJob] = useState(null)
  const count = locationDrivenCardCount(user)
  const digits = digitsFromUnitLabel(unitLabel)
  const cards = unitJobsForPanel(unitLabel, count)
  const openJob = (card) => {
    const specs = MACHINE_SPECS[card.description] || null
    const stats = jobRuntimeStats(card.id, card.status)
    const serial = machineSerialFor(card.id, specs?.model || card.description)
    setSelectedJob({ ...card, specs, stats, serial })
  }
  return (
    <section className="client-unit-jobs-panel" aria-label={`BU ${digits} jobs`}>
      <UnitHarlandPanelHeader unitDigits={digits} timeRange={jobTimeRange} onTimeRangeChange={setJobTimeRange} />
      <div className="client-unit-jobs-grid">
        {cards.map((card) => {
          const stats = card.stats
          const tone = statusTone(card.status)
          const tv = formatTimeVariance(stats.timeVarianceDays)
          const shipLabel = SHIP_STATUS_LABEL[stats.shipStatus]
          const shipTone = SHIP_STATUS_TONE[stats.shipStatus]
          return (
            <article
              key={card.id}
              className="client-unit-job-card client-unit-job-card--clickable client-unit-job-card--v2"
              role="button"
              tabIndex={0}
              aria-label={`Open details for ${card.title}`}
              onClick={() => openJob(card)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openJob(card)
                }
              }}
            >
              <header className="client-unit-job-head">
                <h4>{card.title}</h4>
                <p>{card.description}</p>
              </header>

              <div className="client-unit-job-body">
                {card.machinePhotoSrc ? (
                  <div className="client-unit-job-photo">
                    <img
                      src={card.machinePhotoSrc}
                      alt={`Harland equipment for ${card.title}`}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ) : (
                  <div className="client-unit-job-photo client-unit-job-photo--empty" aria-hidden="true" />
                )}

                <div className="client-unit-job-tiles">
                  <div className="client-unit-job-tile">
                    <span className="client-unit-job-tile-label">Percent Complete</span>
                    <span className={`client-unit-job-tile-value tone-${tone}`}>{`${stats.completion}%`}</span>
                  </div>
                  <div className="client-unit-job-tile">
                    <span className="client-unit-job-tile-label">Ship Status</span>
                    <span className={`client-unit-job-ship tone-${shipTone}`}>
                      <ShipStatusIcon status={stats.shipStatus} />
                      <strong>{shipLabel}</strong>
                    </span>
                  </div>
                  <div className="client-unit-job-tile">
                    <span className="client-unit-job-tile-label">Time Variance</span>
                    <span className={`client-unit-job-variance tone-${tv.dir === 'up' ? 'good' : tv.dir === 'down' ? 'bad' : 'neutral'}`}>
                      <VarianceArrow direction={tv.dir} />
                      <strong>{tv.primary}</strong>
                    </span>
                    <span className="client-unit-job-variance-foot">{tv.label}</span>
                  </div>
                  <div className="client-unit-job-tile">
                    <span className="client-unit-job-tile-label">Days Remaining</span>
                    <span className="client-unit-job-days">
                      <CalendarIcon />
                      <strong>{stats.daysRemaining}</strong>
                    </span>
                    <span className="client-unit-job-days-foot">days left</span>
                  </div>
                </div>
              </div>

              <footer className="client-unit-job-foot">
                <span className="client-unit-job-foot-label">Build Progress</span>
                <div className={`client-unit-job-progress tone-${tone}`}>
                  <span style={{ width: `${stats.completion}%` }} />
                </div>
                <span className={`client-unit-job-foot-value tone-${tone}`}>{`${stats.completion}%`}</span>
              </footer>
            </article>
          )
        })}
        {selectedJob ? <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} /> : null}
      </div>
    </section>
  )
}

function BuildingSitePageView({
  site,
  zoneId,
  panelTab,
  now,
  onClose,
  onSelectZone,
  onSelectTab,
  user,
  unitView = 'jobs',
  onSelectUnitView,
}) {
  const b = site?.building
  if (!b) return null
  const activeZone = zoneId ? b.zones.find((z) => z.id === zoneId) : null
  const panelCopy = b.footerBlurb?.[panelTab] ?? '—'
  const localLine = formatSiteLocalTime(now, site.timeZone)

  return (
    <div className="client-building-page-root">
      <div
        className="client-building-dialog client-building-dialog--route-page"
        role="region"
        aria-labelledby="client-building-title"
        aria-describedby={b.omitTopbarLocal ? undefined : 'client-building-local'}
      >
        <div className="client-building-topbar">
          <div className="client-building-topbar-brand">
            <h2 id="client-building-title" className="client-building-name">
              {b.name}
            </h2>
            {!b.omitTopbarLocal ? (
              <p id="client-building-local" className="client-building-topbar-local">
                {localLine}
              </p>
            ) : null}
          </div>
          <button type="button" className="client-building-close" onClick={onClose} aria-label="Back to workspace overview">
            ×
          </button>
        </div>

        {activeZone ? (
          activeZone.machinery.unitPanel ? (
            (() => {
              const unitDigits = digitsFromUnitLabel(activeZone.machinery.unitPanel.unit.replace(/^BU\s*/i, ''))
              const unitCards = unitJobsForPanel(activeZone.machinery.unitPanel.unit.replace(/^BU\s*/i, ''), locationDrivenCardCount(user))
              const scopeId = `${site.id}-bu-${unitDigits}`
              const scopeName = `BU ${unitDigits} · ${b.name}`
              const view =
                unitView === 'safety' || unitView === 'security' || unitView === 'systems'
                  ? unitView
                  : 'jobs'
              const handleView = (next) => onSelectUnitView && onSelectUnitView(next)
              return (
                <div className="client-bu-view">
                  <UnitOverviewSide
                    unitPanel={activeZone.machinery.unitPanel}
                    statusLabel={activeZone.machinery.status}
                    cards={unitCards}
                    localLine={localLine}
                    digits={unitDigits}
                    scopeId={scopeId}
                    unitView={view}
                    onUnitViewChange={handleView}
                    onClose={() => onSelectZone(null)}
                  />
                  <div
                    className={`client-bu-image-wrap${
                      activeZone.machinery.unitPanel.powerBiEmbed?.reportUrl && view === 'systems'
                        ? ' client-bu-image-wrap--analytics'
                        : view === 'jobs' || view === 'systems'
                          ? ' client-bu-image-wrap--status'
                          : ' client-bu-image-wrap--hms-dash'
                    }`}
                  >
                    {view === 'safety' ? (
                      <SafetyPanel
                        scopeId={scopeId}
                        scopeName={scopeName}
                        localLine={localLine}
                        unitDigits={unitDigits}
                      />
                    ) : view === 'security' ? (
                      <SecurityPanel
                        scopeId={scopeId}
                        scopeName={scopeName}
                        localLine={localLine}
                        unitDigits={unitDigits}
                      />
                    ) : view === 'systems' ? (
                      <UnitSystemsPanel unitPanel={activeZone.machinery.unitPanel} />
                    ) : (
                      <UnitJobsPanel user={user} unitLabel={activeZone.machinery.unitPanel.unit.replace(/^BU\s*/i, '')} />
                    )}
                  </div>
                </div>
              )
            })()
          ) : (
            <div className="client-building-machinery">
              <button type="button" className="client-building-back" onClick={() => onSelectZone(null)}>
                ← Floor plan
              </button>
              <div className="client-building-machinery-head">
                <h3 className="client-building-machinery-title">{activeZone.machinery.title}</h3>
                <span
                  className={`client-building-machinery-badge ${buildingMachineryToneClass(activeZone.machinery.status)}`}
                >
                  {activeZone.machinery.status}
                </span>
              </div>
              <dl className="client-building-machinery-metrics">
                {activeZone.machinery.lines.map((row) => (
                  <div key={row.k} className="client-building-machinery-row">
                    <dt>{row.k}</dt>
                    <dd>{row.v}</dd>
                  </div>
                ))}
              </dl>
              {activeZone.machinery.foot ? (
                <p className="client-building-machinery-foot">{activeZone.machinery.foot}</p>
              ) : null}
            </div>
          )
        ) : (
          <>
            <div className="client-building-floor">
              <div className="client-building-floor-inner">
                <img
                  className="client-building-floor-img"
                  src={b.floorPlanSrc}
                  alt={`Floor plan — ${b.name}`}
                  draggable={false}
                  style={
                    b.floorPlanClipTopPct != null && Number(b.floorPlanClipTopPct) > 0
                      ? { clipPath: `inset(${Number(b.floorPlanClipTopPct)}% 0 0 0)` }
                      : undefined
                  }
                />
                {b.zones.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    className="client-building-zone"
                    style={{
                      left: `${z.pct.left}%`,
                      top: `${z.pct.top}%`,
                      width: `${z.pct.width}%`,
                      height: `${z.pct.height}%`,
                    }}
                    onClick={() => onSelectZone(z.id)}
                    aria-label={`Open machinery view: ${z.label}`}
                  >
                    <span className="client-building-zone-ring" aria-hidden="true" />
                    {z.omitMapLabel ? null : (
                      <span className="client-building-zone-label">{z.label}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <p className="client-building-hint">Tap a highlighted zone to open machinery / cell detail.</p>
          </>
        )}

        {!(activeZone && activeZone.machinery.unitPanel) ? (
          <div className="client-building-footer-panel">
            <div className="client-building-tablist" role="tablist" aria-label="Building summary">
              {BUILDING_FOOTER_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={panelTab === t.id}
                  className={`client-building-tab${panelTab === t.id ? ' client-building-tab--active' : ''}`}
                  onClick={() => onSelectTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="client-building-tab-panel" role="tabpanel">
              {panelTab === 'safety' ? (
                <SafetyPanel
                  scopeId={`${site.id}-bldg`}
                  scopeName={b.name}
                  localLine={localLine}
                />
              ) : panelTab === 'security' ? (
                <SecurityPanel
                  scopeId={`${site.id}-bldg`}
                  scopeName={b.name}
                  localLine={localLine}
                />
              ) : (
                <p className="client-building-tab-panel-text">{panelCopy}</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function BuildingSiteRouteShell({ site, now, onClose, user }) {
  const [buildingZoneId, setBuildingZoneId] = useState(null)
  const [buildingPanelTab, setBuildingPanelTab] = useState('safety')
  const [unitView, setUnitView] = useState('safety')

  const handleSelectZone = useCallback((next) => {
    setBuildingZoneId(next)
    setUnitView('safety')
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (buildingZoneId) handleSelectZone(null)
      else onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [buildingZoneId, handleSelectZone, onClose])

  return (
    <BuildingSitePageView
      site={site}
      zoneId={buildingZoneId}
      panelTab={buildingPanelTab}
      now={now}
      onClose={onClose}
      onSelectZone={handleSelectZone}
      onSelectTab={setBuildingPanelTab}
      user={user}
      unitView={unitView}
      onSelectUnitView={setUnitView}
    />
  )
}

function displayNameFromEmail(email) {
  const local = String(email).split('@')[0]?.replace(/[.+_]/g, ' ').trim() || 'there'
  return local
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function formatSessionDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return '—'
  }
}

const SUBSCRIPTION_PLAN_LABEL = {
  basic: 'Basic · $150/mo',
  plus: 'Plus · $200/mo',
  premium: 'Premium · $300/mo',
}

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: (
      <path d="M4 14h6V4H4v10zm0 6h6v-4H4v4zm8 0h10V10H12v10zm0-16v6h10V4H12z" />
    ),
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: (
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    ),
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: (
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11zm-8-6h6v2H10v-2zm0-4h8v2H10v-2z" />
    ),
  },
  {
    id: 'alerts',
    label: 'Alerts',
    dockLabel: 'Alerts',
    icon: (
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    ),
  },
  {
    id: 'safety',
    label: 'Safety & Security',
    dockLabel: 'Safety',
    avioraOnly: true,
    icon: (
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 5.99V18.9c-3.72-1.15-6.47-4.82-7-8.94h7V6.99z" />
    ),
  },
  {
    id: 'lines',
    label: 'Machine activity',
    dockLabel: 'Lines',
    icon: (
      <path d="M4 6h4v12H4V6zm6-2h4v14h-4V4zm6 4h4v10h-4V8zm6-4h4v14h-4V4z" />
    ),
  },
  {
    id: 'insights',
    label: 'Activities',
    dockLabel: 'Activity',
    icon: (
      <path d="M9 21v-8H5v8h4zm6 0V3H11v18h4zm6 0v-5h-4v5h4z" />
    ),
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    hideInDock: true,
    icon: (
      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
    ),
  },
  {
    id: 'users',
    label: 'Users',
    hideInDock: true,
    icon: (
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.84 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    ),
  },
  {
    id: 'account',
    label: 'Settings',
    dockLabel: 'Settings',
    icon: (
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.48.4l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.07.64-.07.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48-.4l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    ),
  },
]

const TAB_HEADINGS = {
  dashboard: { title: 'Overview', sub: null },
  locations: {
    title: 'Locations',
    sub: 'Global footprint — site leadership, local time, headcount, and efficiency by region.',
  },
  lines: {
    title: 'Machine activity',
    sub: 'Live status, OEE vs target, and operator context per asset.',
  },
  alerts: { title: 'Alerts', sub: 'Unacknowledged items and escalation status for your lines.' },
  safety: {
    title: 'Safety & Security',
    sub: 'Site safety index, patrol coverage, perimeter checks, and illustrated findings (demo).',
  },
  reports: { title: 'Reports', sub: 'Shift summaries, quality, and labor rollups — export or schedule digests.' },
  insights: {
    title: 'Activities',
    sub: 'BI-style views: efficiency, trend, and ship risk — with citations to the floor when data is live.',
  },
  maintenance: {
    title: 'Maintenance',
    sub: 'Work orders, PM schedules, and asset history — connect your CMMS when ready.',
  },
  users: { title: 'Users', sub: 'Team access, roles, and site assignments — wire to your IdP in production.' },
  account: { title: 'Settings', sub: 'Your workspace profile and subscription context.' },
}

const ONBOARD_KEY = (email) => `henry_onboard_${String(email).toLowerCase()}`

function loadOnboard(email) {
  try {
    const raw = sessionStorage.getItem(ONBOARD_KEY(email))
    if (!raw) return { done: [], hidden: false }
    const j = JSON.parse(raw)
    return {
      done: Array.isArray(j.done) ? j.done : [],
      hidden: Boolean(j.hidden),
    }
  } catch {
    return { done: [], hidden: false }
  }
}

function saveOnboard(email, state) {
  try {
    sessionStorage.setItem(
      ONBOARD_KEY(email),
      JSON.stringify({ done: state.done, hidden: state.hidden }),
    )
  } catch {
    /* private mode */
  }
}

/** Post–sign-in checklist: drives users into each major area of the workspace. */
const ONBOARD_STEPS = [
  {
    id: 'lines',
    title: 'Browse production lines',
    body: 'See running, idle, and down assets with SKU and OEE at a glance.',
    tab: 'lines',
  },
  {
    id: 'alerts',
    title: 'Skim AI alerts',
    body: 'See how high-priority line issues surface with severity and timestamps.',
    tab: 'alerts',
  },
  {
    id: 'reports',
    title: 'Open a shift report',
    body: 'Review how HENRY rolls up throughput, quality, and labor for a shift.',
    tab: 'reports',
  },
  {
    id: 'insights',
    title: 'Open Activities',
    body: 'Correlations and forecasts show how metrics connect across cells.',
    tab: 'insights',
  },
  {
    id: 'export',
    title: 'Try a quick export',
    body: 'Kick off a snapshot export from the dashboard (demo — no file yet).',
    tab: 'dashboard',
    action: 'export',
  },
]

const BOOK_DEMO_URL = 'https://larrya-dostiglobal61.zohobookings.com/#/yourbusinessname'

function onboardingPrimaryGoalLabel(value) {
  const labels = {
    'improve-efficiency': 'improve efficiency',
    'reduce-downtime': 'reduce downtime',
    'improve-safety': 'improve safety',
    'increase-visibility': 'increase visibility',
    'reduce-costs': 'reduce costs',
  }
  return labels[value] || null
}

function onboardingInsightFrequencyLabel(value) {
  const labels = {
    hourly: 'hourly',
    'real-time': 'real-time',
    daily: 'daily',
    weekly: 'weekly',
  }
  return labels[value] || null
}

function buildMyHenryRecommendations(onboarding) {
  const profile = onboarding?.profile || {}
  const setup = onboarding?.setup || {}
  const outcomes = onboarding?.outcomes || {}
  const lines = []

  const industry = String(profile.industry || '').trim()
  const monitorAreas = Array.isArray(setup.monitorAreas) ? setup.monitorAreas : []
  const setupStructure = String(setup.setupStructure || '').trim()
  const goalLabel = onboardingPrimaryGoalLabel(outcomes.primaryGoal)
  const frequencyLabel = onboardingInsightFrequencyLabel(outcomes.insightFrequency)

  if (industry) {
    lines.push(`Based on your ${industry} profile, teams typically start with uptime and cycle-time tracking.`)
  } else {
    lines.push('Companies like yours typically begin with machine uptime and output trend tracking.')
  }

  if (monitorAreas.length) {
    lines.push(`Recommended first modules: ${monitorAreas.join(', ')}.`)
  } else {
    lines.push('Recommended first modules: production and downtime monitoring.')
  }

  if (setupStructure === 'multi-units-lines') {
    lines.push('Your setup suggests a multi-unit operation. Start with plant-level and line-level dashboards.')
  }

  if (goalLabel) {
    lines.push(`Your primary goal is to ${goalLabel}; initial KPI tiles will prioritize that outcome.`)
  }
  if (frequencyLabel) {
    lines.push(`Insights cadence is set to ${frequencyLabel}; digest scheduling can follow this preference.`)
  }
  return lines.slice(0, 4)
}

function FootprintSitesSection({
  workspaceSites,
  filteredGlobalSites,
  company,
  footprintBlurb,
  searchQ,
  nowTick,
  onOpenBuilding,
  topAlerts,
  hideSnapshotBranding = false,
  onOpenAvioraProperty,
  footprintLayout = 'classic',
}) {
  const isWorkspaceSingle = workspaceSites.length === 1
  const useDashHero = Boolean(topAlerts) && isWorkspaceSingle

  const siteList = (
    <>
      {filteredGlobalSites.length === 0 && searchQ.trim() ? (
        <p className="client-sites-empty" role="status">
          No sites match &ldquo;{searchQ.trim()}&rdquo;. Clear the search bar to see all regions.
        </p>
      ) : null}
      {filteredGlobalSites.map((site) => {
        const snap = SITE_SNAPSHOT[site.id] || {}
        if (footprintLayout === 'harland') {
          return (
            <HarlandFootprintSiteCard
              key={site.id}
              site={site}
              snap={snap}
              nowTick={nowTick}
              onOpenBuilding={onOpenBuilding}
              onOpenAvioraProperty={onOpenAvioraProperty}
            />
          )
        }
        const light = snap.light ?? 'off'
        const fc = String(site.flagCode || '').toLowerCase()
        const q = snap.quality
        const ot = snap.onTime
        const esc = snap.escalations
        const escCountForTone =
          site.fpEscalationsCount != null ? Number(site.fpEscalationsCount) : esc
        const escTone =
          Number.isFinite(escCountForTone) && escCountForTone > 0 ? 'warn' : 'good'
        const eff = site.efficiency != null ? Math.round(Number(site.efficiency)) : 0
        const hasEffDonut = site.efficiency != null && !(site.id === 'my' && light === 'red')
        const indiaTrend = site.id === 'in' ? [42, 55, 48, 62, 58, 70, 65] : null
        return (
          <article key={site.id} className="client-site-card client-site-card--fp">
            <div className="client-site-fp-statusbar">
              <div className="client-site-fp-status-left">
                <SiteTrafficLight active={light} label={snap.status} />
                <span className="client-site-fp-status-word">
                  {site.operationalLabel ?? siteOperationalLabel(light)}
                </span>
              </div>
              <span className="client-site-kpi-chip client-site-kpi-chip--fp">
                {site.primaryChip ??
                  (snap.downtimeMins != null ? `${snap.downtimeMins}m downtime` : 'No active assets')}
              </span>
            </div>
            <button
              type="button"
              className="client-site-card-main"
              onClick={() => {
                if (site.avioraPropertyId && onOpenAvioraProperty) {
                  onOpenAvioraProperty(site.avioraPropertyId)
                  return
                }
                onOpenBuilding(site)
              }}
              aria-label={
                site.avioraPropertyId
                  ? `Open property dashboard for ${site.country}`
                  : `Open building view for ${site.country}`
              }
            >
              <div className="client-site-fp-ident">
                <div
                  className={`client-site-fp-photo${site.avioraPropertyId ? ' client-site-fp-photo--tight-portrait' : ''}`}
                  aria-hidden="true"
                >
                  {site.leadPhoto ? (
                    <img
                      src={site.leadPhoto}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={site.leadPhotoFocus ? { objectPosition: site.leadPhotoFocus } : undefined}
                    />
                  ) : (
                    <span className="client-site-fp-photo-ph">{leadInitials(site.leadName)}</span>
                  )}
                </div>
                <div className="client-site-fp-ident-main">
                  <div className="client-site-title-row">
                    <h3 className="client-site-country">{site.country}</h3>
                    <div className="client-site-flag" title={site.country}>
                      <span className="client-site-flag-emoji" aria-hidden="true">
                        {site.flagEmoji || '🏳️'}
                      </span>
                      <img
                        className="client-site-flag-img"
                        src={`https://flagcdn.com/w80/${fc}.png`}
                        srcSet={`https://flagcdn.com/w160/${fc}.png 2x`}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                  <p className="client-site-fp-lead">
                    <span className="client-site-fp-lead-tag">Lead</span>
                    <strong>{site.leadName}</strong>
                  </p>
                </div>
              </div>

              <div className="client-site-fp-kpis">
                <div className="client-site-fp-kpi">
                  <SiteFootprintPeopleIcon />
                  <div className="client-site-fp-kpi-text">
                    <strong>{site.employees != null ? site.employees : '—'}</strong>
                    <span>Employees</span>
                  </div>
                </div>
                <div className="client-site-fp-kpi">
                  <SiteFootprintClockIcon />
                  <div className="client-site-fp-kpi-text">
                    <strong>{formatSiteShortTime(nowTick, site.timeZone)}</strong>
                    <span>Local time</span>
                  </div>
                </div>
                <div className="client-site-fp-kpi">
                  {snap.downtimeMins != null || site.footprintThirdKpiStrong ? (
                    <SiteFootprintPulseIcon />
                  ) : (
                    <SiteFootprintNoAssetsIcon />
                  )}
                  <div className="client-site-fp-kpi-text">
                    <strong>
                      {snap.downtimeMins != null
                        ? `${snap.downtimeMins}m`
                        : (site.footprintThirdKpiStrong ?? '—')}
                    </strong>
                    <span>{site.footprintThirdKpiCaption ?? 'Downtime'}</span>
                  </div>
                </div>
                <div className="client-site-fp-kpi client-site-fp-kpi--donut">
                  <span className="client-site-fp-kpi-cap">Efficiency</span>
                  {hasEffDonut ? (
                    <MiniDonut
                      value={eff}
                      max={100}
                      color="#7c3aed"
                      track="#ede9fe"
                      size={76}
                      label={`${eff}%`}
                    />
                  ) : (
                    <div className="client-site-fp-donut-ph" aria-hidden="true">
                      <span>—</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="client-site-fp-bars">
                <div className="client-site-fp-bar">
                  <span className="client-site-fp-bar-label">Quality</span>
                  <span className="client-site-fp-bar-pct">{q != null ? `${q}%` : 'N/A'}</span>
                  <div className="client-site-fp-bar-track" aria-hidden="true">
                    {q != null ? (
                      <span className="client-site-fp-bar-fill" style={{ width: `${Math.min(100, q)}%` }} />
                    ) : null}
                  </div>
                </div>
                <div className="client-site-fp-bar">
                  <span className="client-site-fp-bar-label">On-time</span>
                  <span className="client-site-fp-bar-pct">{ot != null ? `${ot}%` : 'N/A'}</span>
                  <div className="client-site-fp-bar-track" aria-hidden="true">
                    {ot != null ? (
                      <span className="client-site-fp-bar-fill" style={{ width: `${Math.min(100, ot)}%` }} />
                    ) : null}
                  </div>
                </div>
                <div className={`client-site-fp-esc client-site-fp-esc--${escTone}`}>
                  <span>{site.fpEscalationsLabel ?? 'Escalations (24h)'}</span>
                  <strong>{site.fpEscalationsCount ?? (esc != null ? esc : '—')}</strong>
                </div>
              </div>

              {indiaTrend ? (
                <div className="client-site-fp-trend">
                  <span className="client-site-fp-trend-cap">Efficiency trend (7d)</span>
                  <div className="client-site-fp-trend-bars" aria-hidden="true">
                    {indiaTrend.map((h, i) => (
                      <span key={i} className="client-site-fp-trend-bar" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              ) : null}

              {site.id === 'my' && light === 'red' ? (
                <p className="client-site-fp-inactive-note" role="status">
                  <span aria-hidden="true">ⓘ</span> Site inactive — no active assets.
                </p>
              ) : null}

              <p className="client-site-address">
                <span className="client-site-address-label">Address</span>
                {site.address}
              </p>
              <span className="client-site-open-hint">{site.openHint ?? 'Building view →'}</span>
            </button>
            {site.phoneTel ? (
              <a className="client-site-phone" href={`tel:${site.phoneTel}`}>
                <SitePhoneIcon />
                <span>{site.phoneDisplay}</span>
              </a>
            ) : (
              <span className="client-site-phone client-site-phone--static">
                <SitePhoneIcon />
                <span>{site.phoneDisplay}</span>
              </span>
            )}
          </article>
        )
      })}
    </>
  )

  if (useDashHero) {
    return (
      <section
        className="client-sites-section client-sites-section--top client-sites-section--single-site client-sites-section--single-dash"
        aria-labelledby="global-sites-title"
      >
        <div className="client-sites-dash-hero">
          <div className="client-sites-dash-hero-strip">
            <div className="client-sites-dash-hero-intro">
              {!hideSnapshotBranding ? (
                <div className="client-sites-snapshot-solo" aria-hidden="true">
                  <SnapshotWordmark compact />
                </div>
              ) : null}
              <div className="client-sites-section-head-copy client-sites-dash-hero-copy">
                <h2 id="global-sites-title" className="client-sites-section-title">
                  {company}
                </h2>
                <p className="client-sites-section-sub">{footprintBlurb}</p>
              </div>
            </div>
          </div>
          <div className="client-sites-dash-hero-body">
            <div className="client-sites-dash-hero-alerts">{topAlerts}</div>
            <div className="client-sites-dash-hero-cards">
              <div
                className={`client-sites-grid${
                  footprintLayout === 'harland' ? ' client-sites-grid--harland-fp' : ''
                }`}
              >
                {siteList}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const sectionMods = [`client-sites-section`, `client-sites-section--top`]
  if (isWorkspaceSingle) sectionMods.push(`client-sites-section--single-site`)

  return (
    <section className={sectionMods.join(' ')} aria-labelledby="global-sites-title">
      <div
        className={`client-sites-section-head${
          isWorkspaceSingle ? ' client-sites-section-head--single' : ''
        }`}
      >
        {isWorkspaceSingle ? (
          hideSnapshotBranding ? null : (
            <div className="client-sites-snapshot-solo" aria-hidden="true">
              <SnapshotWordmark compact />
            </div>
          )
        ) : (
          hideSnapshotBranding ? null : (
            <div className="client-sites-snapshot client-sites-snapshot--left" aria-hidden="true">
              <SnapshotWordmark />
            </div>
          )
        )}
        <div className="client-sites-section-head-copy">
          <h2 id="global-sites-title" className="client-sites-section-title">
            {company}
          </h2>
          <p className="client-sites-section-sub">{footprintBlurb}</p>
        </div>
        {isWorkspaceSingle || hideSnapshotBranding ? null : (
          <div className="client-sites-snapshot client-sites-snapshot--right" aria-hidden="true">
            <SnapshotWordmark />
          </div>
        )}
      </div>
      <div
        className={`client-sites-grid${footprintLayout === 'harland' ? ' client-sites-grid--harland-fp' : ''}`}
      >
        {siteList}
      </div>
    </section>
  )
}

function OverviewAiAlertsAside({
  ctx,
  visibleAlerts,
  alertFilter,
  onFilterChange,
  onAcknowledge,
  ackedIds,
  onViewAllAlerts,
  variant = 'ribbon',
  mirrorSite = null,
  nowTick = null,
}) {
  const asideClass =
    variant === 'inset'
      ? 'client-overview-ai-alerts client-overview-ai-alerts--inset client-overview-ai-alerts--inset-site-mirror'
      : 'client-overview-ai-alerts client-overview-ai-alerts--ribbon'

  if (variant === 'inset' && mirrorSite) {
    const clock = nowTick ?? new Date()
    const totalAlerts = Array.isArray(ctx.alerts) ? ctx.alerts.length : 0
    const unacked = visibleAlerts.filter((a) => !ackedIds.has(a.id))
    const highN = unacked.filter((a) => a.severity === 'high').length
    const medN = unacked.filter((a) => a.severity === 'med').length
    const lowN = unacked.filter((a) => a.severity === 'low').length
    const light = highN > 0 ? 'red' : medN > 0 ? 'amber' : 'green'
    const alertStatusWord = highN > 0 ? 'ATTENTION' : medN > 0 ? 'MONITORING' : 'OPERATIONAL'
    const healthPct = Math.max(
      36,
      Math.min(100, 100 - highN * 14 - medN * 6 - lowN * 2),
    )
    const ackedCount = ackedIds.size
    const reviewedPct =
      totalAlerts > 0 ? Math.round((ackedCount / Math.max(1, totalAlerts)) * 100) : 100
    const mixPct = unacked.length ? Math.round((lowN / unacked.length) * 100) : 0

    return (
      <aside className={asideClass} aria-labelledby="overview-ai-alerts-inset-h">
        <article className="client-site-card client-site-card--fp client-site-card--overview-alerts-inset">
          <div className="client-site-fp-statusbar">
            <div className="client-site-fp-status-left">
              <SiteTrafficLight active={light} label={alertStatusWord} />
              <span className="client-site-fp-status-word">{alertStatusWord}</span>
            </div>
            <span className="client-site-kpi-chip client-site-kpi-chip--fp">
              {unacked.length ? `${unacked.length} open` : 'Queue clear'}
            </span>
          </div>
          <button
            type="button"
            className="client-site-card-main"
            onClick={onViewAllAlerts}
            aria-label="Open full alerts workspace"
          >
            <div className="client-site-fp-ident">
              <div className="client-site-fp-photo" aria-hidden="true">
                <span className="client-site-fp-photo-ph client-site-fp-photo-ph--ai">AI</span>
              </div>
              <div className="client-site-fp-ident-main">
                <div className="client-site-title-row">
                  <h2 id="overview-ai-alerts-inset-h" className="client-site-country">
                    AI alerts
                  </h2>
                  <div className="client-site-flag" aria-hidden="true" title="Intelligence layer">
                    <span className="client-site-flag-emoji">✦</span>
                  </div>
                </div>
                <p className="client-site-fp-lead">
                  <span className="client-site-fp-lead-tag">Lead</span>
                  <strong>HENRY AI</strong>
                </p>
              </div>
            </div>

            <div className="client-site-fp-kpis">
              <div className="client-site-fp-kpi">
                <SiteFootprintPeopleIcon />
                <div className="client-site-fp-kpi-text">
                  <strong>{unacked.length}</strong>
                  <span>Open</span>
                </div>
              </div>
              <div className="client-site-fp-kpi">
                <SiteFootprintClockIcon />
                <div className="client-site-fp-kpi-text">
                  <strong>{formatSiteShortTime(clock, mirrorSite.timeZone)}</strong>
                  <span>Local time</span>
                </div>
              </div>
              <div className="client-site-fp-kpi">
                <SiteFootprintPulseIcon />
                <div className="client-site-fp-kpi-text">
                  <strong>{highN}</strong>
                  <span>High</span>
                </div>
              </div>
              <div className="client-site-fp-kpi client-site-fp-kpi--donut">
                <span className="client-site-fp-kpi-cap">Health</span>
                <MiniDonut
                  value={healthPct}
                  max={100}
                  color="#7c3aed"
                  track="#ede9fe"
                  size={76}
                  label={`${healthPct}%`}
                />
              </div>
            </div>

            <div className="client-site-fp-bars">
              <div className="client-site-fp-bar">
                <span className="client-site-fp-bar-label">Reviewed</span>
                <span className="client-site-fp-bar-pct">{reviewedPct}%</span>
                <div className="client-site-fp-bar-track" aria-hidden="true">
                  <span className="client-site-fp-bar-fill" style={{ width: `${Math.min(100, reviewedPct)}%` }} />
                </div>
              </div>
              <div className="client-site-fp-bar">
                <span className="client-site-fp-bar-label">Low share</span>
                <span className="client-site-fp-bar-pct">{Math.max(6, mixPct)}%</span>
                <div className="client-site-fp-bar-track" aria-hidden="true">
                  <span className="client-site-fp-bar-fill" style={{ width: `${Math.min(100, Math.max(6, mixPct))}%` }} />
                </div>
              </div>
              <div className={`client-site-fp-esc client-site-fp-esc--${highN > 0 ? 'warn' : 'good'}`}>
                <span>Escalations (24h)</span>
                <strong>{highN}</strong>
              </div>
            </div>

            <p className="client-site-address">
              <span className="client-site-address-label">Watch window</span>
              {ctx.alertsLead}
            </p>
            <span className="client-site-open-hint">All alerts →</span>
          </button>

          {visibleAlerts.length ? (
            <ul className="client-site-fp-inset-ack-list" aria-label="Acknowledge alerts">
              {visibleAlerts.slice(0, 4).map((a) => (
                <li key={a.id} className="client-site-fp-inset-ack-row">
                  <span className={`client-sev client-sev--${a.severity}`}>
                    {a.severity === 'high' ? 'High' : a.severity === 'med' ? 'Med' : 'Low'}
                  </span>
                  <div className="client-site-fp-inset-ack-body">
                    <strong>{a.title}</strong>
                    <span className="client-site-fp-inset-ack-when">{a.when}</span>
                  </div>
                  <button type="button" className="client-alert-ack" onClick={() => onAcknowledge(a.id)}>
                    Ack
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="client-alerts-empty client-alerts-empty--overview client-site-fp-inset-empty">
              {ackedIds.size > 0
                ? 'Nothing in this filter — open Alerts for the full list.'
                : 'No alerts match this filter.'}
            </p>
          )}
          <p className="client-overview-ai-foot client-overview-ai-foot--inset-mirror">{ctx.alertsFoot}</p>
        </article>
      </aside>
    )
  }

  return (
    <aside className={asideClass} aria-labelledby="overview-ai-alerts-h">
      <div className="client-overview-ai-alerts-top">
        <h2 id="overview-ai-alerts-h" className="client-overview-ai-title">
          AI alerts
        </h2>
        <button type="button" className="client-overview-ai-see-all" onClick={onViewAllAlerts}>
          All alerts →
        </button>
      </div>
      <p className="client-overview-ai-lead">{ctx.alertsLead}</p>
      <div className="client-filter-row client-filter-row--compact" role="toolbar" aria-label="Filter alerts">
        {(['all', 'high', 'med', 'low']).map((f) => (
          <button
            key={f}
            type="button"
            className={`client-filter-chip${alertFilter === f ? ' active' : ''}`}
            onClick={() => onFilterChange(f)}
          >
            {f === 'all' ? 'All' : f === 'high' ? 'High' : f === 'med' ? 'Med' : 'Low'}
          </button>
        ))}
      </div>
      <ul className="client-alert-list client-alert-list--overview">
        {visibleAlerts.map((a) => (
          <li key={a.id} className="client-alert-row client-alert-row--overview">
            <span className={`client-sev client-sev--${a.severity}`}>
              {a.severity === 'high' ? 'High' : a.severity === 'med' ? 'Med' : 'Low'}
            </span>
            <div className="client-alert-body">
              <strong>{a.title}</strong>
              <p>{a.detail}</p>
              <span className="client-alert-when">{a.when}</span>
            </div>
            <button type="button" className="client-alert-ack" onClick={() => onAcknowledge(a.id)}>
              Ack
            </button>
          </li>
        ))}
      </ul>
      {visibleAlerts.length === 0 ? (
        <p className="client-alerts-empty client-alerts-empty--overview">
          {ackedIds.size > 0
            ? 'Nothing in this filter — try another severity or open Alerts for the full list.'
            : 'No alerts match this filter.'}
        </p>
      ) : null}
      <p className="client-overview-ai-foot">{ctx.alertsFoot}</p>
    </aside>
  )
}

export default function ClientDashboard({ user, onSignOut }) {
  const location = useLocation()
  const navigate = useNavigate()

  const [tab, setTab] = useState('dashboard')
  const [toast, setToast] = useState('')
  const [nowTick, setNowTick] = useState(() => new Date())
  const [onboard, setOnboard] = useState(() => loadOnboard(user.email))
  const [priorities, setPriorities] = useState(() => TODAY_PRIORITIES.map((p) => ({ ...p })))
  const [alertFilter, setAlertFilter] = useState('all')
  const [ackedIds, setAckedIds] = useState(() => new Set())
  const [reportRange, setReportRange] = useState('7d')
  const [insightQuestion, setInsightQuestion] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const notifWrapRef = useRef(null)
  const chartUid = useId().replace(/:/g, '')
  const activitiesVisId = useId().replace(/:/g, '')
  const workspaceSites = useMemo(() => workspaceSitesForUser(user), [user])

  const pathnameForMatch =
    typeof location.pathname === 'string'
      ? location.pathname.replace(/\/+$/, '') || '/'
      : '/'

  const routeBuildingSiteId =
    matchPath({ path: '/building/:siteId', end: true }, pathnameForMatch)?.params?.siteId ??
    matchPath({ path: 'building/:siteId', end: true }, pathnameForMatch)?.params?.siteId ??
    null

  const routeAvioraPropertyId =
    matchPath({ path: '/property/:propertyId', end: true }, pathnameForMatch)?.params?.propertyId ??
    matchPath({ path: 'property/:propertyId', end: true }, pathnameForMatch)?.params?.propertyId ??
    null

  const buildingSiteOnRoute =
    routeBuildingSiteId != null ? workspaceSites.find((s) => s.id === routeBuildingSiteId) ?? null : null

  const buildingRouteRequested = Boolean(routeBuildingSiteId)
  const invalidBuildingRoute = buildingRouteRequested && !buildingSiteOnRoute?.building
  const buildingPageActive = Boolean(buildingRouteRequested && buildingSiteOnRoute?.building)

  const openBuilding = (site) => {
    navigate(`/building/${encodeURIComponent(site.id)}`)
  }

  const closeBuilding = useCallback(() => {
    navigate('/')
  }, [navigate])

  useEffect(() => {
    if (!notifOpen) return
    const close = (e) => {
      if (notifWrapRef.current && !notifWrapRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [notifOpen])

  useEffect(() => {
    const t = setInterval(() => setNowTick(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const t = setTimeout(() => setToast(''), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const presetKey = resolveDashboardPresetKey(user)
  const navItemsForPreset = useMemo(
    () => NAV_ITEMS.filter((item) => !item.avioraOnly || presetKey === 'aviora'),
    [presetKey],
  )
  const effectiveTab = presetKey !== 'aviora' && 'safety' === tab ? 'dashboard' : tab

  const avioraPropertyRouteRequested = Boolean(routeAvioraPropertyId)
  const invalidAvioraPropertyRoute =
    avioraPropertyRouteRequested &&
    (presetKey !== 'aviora' || !isAvioraPropertyDetailId(routeAvioraPropertyId))
  const avioraPropertyPageActive =
    presetKey === 'aviora' &&
    avioraPropertyRouteRequested &&
    isAvioraPropertyDetailId(routeAvioraPropertyId)
  const useHenry1InsetAiAlerts = presetKey === 'henry1'
  const ctx = getDashboardContext(presetKey)
  const myHenryRecommendations = buildMyHenryRecommendations(user?.onboarding)
  const tenantLockup = ctx.clientBrand?.mode === 'tenant-lockup' ? ctx.clientBrand : null
  const activeProductTitles = titlesForProductIds(user.products)
  const greetName = displayNameFromEmail(user.email)
  const heading = TAB_HEADINGS[effectiveTab] || TAB_HEADINGS.dashboard
  const mainTitle = heading.title ?? user.company
  const mainSub =
    effectiveTab === 'locations' && ctx.locationsLeadSub
      ? ctx.locationsLeadSub
      : heading.sub ?? ctx.sub
  const footprintBlurb =
    ctx.footprintSub ||
    'Global footprint — site leadership, local time, headcount, and efficiency by region.'
  const clockLine = nowTick.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const avatarLetter = (user.email?.[0] || '?').toUpperCase()

  const runQuickAction = (id) => {
    const messages = {
      export: 'Preparing snapshot export (demo)…',
      digest: 'Digest scheduler opens here in production.',
      runbook: 'Runbook & on-call (demo) — link your Confluence or PDF.',
    }
    setToast(messages[id] || 'Done.')
  }

  const markOnboardStep = (id) => {
    setOnboard((prev) => {
      if (prev.done.includes(id)) return prev
      const next = { ...prev, done: [...prev.done, id] }
      saveOnboard(user.email, next)
      return next
    })
  }

  const dismissOnboard = () => {
    setOnboard((prev) => {
      const next = { ...prev, hidden: true }
      saveOnboard(user.email, next)
      return next
    })
  }

  const runOnboardStep = (step) => {
    setTab(step.tab)
    if (step.action === 'export') {
      runQuickAction('export')
    }
    markOnboardStep(step.id)
  }

  const onboardAllDone = ONBOARD_STEPS.every((s) => onboard.done.includes(s.id))

  const visibleAlerts = ctx.alerts.filter((a) => {
    if (ackedIds.has(a.id)) return false
    if (alertFilter !== 'all' && a.severity !== alertFilter) return false
    const q = searchQ.trim().toLowerCase()
    if (q) {
      const blob = `${a.title} ${a.detail} ${a.when}`.toLowerCase()
      if (!blob.includes(q)) return false
    }
    return true
  })

  const acknowledgeAlert = (id) => {
    setAckedIds((prev) => new Set([...prev, id]))
    setToast('Alert acknowledged (demo) — wire to Slack, CMMS, or MES in production.')
  }

  const togglePriority = (id) => {
    setPriorities((rows) => rows.map((r) => (r.id === id ? { ...r, done: !r.done } : r)))
  }

  const runInsightAsk = () => {
    const q = insightQuestion.trim()
    if (!q) {
      setToast('Ask a question about throughput, scrap, or downtime.')
      return
    }
    setToast('HENRY would answer with cited machine events (demo). Connect your LLM + data lake when ready.')
    setInsightQuestion('')
  }

  const filteredLines = PRODUCTION_LINES.filter((line) => {
    const q = searchQ.trim().toLowerCase()
    if (!q) return true
    return (
      line.name.toLowerCase().includes(q) ||
      line.sku.toLowerCase().includes(q) ||
      line.id.toLowerCase().includes(q)
    )
  })

  const filteredGlobalSites = useMemo(() => {
    const q = searchQ.trim().toLowerCase()
    if (!q) return workspaceSites
    return workspaceSites.filter((site) => {
      const snap = SITE_SNAPSHOT[site.id]
      if (site.country.toLowerCase().includes(q)) return true
      if (site.id.toLowerCase().includes(q)) return true
      if (site.flagCode && site.flagCode.toLowerCase().includes(q)) return true
      if (site.leadName.toLowerCase().includes(q)) return true
      if (site.leadRole.toLowerCase().includes(q)) return true
      if (site.address.toLowerCase().includes(q)) return true
      if (snap?.status && snap.status.toLowerCase().includes(q)) return true
      if (q === 'green' && snap?.light === 'green') return true
      if ((q === 'amber' || q === 'yellow') && snap?.light === 'amber') return true
      if (q === 'red' && snap?.light === 'red') return true
      if ((q === 'planned' || q === 'off') && snap?.light === 'off') return true
      if (q === 'pilot' && snap?.status?.toLowerCase() === 'pilot') return true
      return false
    })
  }, [searchQ, workspaceSites])

  const runWorkspaceSearch = () => {
    const raw = searchQ.trim()
    const q = raw.toLowerCase()
    if (!raw) {
      setToast('Search sites, lines, SKUs, or try: locations, alerts, activities, settings.')
      return
    }
    if (/\b(alert|alerts)\b/i.test(raw)) {
      setTab('alerts')
      setToast('Switched to Alerts — results match your search below.')
      return
    }
    if (/\b(locations?|sites?|countries|footprint)\b/i.test(raw)) {
      setTab('locations')
      setToast('Switched to Locations.')
      return
    }
    if (/\b(lines?|sku|skus|lot|lots)\b/i.test(raw) || /^l\d/i.test(q)) {
      setTab('lines')
      setToast('Switched to machine activity — list filters as you type.')
      return
    }
    if (/\breports?\b/i.test(raw)) {
      setTab('reports')
      setToast('Switched to Reports.')
      return
    }
    if (/\b(maintenance|pm|work\s*orders?)\b/i.test(raw)) {
      setTab('maintenance')
      setToast('Switched to Maintenance.')
      return
    }
    if (/\b(users?|team|people|roles?)\b/i.test(raw)) {
      setTab('users')
      setToast('Switched to Users.')
      return
    }
    if (/\b(activities?|activity|insights?)\b/i.test(raw)) {
      setTab('insights')
      setToast('Switched to Activities.')
      return
    }
    if (/\b(settings?|account|profile)\b/i.test(raw)) {
      setTab('account')
      setToast('Switched to Settings.')
      return
    }
    if (/\b(safety|security|perimeter|egress)\b/i.test(raw) && presetKey === 'aviora') {
      setTab('safety')
      setToast('Switched to Safety & Security.')
      return
    }
    if (
      (effectiveTab === 'dashboard' || effectiveTab === 'locations') &&
      filteredGlobalSites.length === 0
    ) {
      setToast(`No sites match “${raw}”. Try another term or clear search.`)
      return
    }
    if (effectiveTab === 'lines' && filteredLines.length === 0) {
      setToast(`No lines match “${raw}”.`)
      return
    }
    if (effectiveTab === 'alerts' && visibleAlerts.length === 0) {
      setToast(`No alerts match “${raw}”. Try another word or clear search.`)
      return
    }
    setToast(
      effectiveTab === 'dashboard' || effectiveTab === 'locations'
        ? `${filteredGlobalSites.length} site(s) match in the grid below.`
        : `Showing matches for “${raw}”.`,
    )
  }

  return (
    <div className="client-app">
      {toast ? (
        <div className="client-toast" role="status">
          {toast}
        </div>
      ) : null}
      <header className="client-topbar">
        <div
          className="client-brand"
          aria-label={tenantLockup ? tenantLockup.logoAlt : 'HENRY client workspace'}
        >
          {tenantLockup ? (
            <span className="client-logo-lockup client-logo-lockup--tenant">
              <img
                src={tenantLockup.logoSrc}
                alt={tenantLockup.logoAlt}
                className="client-logo-mark client-logo-mark--tenant"
                width={320}
                height={120}
                decoding="async"
              />
            </span>
          ) : (
            <>
              <span className="client-logo-lockup">
                <img src={henryLogo} alt="" className="client-logo-mark" width={160} height={160} decoding="async" />
                <span className="client-logo-text-col">
                  <LogoSpreadLine className="client-logo-word" text="HENRY" />
                  <LogoSpreadLine className="client-logo-word-sub" text="TECHNOLOGIES" />
                </span>
              </span>
              <span className="client-logo-sub">Client workspace</span>
              {user?.onboarding?.scale?.employeeBand ? (
                <span className="client-onboarding-capsule" title="From your setup questionnaire">
                  {user.onboarding.organization?.displayName || user.company} ·{' '}
                  {user.onboarding.scale.employeeBand === '1000+'
                    ? '1,000+ employees'
                    : user.onboarding.scale.employeeBand.replace(/-/g, '–')}{' '}
                  employees
                  {user.onboarding.scale.siteCount
                    ? ` · ${user.onboarding.scale.siteCount === '1' ? '1 site' : `${user.onboarding.scale.siteCount} sites`}`
                    : null}
                </span>
              ) : null}
            </>
          )}
        </div>
        <div className="client-topbar-search" role="search">
          <label htmlFor="ws-search" className="client-sr-only">
            Search workspace
          </label>
          <input
            id="ws-search"
            type="search"
            className="client-search-input"
            placeholder="Search lines, SKUs, lots…"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                runWorkspaceSearch()
              }
            }}
          />
        </div>
        <div className="client-topbar-mid">
          <div className="client-live-pill" title="Demo live indicator">
            <span className="client-live-dot" aria-hidden="true" />
            Live
          </div>
          <time className="client-clock" dateTime={nowTick.toISOString()}>
            {clockLine}
          </time>
        </div>
        <div className="client-notif-wrap" ref={notifWrapRef}>
          <button
            type="button"
            className="client-notif-trigger"
            aria-expanded={notifOpen}
            aria-haspopup="true"
            onClick={() => setNotifOpen((o) => !o)}
          >
            <svg className="client-notif-bell" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
              />
            </svg>
            <span className="client-notif-badge">{NOTIFICATION_ITEMS.length}</span>
            <span className="client-sr-only">Notifications</span>
          </button>
          {notifOpen ? (
            <div className="client-notif-dropdown" role="menu">
              <p className="client-notif-dropdown-title">Notifications</p>
              <ul className="client-notif-list">
                {NOTIFICATION_ITEMS.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      className="client-notif-item"
                      role="menuitem"
                      onClick={() => {
                        setNotifOpen(false)
                        setTab('alerts')
                        setToast(n.title)
                      }}
                    >
                      <span className="client-notif-item-title">{n.title}</span>
                      <span className="client-notif-item-meta">{n.detail}</span>
                      <span className="client-notif-item-when">{n.when}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <div className="client-tenant">
          <span className="client-tenant-avatar" aria-hidden="true">
            {avatarLetter}
          </span>
          <span className="client-tenant-text">
            <span className="client-tenant-name">{user.company}</span>
            <span className="client-tenant-email">{user.email}</span>
          </span>
        </div>
        <button type="button" className="client-signout" onClick={onSignOut}>
          Sign out
        </button>
      </header>

      {ctx.dashboardTemplate ||
      (user.planId && SUBSCRIPTION_PLAN_LABEL[user.planId]) ||
      activeProductTitles.length ? (
        <div className="client-meta-strip" role="status">
          {ctx.dashboardTemplate ? (
            <div
              className="client-template-pill"
              title={`${ctx.dashboardTemplate.name} — ${ctx.dashboardTemplate.sub}`}
            >
              <span className="client-product-strip-label">Layout</span>
              <span className="client-template-name">{ctx.dashboardTemplate.name}</span>
              <span className="client-template-sep" aria-hidden="true">
                ·
              </span>
              <span className="client-template-sub">{ctx.dashboardTemplate.sub}</span>
            </div>
          ) : null}
          {user.planId && SUBSCRIPTION_PLAN_LABEL[user.planId] ? (
            <div className="client-plan-pill">
              <span className="client-product-strip-label">Plan</span>
              <span className="client-plan-value">{SUBSCRIPTION_PLAN_LABEL[user.planId]}</span>
            </div>
          ) : null}
          {activeProductTitles.length ? (
            <div className="client-product-strip-inner">
              <span className="client-product-strip-label">Active products</span>
              <ul className="client-product-strip-list">
                {activeProductTitles.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="client-body">
        <aside className="client-sidebar" aria-label="Workspace">
          <p className="client-sidebar-label">Workspace</p>
          {navItemsForPreset.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`client-nav-item${effectiveTab === item.id ? ' active' : ''}`}
              onClick={() => {
                if (routeBuildingSiteId || routeAvioraPropertyId) navigate('/')
                setTab(item.id)
              }}
            >
              <svg className="client-nav-icon" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                {item.icon}
              </svg>
              {item.label}
            </button>
          ))}
        </aside>

        <main
          className={`client-main${buildingPageActive ? ' client-main--building-route' : ''}${avioraPropertyPageActive ? ' client-main--aviora-property-route' : ''}${effectiveTab === 'safety' && presetKey === 'aviora' ? ' client-main--aviora-hub' : ''}`}
        >
          {invalidBuildingRoute ? (
            <Navigate to="/" replace />
          ) : invalidAvioraPropertyRoute ? (
            <Navigate to="/" replace />
          ) : buildingPageActive ? (
            <BuildingSiteRouteShell
              key={`${routeBuildingSiteId}:${location.key}`}
              site={buildingSiteOnRoute}
              now={nowTick}
              onClose={closeBuilding}
              user={user}
            />
          ) : avioraPropertyPageActive ? (
            <AvioraPropertyDetailPage
              key={routeAvioraPropertyId}
              propertyId={routeAvioraPropertyId}
              companyName={ctx.portfolioCompanyName || user.company}
              nowTick={nowTick}
            />
          ) : (
            <>
          {!(effectiveTab === 'safety' && presetKey === 'aviora') ? (
            <div className="client-main-header">
              <h1 className="client-main-title">{mainTitle}</h1>
              <p className="client-main-sub">{mainSub}</p>
            </div>
          ) : null}

          {effectiveTab === 'dashboard' || effectiveTab === 'locations' ? (
            effectiveTab === 'dashboard' && presetKey === 'aviora' ? (
              <AvioraConstructionPortfolio
                companyName={ctx.portfolioCompanyName || user.company}
                nowTick={nowTick}
              />
            ) : effectiveTab === 'dashboard' && useHenry1InsetAiAlerts && workspaceSites.length === 1 ? (
              <FootprintSitesSection
                workspaceSites={workspaceSites}
                filteredGlobalSites={filteredGlobalSites}
                company={user.company}
                footprintBlurb={footprintBlurb}
                searchQ={searchQ}
                nowTick={nowTick}
                onOpenBuilding={openBuilding}
                hideSnapshotBranding={presetKey === 'aviora'}
                footprintLayout={presetKey === 'harland' ? 'harland' : 'classic'}
                onOpenAvioraProperty={
                  presetKey === 'aviora'
                    ? (propertyId) => navigate(`/property/${encodeURIComponent(propertyId)}`)
                    : undefined
                }
                topAlerts={
                  <OverviewAiAlertsAside
                    variant="inset"
                    mirrorSite={workspaceSites[0]}
                    nowTick={nowTick}
                    ctx={ctx}
                    visibleAlerts={visibleAlerts}
                    alertFilter={alertFilter}
                    onFilterChange={setAlertFilter}
                    onAcknowledge={acknowledgeAlert}
                    ackedIds={ackedIds}
                    onViewAllAlerts={() => setTab('alerts')}
                  />
                }
              />
            ) : effectiveTab === 'dashboard' ? (
              <div className="client-sites-ribbon-wrap">
                <FootprintSitesSection
                  workspaceSites={workspaceSites}
                  filteredGlobalSites={filteredGlobalSites}
                  company={user.company}
                  footprintBlurb={footprintBlurb}
                  searchQ={searchQ}
                  nowTick={nowTick}
                  onOpenBuilding={openBuilding}
                  hideSnapshotBranding={presetKey === 'aviora'}
                  footprintLayout={presetKey === 'harland' ? 'harland' : 'classic'}
                  onOpenAvioraProperty={
                    presetKey === 'aviora'
                      ? (propertyId) => navigate(`/property/${encodeURIComponent(propertyId)}`)
                      : undefined
                  }
                />
                {/* Full-width AI alerts below footprint; Henry1 uses inset alerts inside purple band */}
                <OverviewAiAlertsAside
                  variant="ribbon"
                  ctx={ctx}
                  visibleAlerts={visibleAlerts}
                  alertFilter={alertFilter}
                  onFilterChange={setAlertFilter}
                  onAcknowledge={acknowledgeAlert}
                  ackedIds={ackedIds}
                  onViewAllAlerts={() => setTab('alerts')}
                />
              </div>
            ) : (
              <FootprintSitesSection
                workspaceSites={workspaceSites}
                filteredGlobalSites={filteredGlobalSites}
                company={user.company}
                footprintBlurb={footprintBlurb}
                searchQ={searchQ}
                nowTick={nowTick}
                onOpenBuilding={openBuilding}
                hideSnapshotBranding={presetKey === 'aviora'}
                footprintLayout={presetKey === 'harland' ? 'harland' : 'classic'}
                onOpenAvioraProperty={
                  presetKey === 'aviora'
                    ? (propertyId) => navigate(`/property/${encodeURIComponent(propertyId)}`)
                    : undefined
                }
              />
            )
          ) : null}

          {effectiveTab === 'dashboard' ? (
            <div
              className={`client-welcome${workspaceSites.length === 1 ? ' client-welcome--narrow' : ''}`}
              role="status"
            >
              <div className="client-welcome-inner">
                <p className="client-welcome-greet">Welcome back, {greetName}</p>
                <p className="client-welcome-meta">
                  Signed in as <strong>{user.email}</strong>
                  {user.lastLoginAt ? (
                    <>
                      {' '}
                      · Last session {formatSessionDate(user.lastLoginAt)}
                    </>
                  ) : null}
                  . Demo data below — wire to your historians and MES when you go live.
                </p>
              </div>
            </div>
          ) : null}

          {effectiveTab === 'dashboard' ? (
            <div className="client-demo-dashes" aria-label="Demo snapshot: three health signals">
              <div className="client-demo-dashes-head">
                <span className="client-demo-dashes-badge">Demo</span>
                <span className="client-demo-dashes-title">Operational pulse</span>
                <span className="client-demo-dashes-caption">Synthetic signals · all corridors green</span>
              </div>
              <ul className="client-demo-dashes-grid">
                {[
                  { id: 'oee', label: 'Throughput & OEE', sub: 'Line blend vs shift target' },
                  { id: 'q', label: 'Quality & yield', sub: 'SPC checkpoints clear' },
                  { id: 'u', label: 'Uptime & energy', sub: 'Voltage / load nominal' },
                ].map((row) => (
                  <li key={row.id} className="client-demo-dashes-cell">
                    <div className="client-demo-dashes-bars" aria-hidden="true">
                      <span className="client-demo-dashes-bar client-demo-dashes-bar--long" />
                      <span className="client-demo-dashes-bar client-demo-dashes-bar--mid" />
                      <span className="client-demo-dashes-bar client-demo-dashes-bar--short" />
                    </div>
                    <div className="client-demo-dashes-body">
                      <div className="client-demo-dashes-text">
                        <strong>{row.label}</strong>
                        <span>{row.sub}</span>
                      </div>
                      <span className="client-demo-dashes-good">
                        <span className="client-demo-dashes-good-dot" aria-hidden="true" />
                        Good
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {effectiveTab === 'dashboard' && !onboard.hidden ? (
            onboardAllDone ? (
              <div className="client-onboard-complete">
                <div>
                  <strong>You&apos;re set.</strong>
                  <span> You&apos;ve opened every area of this demo workspace.</span>
                </div>
                <button type="button" className="client-onboard-dismiss" onClick={dismissOnboard}>
                  Hide checklist
                </button>
              </div>
            ) : (
              <section className="client-onboard" aria-labelledby="client-onboard-title">
                <div className="client-onboard-head">
                  <div>
                    <h2 id="client-onboard-title" className="client-onboard-title">
                      Getting started
                    </h2>
                    <p className="client-onboard-sub">
                      Five quick steps — each jumps to the right place in your workspace.
                    </p>
                  </div>
                  <button type="button" className="client-onboard-dismiss" onClick={dismissOnboard}>
                    Dismiss
                  </button>
                </div>
                <ol className="client-onboard-list">
                  {ONBOARD_STEPS.map((step, idx) => {
                    const done = onboard.done.includes(step.id)
                    return (
                      <li key={step.id} className={`client-onboard-step${done ? ' client-onboard-step--done' : ''}`}>
                        <span className="client-onboard-idx" aria-hidden="true">
                          {done ? '✓' : idx + 1}
                        </span>
                        <div className="client-onboard-step-body">
                          <h3 className="client-onboard-step-title">{step.title}</h3>
                          <p className="client-onboard-step-text">{step.body}</p>
                        </div>
                        {done ? (
                          <span className="client-onboard-done-label">Done</span>
                        ) : (
                          <button
                            type="button"
                            className="client-onboard-go"
                            onClick={() => runOnboardStep(step)}
                          >
                            {step.action === 'export' ? 'Run demo' : 'Go there'}
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </section>
            )
          ) : null}

          {effectiveTab === 'dashboard' ? (
            <>
              <div className="client-kpi-grid" aria-label="Key performance indicators">
                {DASH_KPIS.map((k) => (
                  <div key={k.label} className="client-kpi-card">
                    <span className="client-kpi-label">{k.label}</span>
                    <span className="client-kpi-value">{k.value}</span>
                    <span className="client-kpi-hint">{k.hint}</span>
                    {k.trend ? (
                      <span
                        className={`client-kpi-trend${k.up === true ? ' client-kpi-trend--up' : ''}${k.up === false ? ' client-kpi-trend--down' : ''}`}
                      >
                        {k.trend}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="client-line-snapshot" aria-label="Line health snapshot">
                {PRODUCTION_LINES.slice(0, 3).map((line) => (
                  <article key={line.id} className="client-line-mini">
                    <span className={`client-line-pill client-line-pill--${line.status}`}>{line.status}</span>
                    <div className="client-line-mini-body">
                      <strong>{line.name}</strong>
                      <span className="client-line-mini-oee">{line.oee} OEE</span>
                    </div>
                    <button
                      type="button"
                      className="client-line-mini-link"
                      onClick={() => {
                        setSearchQ('')
                        setTab('lines')
                      }}
                    >
                      Lines →
                    </button>
                  </article>
                ))}
              </div>

              <div className="client-quick-actions" aria-label="Quick actions">
                {QUICK_ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className="client-quick-action"
                    onClick={() => runQuickAction(a.id)}
                  >
                    <span className="client-quick-action-label">{a.label}</span>
                    <span className="client-quick-action-detail">{a.detail}</span>
                  </button>
                ))}
              </div>

              <div className="client-dash-extras">
                <section className="client-priorities" aria-labelledby="pri-title">
                  <div className="client-priorities-head">
                    <h2 id="pri-title" className="client-panel-title">
                      Today&apos;s priorities
                    </h2>
                    <span className="client-panel-badge">{priorities.filter((p) => !p.done).length} open</span>
                  </div>
                  <ul className="client-priority-list">
                    {priorities.map((p) => (
                      <li key={p.id} className={`client-priority-row${p.done ? ' client-priority-row--done' : ''}`}>
                        <button
                          type="button"
                          className={`client-priority-check${p.done ? ' is-done' : ''}`}
                          aria-pressed={p.done}
                          onClick={() => togglePriority(p.id)}
                          aria-label={p.done ? 'Mark not done' : 'Mark done'}
                        >
                          {p.done ? '✓' : ''}
                        </button>
                        <span className="client-priority-label">{p.label}</span>
                        <span className="client-priority-due">{p.due}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="client-shift-panel" aria-labelledby="shift-title">
                  <h2 id="shift-title" className="client-panel-title">
                    Shift mix (rolling)
                  </h2>
                  <div
                    className="client-shift-bar"
                    role="img"
                    aria-label="Shift A thirty-five percent, B forty, C twenty-five"
                  >
                    {SHIFT_SEGMENTS.map((s) => (
                      <div
                        key={s.label}
                        className={`client-shift-seg client-shift-seg--${s.tone}`}
                        style={{ width: `${s.pct}%` }}
                        title={`${s.label} · ${s.pct}%`}
                      />
                    ))}
                  </div>
                  <ul className="client-shift-legend">
                    {SHIFT_SEGMENTS.map((s) => (
                      <li key={s.label}>
                        <span className={`client-shift-dot client-shift-dot--${s.tone}`} aria-hidden="true" />
                        {s.label} · {s.pct}%
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="client-dash-split">
                <div className="client-dash-primary">
                  <div className="client-pills">
                    {ctx.pills.map((p) => (
                      <span key={p.label} className={`client-pill ${p.className}`}>
                        {p.label}
                      </span>
                    ))}
                  </div>
                  <div className="client-charts-row">
                    <div className="client-chart-card">
                      <span className="client-chart-label">{ctx.unitsLabel}</span>
                      <svg className="client-svg" viewBox="0 0 100 48" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <linearGradient id={`${chartUid}-bar`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                        <rect
                          x="8"
                          y="28"
                          width="14"
                          height="16"
                          rx="2"
                          fill={`url(#${chartUid}-bar)`}
                          opacity="0.9"
                        />
                        <rect x="28" y="18" width="14" height="26" rx="2" fill={`url(#${chartUid}-bar)`} />
                        <rect
                          x="48"
                          y="22"
                          width="14"
                          height="22"
                          rx="2"
                          fill={`url(#${chartUid}-bar)`}
                          opacity="0.85"
                        />
                        <rect
                          x="68"
                          y="12"
                          width="14"
                          height="32"
                          rx="2"
                          fill={`url(#${chartUid}-bar)`}
                          opacity="0.95"
                        />
                      </svg>
                    </div>
                    <div className="client-chart-card">
                      <span className="client-chart-label">Sensor trend</span>
                      <svg className="client-svg" viewBox="0 0 100 48" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <linearGradient id={`${chartUid}-area`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
                          </linearGradient>
                          <linearGradient id={`${chartUid}-line`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#22d3ee" />
                          </linearGradient>
                        </defs>
                    <path
                      d="M 4 38 L 18 32 L 32 36 L 46 22 L 60 26 L 74 14 L 88 18 L 96 12 L 96 44 L 4 44 Z"
                      fill={`url(#${chartUid}-area)`}
                    />
                    <path
                      d="M 4 38 L 18 32 L 32 36 L 46 22 L 60 26 L 74 14 L 88 18 L 96 12"
                      fill="none"
                      stroke={`url(#${chartUid}-line)`}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="client-anomaly">{ctx.anomaly}</div>
              <div className="client-chart-footer">
                <svg className="client-spark" viewBox="0 0 120 28" preserveAspectRatio="none">
                  <line x1="0" y1="14" x2="120" y2="14" stroke="rgba(148,163,184,0.15)" strokeWidth="1" />
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    points="0,20 12,18 24,22 36,14 48,16 60,8 72,12 84,6 96,10 108,4 120,7"
                  />
                  <polyline
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="1.2"
                    strokeOpacity="0.85"
                    strokeLinecap="round"
                    points="0,24 15,20 30,22 45,18 60,20 75,14 90,16 105,12 120,14"
                  />
                </svg>
                <div className="client-metrics">
                  <span>
                    OEE <strong>{ctx.oee}</strong>
                  </span>
                  <span>
                    MTBF <strong>{ctx.mtbf}</strong>
                  </span>
                </div>
              </div>
                </div>

                <aside className="client-activity-panel" aria-label="Recent activity">
                  <h2 className="client-activity-title">Recent activity</h2>
                  <ul className="client-activity-list">
                    {ACTIVITY_FEED.map((row, i) => (
                      <li key={i} className="client-activity-item">
                        <span className="client-activity-dot" aria-hidden="true" />
                        <div>
                          <span className="client-activity-when">{row.when}</span>
                          <p className="client-activity-text">{row.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </>
          ) : null}

          {effectiveTab === 'lines' ? (
            <div className="client-lines-page">
              <p className="client-lines-lead">
                {searchQ.trim()
                  ? `${filteredLines.length} line(s) match “${searchQ.trim()}”. Clear the search bar to see all.`
                  : `${PRODUCTION_LINES.length} assets at this site. Use the top search to filter by name, SKU, or line ID.`}
              </p>
              <div className="client-line-grid">
                {filteredLines.map((line) => (
                  <article key={line.id} className="client-line-card">
                    <header className="client-line-card-head">
                      <span className={`client-line-pill client-line-pill--${line.status}`}>{line.status}</span>
                      <span className="client-line-id">{line.id}</span>
                    </header>
                    <h3 className="client-line-name">{line.name}</h3>
                    <dl className="client-line-dl">
                      <div>
                        <dt>OEE</dt>
                        <dd>{line.oee}</dd>
                      </div>
                      <div>
                        <dt>Target</dt>
                        <dd>{line.target}</dd>
                      </div>
                      <div className="client-line-dl-span">
                        <dt>SKU / job</dt>
                        <dd>{line.sku}</dd>
                      </div>
                    </dl>
                    <p className="client-line-note">{line.note}</p>
                    <button
                      type="button"
                      className="client-line-cta"
                      onClick={() =>
                        setToast(`Detail view for ${line.name} — trends, alarms, and work orders (demo).`)
                      }
                    >
                      Open detail
                    </button>
                  </article>
                ))}
              </div>
              {filteredLines.length === 0 ? (
                <p className="client-lines-empty">No lines match that search.</p>
              ) : null}
            </div>
          ) : null}

          {effectiveTab === 'alerts' ? (
            <div className="client-alerts-panel">
              <p className="client-alerts-lead">{ctx.alertsLead}</p>
              <div className="client-filter-row" role="toolbar" aria-label="Filter alerts by severity">
                {(['all', 'high', 'med', 'low']).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`client-filter-chip${alertFilter === f ? ' active' : ''}`}
                    onClick={() => setAlertFilter(f)}
                  >
                    {f === 'all' ? 'All' : f === 'high' ? 'High' : f === 'med' ? 'Medium' : 'Low'}
                  </button>
                ))}
              </div>
              <ul className="client-alert-list">
                {visibleAlerts.map((a) => (
                  <li key={a.id} className="client-alert-row">
                    <span className={`client-sev client-sev--${a.severity}`}>
                      {a.severity === 'high' ? 'High' : a.severity === 'med' ? 'Med' : 'Low'}
                    </span>
                    <div className="client-alert-body">
                      <strong>{a.title}</strong>
                      <p>{a.detail}</p>
                      <span className="client-alert-when">{a.when}</span>
                    </div>
                    <button type="button" className="client-alert-ack" onClick={() => acknowledgeAlert(a.id)}>
                      Acknowledge
                    </button>
                  </li>
                ))}
              </ul>
              {visibleAlerts.length === 0 ? (
                <p className="client-alerts-empty">
                  {ackedIds.size > 0
                    ? 'No alerts in this filter — try another severity or you’ve acknowledged them all.'
                    : 'No alerts match this filter.'}
                </p>
              ) : null}
              <p className="client-alerts-foot">{ctx.alertsFoot}</p>
            </div>
          ) : null}

          {effectiveTab === 'safety' ? (
            <AvioraSafetySecurityDashboard
              companyName={ctx.portfolioCompanyName || user.company}
              nowTick={nowTick}
              onOpenStatus={() => setTab('dashboard')}
            />
          ) : null}

          {effectiveTab === 'reports' ? (
            <div className="client-text-panel">
              <div className="client-reports-toolbar">
                <div className="client-filter-row" role="toolbar" aria-label="Report time range">
                  {REPORT_RANGE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`client-filter-chip${reportRange === p.id ? ' active' : ''}`}
                      onClick={() => setReportRange(p.id)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="client-reports-actions">
                  <button
                    type="button"
                    className="client-report-export"
                    onClick={() =>
                      setToast(`Export ${reportRange} bundle (PDF + CSV) — hook to your job queue in production.`)
                    }
                  >
                    Export range
                  </button>
                  <button
                    type="button"
                    className="client-report-export client-report-export--ghost"
                    onClick={() => setToast('Schedule digest — pick teams and cadence in settings.')}
                  >
                    Schedule digest
                  </button>
                </div>
              </div>
              <p className="client-text-lead">{ctx.reportsLead}</p>
              <div className="client-dossier-grid">
                {ctx.reports.map((r) => (
                  <article key={r.title} className="client-dossier-card">
                    <h3 className="client-dossier-card-title">{r.title}</h3>
                    <p className="client-dossier-card-body">{r.text}</p>
                  </article>
                ))}
              </div>
              <p className="client-text-foot">PDF + Excel export · scheduled digest to your distribution lists</p>
            </div>
          ) : null}

          {effectiveTab === 'insights' ? (
            <div className="client-text-panel client-activities-page">
              <section className="client-myhenry-panel" aria-label="MyHenry recommendations">
                <h3 className="client-myhenry-title">AI Insight Panel (MyHenry)</h3>
                <ul className="client-myhenry-list">
                  {myHenryRecommendations.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="client-myhenry-cta"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.assign(BOOK_DEMO_URL)
                    }
                  }}
                >
                  Get Started with a Demo
                </button>
              </section>
              <section className="client-insight-ask" aria-label="Ask HENRY">
                <label htmlFor="insight-q" className="client-insight-ask-label">
                  Ask in plain language
                </label>
                <div className="client-insight-ask-row">
                  <input
                    id="insight-q"
                    type="text"
                    className="client-insight-input"
                    placeholder='e.g. “What drove scrap on Line 03 this week?”'
                    value={insightQuestion}
                    onChange={(e) => setInsightQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') runInsightAsk()
                    }}
                  />
                  <button type="button" className="client-insight-submit" onClick={runInsightAsk}>
                    Ask HENRY
                  </button>
                </div>
                <p className="client-insight-ask-hint">
                  Answers will cite machines, lots, and timestamps when your data lake is connected.
                </p>
              </section>
              <ActivitiesAnalyticsPanel
                actId={activitiesVisId}
                reportRange={reportRange}
                onReportRange={setReportRange}
                leadText={ctx.insightsLead}
                sites={workspaceSites}
              />
              <p className="client-text-foot">
                Demo charts mirror a Power BI–style canvas — replace with live measures from your warehouse or embed
                reports.
              </p>
            </div>
          ) : null}

          {effectiveTab === 'maintenance' ? (
            <div className="client-text-panel client-text-panel--placeholder" aria-labelledby="maintenance-h">
              <h2 id="maintenance-h" className="client-panel-title">
                Maintenance
              </h2>
              <p className="client-text-lead">
                Preventive maintenance, work orders, and spare-parts context will appear here. Connect HENRY to your
                CMMS or EAM in production.
              </p>
              <button
                type="button"
                className="client-help-link"
                onClick={() => setToast('CMMS integration — link tickets, assets, and downtime codes (demo).')}
              >
                Plan integration
              </button>
            </div>
          ) : null}

          {effectiveTab === 'users' ? (
            <div className="client-text-panel client-text-panel--placeholder" aria-labelledby="users-h">
              <h2 id="users-h" className="client-panel-title">
                Users
              </h2>
              <p className="client-text-lead">
                Invite operators, site leads, and corporate viewers; assign roles per site. Wire to your identity
                provider and SCIM in production.
              </p>
              <button
                type="button"
                className="client-help-link"
                onClick={() => setToast('User provisioning — SSO groups map to HENRY roles (demo).')}
              >
                View access model
              </button>
            </div>
          ) : null}

          {effectiveTab === 'account' ? (
            <div className="client-account-panel">
              <div className="client-account-hero">
                <div className="client-account-hero-avatar" aria-hidden="true">
                  {avatarLetter}
                </div>
                <div>
                  <h2 className="client-account-hero-name">{user.company}</h2>
                  <p className="client-account-hero-email">{user.email}</p>
                </div>
              </div>
              <dl className="client-account-dl">
                <div className="client-account-row">
                  <dt>Work email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div className="client-account-row">
                  <dt>Organization</dt>
                  <dd>{user.company}</dd>
                </div>
                <div className="client-account-row">
                  <dt>Workspace slug</dt>
                  <dd>
                    <code className="client-account-code">{user.slug}</code>
                  </dd>
                </div>
                <div className="client-account-row">
                  <dt>Plan</dt>
                  <dd>
                    {user.planId && SUBSCRIPTION_PLAN_LABEL[user.planId]
                      ? SUBSCRIPTION_PLAN_LABEL[user.planId]
                      : 'No plan on file — contact sales to align billing.'}
                  </dd>
                </div>
                <div className="client-account-row">
                  <dt>Active products</dt>
                  <dd>
                    {activeProductTitles.length ? (
                      <ul className="client-account-product-list">
                        {activeProductTitles.map((t) => (
                          <li key={t}>{t}</li>
                        ))}
                      </ul>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div className="client-account-row">
                  <dt>Member since</dt>
                  <dd>{formatSessionDate(user.createdAt)}</dd>
                </div>
                <div className="client-account-row">
                  <dt>Last sign-in</dt>
                  <dd>{formatSessionDate(user.lastLoginAt)}</dd>
                </div>
              </dl>
              <div className="client-account-actions" aria-label="Account actions">
                <button
                  type="button"
                  className="client-account-action-card"
                  onClick={() =>
                    setToast('Connect Stripe, NetSuite, or your billing portal when you wire payments.')
                  }
                >
                  <span className="client-account-action-title">Subscription &amp; billing</span>
                  <span className="client-account-action-desc">Plan, invoices, and payment method</span>
                </button>
                <button
                  type="button"
                  className="client-account-action-card"
                  onClick={() =>
                    setToast('Add password reset and MFA here (e.g. email link + TOTP) for production.')
                  }
                >
                  <span className="client-account-action-title">Security</span>
                  <span className="client-account-action-desc">Password, sessions, and devices</span>
                </button>
                <button
                  type="button"
                  className="client-account-action-card"
                  onClick={() =>
                    setToast('Implementation guide: link your runbook, SCADA tags, and escalation policy.')
                  }
                >
                  <span className="client-account-action-title">Implementation</span>
                  <span className="client-account-action-desc">Integrations and go-live checklist</span>
                </button>
                <button
                  type="button"
                  className="client-account-action-card"
                  onClick={() =>
                    setToast('API keys & webhooks — rotate secrets and point HENRY at your MES / data warehouse.')
                  }
                >
                  <span className="client-account-action-title">API &amp; webhooks</span>
                  <span className="client-account-action-desc">Keys, event subscriptions, rate limits</span>
                </button>
              </div>
              <p className="client-account-foot">
                These tiles are ready for your real admin APIs and billing provider.
              </p>
            </div>
          ) : null}

          <footer className="client-workspace-help">
            <p className="client-workspace-help-text">
              <strong>Workspace help</strong> — demo data only. For production, connect historians, MES, and
              your alert destinations.
            </p>
            <div className="client-workspace-help-actions">
              <button
                type="button"
                className="client-help-link"
                onClick={() => setTab('alerts')}
              >
                Jump to alerts
              </button>
              <button
                type="button"
                className="client-help-link"
                onClick={() => setToast('Document your internal support channel (Slack, PagerDuty, etc.).')}
              >
                Escalation policy
              </button>
            </div>
          </footer>
            </>
          )}
        </main>
      </div>

      <nav className="client-mobile-dock" aria-label="Workspace tabs">
        {navItemsForPreset.filter((item) => !item.hideInDock).map((item) => (
          <button
            key={`dock-${item.id}`}
            type="button"
            className={`client-dock-item${effectiveTab === item.id ? ' is-active' : ''}`}
            onClick={() => {
              if (routeBuildingSiteId || routeAvioraPropertyId) navigate('/')
              setTab(item.id)
            }}
          >
            <svg className="client-dock-icon" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              {item.icon}
            </svg>
            <span className="client-dock-label">{item.dockLabel ?? item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
