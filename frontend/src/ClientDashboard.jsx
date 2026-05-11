import { useCallback, useState, useEffect, useId, useRef, useMemo } from 'react'
import { matchPath, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { titlesForProductIds } from './productCatalog.js'
import henryLogo from './assets/henry-logo.png'
import { LogoSpreadLine } from './LogoSpreadLine.jsx'
import { getDashboardContext, resolveDashboardPresetKey } from './dashboard/registry.js'
import snapshotWordmarkWhite from './assets/snapshot-wordmark-white.png'
import harlandMedicalSystemsLogo from './assets/clients/harland-medical-systems-logo.png'
import harland528Coater from './assets/uploads/harland-528-coater.png'
import harlandTts1000 from './assets/uploads/harland-tts1000.png'
import harlandCustomRig from './assets/uploads/harland-custom-rig.png'
import harlandRdx195 from './assets/uploads/harland-rdx-195.png'
import harlandFts7000 from './assets/uploads/harland-fts7000.png'
import harlandCts1100 from './assets/uploads/harland-cts1100.png'
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
  { id: 'status', label: 'Status' },
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

/** Live clock in the site’s zone (IANA). Falls back if the runtime lacks the zone. */
function formatSiteLocalTime(date, timeZone) {
  if (!timeZone) return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date)
  } catch {
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }
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
    timeZone: 'America/Chicago',
    employees: 118,
    efficiency: 89,
    address: '4820 Nicollet Ave S, Minneapolis, MN 55419 USA',
    phoneDisplay: '+1 (612) 555-0142',
    phoneTel: '+16125550142',
    building: {
      name: 'US Headquarters',
      // Client-approved US building visual
      floorPlanSrc: HARLAND_US_FLOOR_PLAN_SRC,
      footerBlurb: {
        status:
          'Production cells mostly green. Rack hall B within spec; weld East in planned maintenance.',
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
    timeZone: 'Europe/Dublin',
    employees: 64,
    efficiency: 87,
    address: 'Ringmahon Industrial Estate, Block C, Cork, Ireland T23 V6F2',
    phoneDisplay: '+353 (0) 21 555 0173',
    phoneTel: '+353215550173',
    building: {
      name: 'Dublin Manufacturing Center',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        status: 'Fill line holding steady; packaging lane C trending above target takt.',
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
    timeZone: 'America/Costa_Rica',
    employees: 71,
    efficiency: 82,
    address: 'La Aurora Free Zone, Heredia 40105, Costa Rica',
    phoneDisplay: '+506 4002 8840',
    phoneTel: '+50640028840',
    building: {
      name: 'San José Assembly Hub',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        status: 'Regional hub: two cells in run, one idle for die swap.',
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
    timeZone: 'Asia/Jerusalem',
    employees: 34,
    efficiency: 75,
    address: '20 Alon ha-Tavor St, Building 5, Caesarea, Israel',
    phoneDisplay: '+972 549 985610',
    phoneTel: '+972549985610',
    building: {
      name: 'Herzliya R&D & light mfg',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        status: 'Prototype line idle; pilot build window Friday.',
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
    timeZone: 'Asia/Kolkata',
    employees: 78,
    efficiency: 84,
    address: 'Nsl Centrum Mall, Kukatpally Housing Board Colony, KPHB Phase 2, Kukatpally, Hyderabad, Telangana 500085',
    phoneDisplay: '+1 (952) 941-0475',
    phoneTel: '+19529410475',
    building: {
      name: 'Bengaluru support & NOC',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        status: 'Remote monitoring for APAC plants · no local heavy assets in this demo.',
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
    building: {
      name: 'Kuala Lumpur — planned facility',
      floorPlanSrc: DEFAULT_FLOOR_PLAN_SRC,
      footerBlurb: {
        status: 'Footprint TBD · using reference layout until CAD is uploaded.',
        safety: '—',
        security: '—',
        settings: 'Assign building name, zones, and image per site from admin API.',
      },
      zones: [
        {
          id: 'my-placeholder',
          label: 'Future production zone',
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
        status: 'Three lines at rate; robotics bay B in preventative maintenance window tonight.',
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
        status: 'Hurricane season checklist green · humidity envelopes within spec on clean lines.',
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
        status: 'High-altitude compressor tuned; carton erectors within SPC bands.',
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
        status: 'Calidad ISO recertificación en auditoría paralela demo.',
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
        status: 'Reflow ovens balanced; AOI catch rate trending best-in-footprint demo.',
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
        status: 'Load-shed mitigation on UPS test passed · diesel gen exercise Sunday.',
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
        status: 'Two transfer presses synchronized; weld spatter VOC within permit.',
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
        status: 'Assembly heijunka leveling — feeder supermarket restocked nightly.',
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
        status: 'Cyclone season bundle staged; dock doors calibrated after humidity spike.',
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
        status: 'Clean suite differential pressure trending nominal post filter swap.',
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
}

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
  if (preset === 'henry10') {
    return HENRY10_ONLY_SITES
  }
  return GLOBAL_SITES
}

function workspaceSitesForUser(user) {
  const requestedCount = parseRequestedLocationCount(user)
  const defaultSites = defaultSitesForPreset(user)
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
function SiteTrafficLight({ active, label }) {
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
          className={`client-site-tl__lamp client-site-tl__lamp--single ${colorClass}${safe ? ' is-on' : ''}`}
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

const SAFETY_EVENTS_POOL = [
  { tone: 'good', kind: 'Walkthrough', text: 'Floor walkthrough completed by EHS lead' },
  { tone: 'good', kind: 'LOTO', text: 'Lockout / Tagout audit passed' },
  { tone: 'warn', kind: 'Near-Miss', text: 'Near-miss reported — slip in WH; coaching delivered' },
  { tone: 'warn', kind: 'Ergonomics', text: 'Ergonomics action open: lift assist for line C' },
  { tone: 'good', kind: 'Drill', text: 'Evacuation drill logged' },
  { tone: 'good', kind: 'PPE', text: 'PPE compliance spot-check 98%' },
  { tone: 'warn', kind: 'Near-Miss', text: 'Near-miss: pallet edge — corner guard installed' },
  { tone: 'good', kind: 'First Aid', text: 'First aid kit restock verified' },
  { tone: 'bad', kind: 'Incident', text: 'Hand laceration — closed; root cause posted' },
  { tone: 'good', kind: 'Training', text: 'Confined-space refresher completed for shift B' },
]

const SAFETY_CHECKS = [
  'Eye-wash stations tested',
  'Fire extinguisher inspection',
  'MSDS / SDS up to date',
  'Forklift pre-shift inspection',
  '5S audit closed',
  'Emergency lighting verified',
]

const SAFETY_LEADS = [
  'Priya Shah',
  'Marcus Webb',
  'Anika Iyer',
  'Jorge Alvarado',
  'Sophie Tremblay',
  'Devon Carter',
]

const SECURITY_EVENTS_POOL = [
  { tone: 'good', kind: 'Badge', text: 'Standard badged entry — Gate 1' },
  { tone: 'good', kind: 'Visitor', text: 'Visitor checked in — A. Patel · escorted' },
  { tone: 'warn', kind: 'Anomaly', text: 'Door held > 30s at Gate 3 — auto-resolved' },
  { tone: 'good', kind: 'Patrol', text: 'Guard tour 4 of 4 complete' },
  { tone: 'warn', kind: 'Camera', text: 'Camera 12 health alert — stream restored' },
  { tone: 'good', kind: 'Contractor', text: 'Contractor onboarding cleared — 2 personnel' },
  { tone: 'bad', kind: 'Alarm', text: 'Perimeter sensor zone B — false alarm logged' },
  { tone: 'good', kind: 'Cage', text: 'Secure cage access verified · all matched badges' },
  { tone: 'good', kind: 'Access', text: 'After-hours access request approved' },
]

const SECURITY_ZONES = [
  'Main Lobby',
  'Loading Dock',
  'Engineering Wing',
  'Server Room',
  'Yard / Perimeter',
  'Roof Access',
]

const SECURITY_LEADS = [
  'Robert Lin',
  'Aisha Mensah',
  'Diego Vela',
  'Hannah O’Brien',
  'Ren Tanaka',
  'Lila Petrov',
]

const STATUS_EVENTS_POOL = [
  { tone: 'good', kind: 'Run', text: 'Line A — job started · operator J. Patel' },
  { tone: 'good', kind: 'Restart', text: 'Cell B back online after planned PM' },
  { tone: 'warn', kind: 'Slow Cycle', text: 'Cell C cycle time +6% — monitoring' },
  { tone: 'good', kind: 'Quality', text: 'In-line vision pass rate 99.4%' },
  { tone: 'warn', kind: 'Material', text: 'Coater hopper at 18% — refill scheduled' },
  { tone: 'good', kind: 'Shift', text: 'Shift handover complete · all KPIs green' },
  { tone: 'bad', kind: 'Downtime', text: 'Cell D unplanned stop — root cause posted' },
  { tone: 'good', kind: 'Throughput', text: 'Line B above takt for 3 consecutive hours' },
  { tone: 'good', kind: 'Setup', text: 'Changeover under target time on Line A' },
]

const STATUS_LINES = [
  'Line A · Coater',
  'Line B · Tester',
  'Line C · Coater',
  'Line D · Assembly',
  'Cell E · Inspection',
  'Cell F · Pack-out',
]

const STATUS_LEADS = [
  'Avery Chen',
  'Marcus Hill',
  'Priya Shah',
  'Diego Vela',
  'Sophie Tremblay',
  'Kenji Watanabe',
]

function pickFromPool(pool, n, hash) {
  if (!pool.length) return []
  const taken = new Set()
  const out = []
  let h = hash >>> 0
  let guard = 0
  while (out.length < n && guard < n * 8) {
    h = ((h * 1103515245) + 12345) >>> 0
    const idx = h % pool.length
    if (!taken.has(idx)) {
      taken.add(idx)
      out.push(pool[idx])
    }
    guard += 1
  }
  return out
}

function safetyDataFor(scopeId) {
  const h = hashId(`safety-${scopeId || 'all'}`)
  const daysWithoutLti = 60 + (h % 280)
  const ppe = 92 + (h % 8)
  const lotoPass = 94 + ((h >> 2) % 6)
  const openNearMiss = h % 4
  const openActions = (h >> 3) % 5
  const overall =
    daysWithoutLti > 180 && openNearMiss === 0 && openActions <= 1
      ? 'all-clear'
      : openNearMiss <= 2 && openActions <= 3
        ? 'monitor'
        : 'action'
  const events = pickFromPool(SAFETY_EVENTS_POOL, 5, h).map((e, i) => ({
    ...e,
    when: `${(i + 1) * 2}h ago`,
  }))
  const checks = SAFETY_CHECKS.map((label, i) => ({
    label,
    pct: 70 + ((h >> (i + 2)) % 30),
  }))
  const lead = SAFETY_LEADS[h % SAFETY_LEADS.length]
  const lastWalkthrough = `${((h % 5) + 4)}:${String((h * 7) % 60).padStart(2, '0')} local`
  return {
    daysWithoutLti,
    ppe,
    lotoPass,
    openNearMiss,
    openActions,
    events,
    checks,
    lead,
    lastWalkthrough,
    overall,
  }
}

function securityDataFor(scopeId) {
  const h = hashId(`security-${scopeId || 'all'}`)
  const badged24h = 80 + (h % 240)
  const visitorsActive = h % 8
  const cameraTotal = 24
  const cameraOnline = Math.max(20, cameraTotal - ((h >> 1) % 3))
  const cameraPct = Math.round((cameraOnline / cameraTotal) * 100)
  const exceptions = (h >> 2) % 4
  const overall = exceptions === 0 && cameraPct >= 95 ? 'secure' : exceptions <= 2 ? 'monitor' : 'action'
  const events = pickFromPool(SECURITY_EVENTS_POOL, 5, h).map((e, i) => ({
    ...e,
    when: `${(i + 1) * 12}m ago`,
  }))
  const zones = SECURITY_ZONES.map((label, i) => {
    const z = (h >> (i + 2)) % 100
    const tone = z > 80 ? 'good' : z > 50 ? 'warn' : 'good'
    const status = z > 80 ? 'Secured' : z > 50 ? 'Monitored' : 'Secured'
    return { label, status, tone }
  })
  const lead = SECURITY_LEADS[h % SECURITY_LEADS.length]
  return {
    badged24h,
    visitorsActive,
    cameraOnline,
    cameraTotal,
    cameraPct,
    exceptions,
    events,
    zones,
    lead,
    overall,
  }
}

function statusDataFor(scopeId) {
  const h = hashId(`status-${scopeId || 'all'}`)
  const machinesTotal = 8 + (h % 6)
  const machinesOnline = Math.max(machinesTotal - ((h >> 2) % 3), Math.ceil(machinesTotal * 0.7))
  const oee = 78 + (h % 18)
  const throughput = 90 + ((h >> 1) % 60)
  const downtimeMin = (h >> 3) % 35
  const mttrMin = 6 + ((h >> 4) % 18)
  const overall =
    machinesOnline === machinesTotal && oee >= 88 && downtimeMin < 10
      ? 'green'
      : oee >= 80 && downtimeMin < 25
        ? 'monitor'
        : 'action'
  const events = pickFromPool(STATUS_EVENTS_POOL, 5, h).map((e, i) => ({
    ...e,
    when: `${(i + 1) * 7}m ago`,
  }))
  const lines = STATUS_LINES.map((label, i) => {
    const v = 70 + ((h >> (i + 2)) % 30)
    return { label, pct: v }
  })
  const lead = STATUS_LEADS[h % STATUS_LEADS.length]
  return {
    machinesOnline,
    machinesTotal,
    oee,
    throughput,
    downtimeMin,
    mttrMin,
    events,
    lines,
    lead,
    overall,
  }
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M3 12h4l2-7 4 14 2-7h6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5L12 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 12.5l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

function SxStatusPill({ tone, label }) {
  return <span className={`client-sx-status client-sx-status--${tone}`}>{label}</span>
}

function UnitViewSwitcher({ activeView, onSelectView, className }) {
  const handle = (next) => onSelectView && onSelectView(next)
  return (
    <div
      className={`client-bu-actions client-bu-actions--v2 client-bu-actions--top${className ? ` ${className}` : ''}`}
      role="tablist"
      aria-label="Business unit view"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'status'}
        className={`client-bu-action-btn tone-status${activeView === 'status' ? ' is-active' : ''}`}
        aria-label="Status"
        onClick={() => handle('status')}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M3 12h4l2-7 4 14 2-7h6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        STATUS
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'jobs'}
        className={`client-bu-action-btn tone-jobs${activeView === 'jobs' ? ' is-active' : ''}`}
        aria-label="Jobs"
        onClick={() => handle('jobs')}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <rect x="4" y="6" width="16" height="13" rx="1.5" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M9 6V4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 4.5V6" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
          <path d="M8 11h8M8 14.5h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        JOBS
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'safety'}
        className={`client-bu-action-btn tone-safety${activeView === 'safety' ? ' is-active' : ''}`}
        aria-label="Safety"
        onClick={() => handle('safety')}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5L12 2z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        </svg>
        SAFETY
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeView === 'security'}
        className={`client-bu-action-btn tone-security${activeView === 'security' ? ' is-active' : ''}`}
        aria-label="Security"
        onClick={() => handle('security')}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
          <rect x="5" y="11" width="14" height="9" rx="1.5" fill="none" stroke="#fff" strokeWidth="2" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
        SECURITY
      </button>
    </div>
  )
}

function SxKpiCard({ label, value, sub, tone }) {
  return (
    <div className={`client-sx-kpi${tone ? ` client-sx-kpi--${tone}` : ''}`}>
      <p className="client-sx-kpi-value">{value}</p>
      <p className="client-sx-kpi-label">{label}</p>
      {sub ? <p className="client-sx-kpi-sub">{sub}</p> : null}
    </div>
  )
}

function StatusPanel({ scopeId, scopeName, localLine }) {
  const data = useMemo(() => statusDataFor(scopeId), [scopeId])
  const tone = data.overall === 'green' ? 'good' : data.overall === 'monitor' ? 'warn' : 'bad'
  const label = data.overall === 'green' ? 'All Green' : data.overall === 'monitor' ? 'Monitoring' : 'Action Required'
  const onlinePct = Math.round((data.machinesOnline / data.machinesTotal) * 100)
  return (
    <section className="client-sx-panel client-sx-panel--status" aria-label={`${scopeName} status`}>
      <header className="client-sx-head">
        <div className="client-sx-head-titles">
          <p className="client-sx-eyebrow"><ChartIcon /> Production Status</p>
          <h3 className="client-sx-title">{scopeName}</h3>
          <p className="client-sx-sub">{`${data.machinesOnline} of ${data.machinesTotal} machines online · OEE ${data.oee}%`}</p>
        </div>
        <div className="client-sx-head-aside">
          <SxStatusPill tone={tone} label={label} />
        </div>
      </header>
      <div className="client-sx-kpis">
        <SxKpiCard
          label="Machines Online"
          value={`${data.machinesOnline}/${data.machinesTotal}`}
          sub={`${onlinePct}% available`}
          tone={onlinePct === 100 ? 'good' : onlinePct >= 85 ? 'warn' : 'bad'}
        />
        <SxKpiCard
          label="OEE"
          value={`${data.oee}%`}
          tone={data.oee >= 88 ? 'good' : data.oee >= 78 ? 'warn' : 'bad'}
        />
        <SxKpiCard
          label="Throughput"
          value={data.throughput}
          sub="units / hr"
          tone="good"
        />
        <SxKpiCard
          label="Downtime Today"
          value={`${data.downtimeMin}m`}
          sub={`MTTR ${data.mttrMin}m`}
          tone={data.downtimeMin === 0 ? 'good' : data.downtimeMin < 15 ? 'warn' : 'bad'}
        />
      </div>
      <div className="client-sx-grid">
        <section className="client-sx-card">
          <h5 className="client-sx-card-title">Recent Events</h5>
          <ul className="client-sx-events">
            {data.events.map((e, i) => (
              <li key={`${e.kind}-${i}`} className={`client-sx-event tone-${e.tone}`}>
                <span className="client-sx-event-kind">{e.kind}</span>
                <span className="client-sx-event-text">{e.text}</span>
                <span className="client-sx-event-when">{e.when}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="client-sx-card">
          <h5 className="client-sx-card-title">Line Utilization</h5>
          <ul className="client-sx-checks">
            {data.lines.map((c) => (
              <li key={c.label} className="client-sx-check">
                <span className="client-sx-check-label">{c.label}</span>
                <div className="client-sx-check-track" aria-hidden="true">
                  <span
                    className="client-sx-check-fill"
                    style={{
                      width: `${c.pct}%`,
                      background: c.pct >= 90 ? '#16a34a' : c.pct >= 75 ? '#f59e0b' : '#dc2626',
                    }}
                  />
                </div>
                <span className="client-sx-check-pct">{c.pct}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <footer className="client-sx-foot">
        <span><strong>Shift Lead:</strong> {data.lead}</span>
        {localLine ? <span>{`Updated · ${localLine}`}</span> : null}
      </footer>
    </section>
  )
}

function SafetyPanel({ scopeId, scopeName, localLine, unitDigits }) {
  const [timeRange, setTimeRange] = useState('daily')
  const data = useMemo(() => safetyDataFor(scopeId), [scopeId])
  const tone = data.overall === 'all-clear' ? 'good' : data.overall === 'monitor' ? 'warn' : 'bad'
  const label = data.overall === 'all-clear' ? 'All Clear' : data.overall === 'monitor' ? 'Monitoring' : 'Action Required'
  const inner = (
    <section
      className={`client-sx-panel client-sx-panel--safety${unitDigits ? ' client-sx-panel--unit-main' : ''}`}
      aria-label={`${scopeName} safety`}
    >
      <header className="client-sx-head">
        <div className="client-sx-head-titles">
          <p className="client-sx-eyebrow"><ShieldIcon /> Safety Operations</p>
          <h3 className="client-sx-title">{scopeName}</h3>
          <p className="client-sx-sub">Last walkthrough {data.lastWalkthrough}</p>
        </div>
        <div className="client-sx-head-aside">
          <SxStatusPill tone={tone} label={label} />
        </div>
      </header>
      <div className="client-sx-kpis">
        <SxKpiCard label="Days w/o LTI" value={data.daysWithoutLti} tone="good" />
        <SxKpiCard label="PPE Compliance" value={`${data.ppe}%`} tone={data.ppe >= 95 ? 'good' : 'warn'} />
        <SxKpiCard label="LOTO Audits" value={`${data.lotoPass}%`} sub="passed" tone={data.lotoPass >= 95 ? 'good' : 'warn'} />
        <SxKpiCard
          label="Open Actions"
          value={data.openActions}
          sub={`${data.openNearMiss} open near-miss`}
          tone={data.openActions === 0 ? 'good' : data.openActions <= 2 ? 'warn' : 'bad'}
        />
      </div>
      <div className="client-sx-grid">
        <section className="client-sx-card">
          <h5 className="client-sx-card-title">Recent Events</h5>
          <ul className="client-sx-events">
            {data.events.map((e, i) => (
              <li key={`${e.kind}-${i}`} className={`client-sx-event tone-${e.tone}`}>
                <span className="client-sx-event-kind">{e.kind}</span>
                <span className="client-sx-event-text">{e.text}</span>
                <span className="client-sx-event-when">{e.when}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="client-sx-card">
          <h5 className="client-sx-card-title">Compliance Checklist</h5>
          <ul className="client-sx-checks">
            {data.checks.map((c) => (
              <li key={c.label} className="client-sx-check">
                <span className="client-sx-check-label">{c.label}</span>
                <div className="client-sx-check-track" aria-hidden="true">
                  <span
                    className="client-sx-check-fill"
                    style={{
                      width: `${c.pct}%`,
                      background: c.pct >= 95 ? '#16a34a' : c.pct >= 85 ? '#f59e0b' : '#dc2626',
                    }}
                  />
                </div>
                <span className="client-sx-check-pct">{c.pct}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <footer className="client-sx-foot">
        <span><strong>EHS Lead:</strong> {data.lead}</span>
        {localLine ? <span>{`Updated · ${localLine}`}</span> : null}
      </footer>
    </section>
  )
  if (!unitDigits) return inner
  return (
    <section className="client-unit-jobs-panel" aria-label={`BU ${unitDigits} safety`}>
      <UnitHarlandPanelHeader
        unitDigits={unitDigits}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        rangeGroupLabel="Safety report range"
      />
      {inner}
    </section>
  )
}

function SecurityPanel({ scopeId, scopeName, localLine, unitDigits }) {
  const [timeRange, setTimeRange] = useState('daily')
  const data = useMemo(() => securityDataFor(scopeId), [scopeId])
  const tone = data.overall === 'secure' ? 'good' : data.overall === 'monitor' ? 'warn' : 'bad'
  const label = data.overall === 'secure' ? 'Secure' : data.overall === 'monitor' ? 'Monitoring' : 'Action Required'
  const inner = (
    <section
      className={`client-sx-panel client-sx-panel--security${unitDigits ? ' client-sx-panel--unit-main' : ''}`}
      aria-label={`${scopeName} security`}
    >
      <header className="client-sx-head">
        <div className="client-sx-head-titles">
          <p className="client-sx-eyebrow"><LockIcon /> Security Operations</p>
          <h3 className="client-sx-title">{scopeName}</h3>
          <p className="client-sx-sub">{`${data.cameraOnline}/${data.cameraTotal} cameras online · ${data.exceptions} open exceptions`}</p>
        </div>
        <div className="client-sx-head-aside">
          <SxStatusPill tone={tone} label={label} />
        </div>
      </header>
      <div className="client-sx-kpis">
        <SxKpiCard label="Badged Entries (24h)" value={data.badged24h} tone="good" />
        <SxKpiCard label="Visitors On Site" value={data.visitorsActive} sub="all escorted" />
        <SxKpiCard
          label="Cameras Online"
          value={`${data.cameraOnline}/${data.cameraTotal}`}
          sub={`${data.cameraPct}% healthy`}
          tone={data.cameraPct >= 95 ? 'good' : 'warn'}
        />
        <SxKpiCard
          label="Open Exceptions"
          value={data.exceptions}
          tone={data.exceptions === 0 ? 'good' : data.exceptions <= 2 ? 'warn' : 'bad'}
        />
      </div>
      <div className="client-sx-grid">
        <section className="client-sx-card">
          <h5 className="client-sx-card-title">Recent Access &amp; Events</h5>
          <ul className="client-sx-events">
            {data.events.map((e, i) => (
              <li key={`${e.kind}-${i}`} className={`client-sx-event tone-${e.tone}`}>
                <span className="client-sx-event-kind">{e.kind}</span>
                <span className="client-sx-event-text">{e.text}</span>
                <span className="client-sx-event-when">{e.when}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="client-sx-card">
          <h5 className="client-sx-card-title">Zone Status</h5>
          <ul className="client-sx-zones">
            {data.zones.map((z) => (
              <li key={z.label} className={`client-sx-zone tone-${z.tone}`}>
                <span className="client-sx-zone-dot" aria-hidden="true" />
                <span className="client-sx-zone-label">{z.label}</span>
                <span className="client-sx-zone-status">{z.status}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <footer className="client-sx-foot">
        <span><strong>Security Lead:</strong> {data.lead}</span>
        {localLine ? <span>{`Updated · ${localLine}`}</span> : null}
      </footer>
    </section>
  )
  if (!unitDigits) return inner
  return (
    <section className="client-unit-jobs-panel" aria-label={`BU ${unitDigits} security`}>
      <UnitHarlandPanelHeader
        unitDigits={unitDigits}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        rangeGroupLabel="Security report range"
      />
      {inner}
    </section>
  )
}

function UnitOverviewSide({ unitPanel, statusLabel, cards, localLine, onClose, digits }) {
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

      <section className="client-bu-section">
        <h5 className="client-bu-section-title"><EyeIcon /> Visual Snapshot</h5>
        <div className="client-bu-snap-grid">
          {isBu120 ? (
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
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      <div className="client-bu-local">{`Local Time: ${localLine}`}</div>
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
                <p>{`Description: ${card.description}`}</p>
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
        aria-describedby="client-building-local"
      >
        <div className="client-building-topbar">
          <div className="client-building-topbar-brand">
            <h2 id="client-building-title" className="client-building-name">
              {b.name}
            </h2>
            <p id="client-building-local" className="client-building-topbar-local">
              {localLine}
            </p>
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
              const view = unitView || 'jobs'
              const handleView = (next) => onSelectUnitView && onSelectUnitView(next)
              return (
                <div className="client-bu-view">
                  <UnitOverviewSide
                    unitPanel={activeZone.machinery.unitPanel}
                    statusLabel={activeZone.machinery.status}
                    cards={unitCards}
                    localLine={localLine}
                    digits={unitDigits}
                    onClose={() => onSelectZone(null)}
                  />
                  <div
                    className={`client-bu-image-wrap${activeZone.machinery.unitPanel.powerBiEmbed?.reportUrl ? ' client-bu-image-wrap--analytics' : ''}`}
                  >
                    <UnitViewSwitcher activeView={view} onSelectView={handleView} />
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
                    ) : view === 'status' ? (
                      <StatusPanel
                        scopeId={scopeId}
                        scopeName={scopeName}
                        localLine={localLine}
                      />
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
                    <span className="client-building-zone-label">{z.label}</span>
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
              {panelTab === 'status' ? (
                <StatusPanel
                  scopeId={`${site.id}-bldg`}
                  scopeName={b.name}
                  localLine={localLine}
                />
              ) : panelTab === 'safety' ? (
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
  const [buildingPanelTab, setBuildingPanelTab] = useState('status')
  const [unitView, setUnitView] = useState('jobs')

  const handleSelectZone = useCallback((next) => {
    setBuildingZoneId(next)
    setUnitView('jobs')
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
      {filteredGlobalSites.map((site) => (
        <article key={site.id} className="client-site-card">
          <div className="client-site-topline">
            <SiteTrafficLight
              active={SITE_SNAPSHOT[site.id]?.light ?? 'off'}
              label={SITE_SNAPSHOT[site.id]?.status}
            />
            <span className="client-site-kpi-chip">
              {SITE_SNAPSHOT[site.id]?.downtimeMins != null
                ? `${SITE_SNAPSHOT[site.id].downtimeMins}m downtime`
                : 'No active assets'}
            </span>
          </div>
          <button
            type="button"
            className="client-site-card-main"
            onClick={() => onOpenBuilding(site)}
            aria-label={`Open building view for ${site.country}`}
          >
            <div className="client-site-title-row">
              <h3 className="client-site-country">{site.country}</h3>
              <div className="client-site-flag" title={site.country}>
                <img
                  className="client-site-flag-img"
                  src={`https://flagcdn.com/w80/${String(site.flagCode).toLowerCase()}.png`}
                  srcSet={`https://flagcdn.com/w160/${String(site.flagCode).toLowerCase()}.png 2x`}
                  alt={`${site.country} flag`}
                  width={80}
                  height={60}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <p className="client-site-lead">
              {site.leadRole} — <strong>{site.leadName}</strong>
            </p>
            <dl className="client-site-metrics">
              <div>
                <dt>Local time</dt>
                <dd>{formatSiteLocalTime(nowTick, site.timeZone)}</dd>
              </div>
              <div>
                <dt>No. of active employees</dt>
                <dd>{site.employees != null ? site.employees : '—'}</dd>
              </div>
              <div>
                <dt>Operational efficiency</dt>
                <dd>{site.efficiency != null ? `${site.efficiency}%` : '—'}</dd>
              </div>
            </dl>
            <div className="client-site-ops">
              <div className="client-site-ops-row">
                <span>Quality</span>
                <strong>
                  {SITE_SNAPSHOT[site.id]?.quality != null ? `${SITE_SNAPSHOT[site.id].quality}%` : '—'}
                </strong>
              </div>
              <div className="client-site-ops-row">
                <span>On-time shipments</span>
                <strong>
                  {SITE_SNAPSHOT[site.id]?.onTime != null ? `${SITE_SNAPSHOT[site.id].onTime}%` : '—'}
                </strong>
              </div>
              <div className="client-site-ops-row">
                <span>Escalations (24h)</span>
                <strong>{SITE_SNAPSHOT[site.id]?.escalations ?? '—'}</strong>
              </div>
            </div>
            <p className="client-site-address">
              <span className="client-site-address-label">Address</span>
              {site.address}
            </p>
            <span className="client-site-open-hint">Building view →</span>
          </button>
          <a className="client-site-phone" href={`tel:${site.phoneTel}`}>
            <SitePhoneIcon />
            <span>{site.phoneDisplay}</span>
          </a>
        </article>
      ))}
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
              <div className="client-sites-snapshot-solo" aria-hidden="true">
                <SnapshotWordmark compact />
              </div>
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
              <div className="client-sites-grid">{siteList}</div>
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
          <div className="client-sites-snapshot-solo" aria-hidden="true">
            <SnapshotWordmark compact />
          </div>
        ) : (
          <div className="client-sites-snapshot client-sites-snapshot--left" aria-hidden="true">
            <SnapshotWordmark />
          </div>
        )}
        <div className="client-sites-section-head-copy">
          <h2 id="global-sites-title" className="client-sites-section-title">
            {company}
          </h2>
          <p className="client-sites-section-sub">{footprintBlurb}</p>
        </div>
        {isWorkspaceSingle ? null : (
          <div className="client-sites-snapshot client-sites-snapshot--right" aria-hidden="true">
            <SnapshotWordmark />
          </div>
        )}
      </div>
      <div className="client-sites-grid">{siteList}</div>
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
}) {
  const asideClass =
    variant === 'inset'
      ? 'client-overview-ai-alerts client-overview-ai-alerts--inset'
      : 'client-overview-ai-alerts client-overview-ai-alerts--ribbon'

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
  const useHenry1InsetAiAlerts = presetKey === 'henry1'
  const ctx = getDashboardContext(presetKey)
  const myHenryRecommendations = buildMyHenryRecommendations(user?.onboarding)
  const tenantLockup = ctx.clientBrand?.mode === 'tenant-lockup' ? ctx.clientBrand : null
  const activeProductTitles = titlesForProductIds(user.products)
  const greetName = displayNameFromEmail(user.email)
  const heading = TAB_HEADINGS[tab] || TAB_HEADINGS.dashboard
  const mainTitle = heading.title ?? user.company
  const mainSub =
    tab === 'locations' && ctx.locationsLeadSub ? ctx.locationsLeadSub : heading.sub ?? ctx.sub
  const footprintBlurb =
    ctx.footprintSub ||
    'Global footprint — site leadership, local time, headcount, and efficiency by region.'
  const clockLine = nowTick.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
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
    if ((tab === 'dashboard' || tab === 'locations') && filteredGlobalSites.length === 0) {
      setToast(`No sites match “${raw}”. Try another term or clear search.`)
      return
    }
    if (tab === 'lines' && filteredLines.length === 0) {
      setToast(`No lines match “${raw}”.`)
      return
    }
    if (tab === 'alerts' && visibleAlerts.length === 0) {
      setToast(`No alerts match “${raw}”. Try another word or clear search.`)
      return
    }
    setToast(
      tab === 'dashboard' || tab === 'locations'
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
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`client-nav-item${tab === item.id ? ' active' : ''}`}
              onClick={() => {
                if (routeBuildingSiteId) navigate('/')
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

        <main className={`client-main${buildingPageActive ? ' client-main--building-route' : ''}`}>
          {invalidBuildingRoute ? (
            <Navigate to="/" replace />
          ) : buildingPageActive ? (
            <BuildingSiteRouteShell
              key={`${routeBuildingSiteId}:${location.key}`}
              site={buildingSiteOnRoute}
              now={nowTick}
              onClose={closeBuilding}
              user={user}
            />
          ) : (
            <>
          <div className="client-main-header">
            <h1 className="client-main-title">{mainTitle}</h1>
            <p className="client-main-sub">{mainSub}</p>
          </div>

          {tab === 'dashboard' || tab === 'locations' ? (
            tab === 'dashboard' && useHenry1InsetAiAlerts && workspaceSites.length === 1 ? (
              <FootprintSitesSection
                workspaceSites={workspaceSites}
                filteredGlobalSites={filteredGlobalSites}
                company={user.company}
                footprintBlurb={footprintBlurb}
                searchQ={searchQ}
                nowTick={nowTick}
                onOpenBuilding={openBuilding}
                topAlerts={
                  <OverviewAiAlertsAside
                    variant="inset"
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
            ) : tab === 'dashboard' ? (
              <div className="client-sites-ribbon-wrap">
                <FootprintSitesSection
                  workspaceSites={workspaceSites}
                  filteredGlobalSites={filteredGlobalSites}
                  company={user.company}
                  footprintBlurb={footprintBlurb}
                  searchQ={searchQ}
                  nowTick={nowTick}
                  onOpenBuilding={openBuilding}
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
              />
            )
          ) : null}

          {tab === 'dashboard' ? (
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

          {tab === 'dashboard' ? (
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

          {tab === 'dashboard' && !onboard.hidden ? (
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

          {tab === 'dashboard' ? (
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

          {tab === 'lines' ? (
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

          {tab === 'alerts' ? (
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

          {tab === 'reports' ? (
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

          {tab === 'insights' ? (
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

          {tab === 'maintenance' ? (
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

          {tab === 'users' ? (
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

          {tab === 'account' ? (
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
        {NAV_ITEMS.filter((item) => !item.hideInDock).map((item) => (
          <button
            key={`dock-${item.id}`}
            type="button"
            className={`client-dock-item${tab === item.id ? ' is-active' : ''}`}
            onClick={() => {
              if (routeBuildingSiteId) navigate('/')
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
