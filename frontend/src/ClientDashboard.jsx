import { useCallback, useState, useEffect, useId, useRef, useMemo } from 'react'
import { matchPath, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { titlesForProductIds } from './productCatalog.js'
import henryLogo from './assets/henry-logo.png'
import { LogoSpreadLine } from './LogoSpreadLine.jsx'
import { getDashboardContext, resolveDashboardPresetKey } from './dashboard/registry.js'
import snapshotWordmarkWhite from './assets/snapshot-wordmark-white.png'
import harlandMedicalSystemsLogo from './assets/clients/harland-medical-systems-logo.png'
import HarlandJobCardMiniCharts from './HarlandJobCardMiniCharts.jsx'

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
const HARLAND_US_FLOOR_PLAN_SRC = `${import.meta.env.BASE_URL}site-floor-plan-us-v3.png`

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
    leadName: 'Sofia Navarro-Reyes',
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
          label: 'BU 125',
          pct: { left: 26, top: 22, width: 9, height: 18 },
          machinery: {
            title: 'BU 125',
            status: 'running',
            unitPanel: {
              unit: 'BU125',
              description: 'Machines Commercialization',
              manager: 'Dana Okonkwo',
              assistant: 'Priya Mehta',
              activeMachines: '9/10',
              activeOperators: '14',
              updatedAt: 'Timestamp',
              todaysOutput: '1,180 units',
              targetVsActual: '1,440 vs 1,180',
              cycleTime: '42 sec',
              throughput: '106 units/hr',
              focus: { x: 24, y: 44 },
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
          label: 'BU 120',
          pct: { left: 35, top: 22, width: 9, height: 18 },
          machinery: {
            title: 'BU 120',
            status: 'running',
            unitPanel: {
              unit: 'BU120',
              description: 'Machines Commercialization',
              manager: 'Leo Brennan',
              assistant: 'Hannah Cole',
              activeMachines: '7/10',
              activeOperators: '11',
              updatedAt: 'Timestamp',
              todaysOutput: '985 units',
              targetVsActual: '1,200 vs 985',
              cycleTime: '48 sec',
              throughput: '92 units/hr',
              focus: { x: 54, y: 50 },
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
          id: 'us-bu-140',
          label: 'BU 140',
          pct: { left: 75, top: 23, width: 9, height: 18 },
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
              focus: { x: 74, y: 46 },
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
      ],
    },
  },
  {
    id: 'ie',
    country: 'Ireland',
    flagCode: 'IE',
    flagEmoji: '🇮🇪',
    leadRole: 'Site Lead',
    leadName: 'Fiona O’Brien',
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
    leadName: 'Andrés Vega-Mora',
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

/** Matches reference boards: BU 120 / BU 125 job rows (description + status). */
const EXACT_JOBS_BY_BU = {
  '120': [
    { description: '528-COATER', status: 'Stable' },
    { description: '528-COATER', status: 'Moderate' },
    { description: '528-COATER', status: 'Stable' },
    { description: 'TTS1000', status: 'Stable' },
    { description: 'TTS1000', status: 'Critical' },
    { description: 'CUSTOM', status: 'Moderate' },
  ],
  '125': [
    { description: '528-COATER', status: 'Stable' },
    { description: '528-COATER', status: 'Stable' },
    { description: '528-COATER', status: 'Moderate' },
    { description: 'TTS1000', status: 'Critical' },
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
    return {
      id: `${digits}-${jobNum}`,
      title: `Job ${digits}-${jobNum}`,
      description: row.description,
      status: row.status,
    }
  })
}

function statusTone(status) {
  if (status === 'Critical') return 'critical'
  if (status === 'Moderate') return 'moderate'
  return 'stable'
}

function UnitJobsPanel({ user, unitLabel }) {
  const [jobTimeRange, setJobTimeRange] = useState('daily')
  const count = locationDrivenCardCount(user)
  const digits = digitsFromUnitLabel(unitLabel)
  const cards = unitJobsForPanel(unitLabel, count)
  return (
    <section className="client-unit-jobs-panel" aria-label={`BU ${digits} jobs`}>
      <header className="client-unit-jobs-head">
        <div className="client-unit-jobs-head-row1">
          <span className="client-unit-chip">{`BU ${digits}`}</span>
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
          <div className="client-unit-range" role="group" aria-label="Report range">
            {(['daily', 'weekly', 'monthly']).map((r) => (
              <button
                key={r}
                type="button"
                className={jobTimeRange === r ? 'is-active' : ''}
                aria-pressed={jobTimeRange === r}
                onClick={() => setJobTimeRange(r)}
              >
                {r === 'daily' ? 'Daily' : r === 'weekly' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="client-unit-jobs-grid">
        {cards.map((card) => (
          <article key={card.id} className="client-unit-job-card">
            <h4>{card.title}</h4>
            <p>{`Description: ${card.description}`}</p>
            <HarlandJobCardMiniCharts timeRange={jobTimeRange} />
            <div className="client-unit-job-meter">
              <span className={`client-unit-job-meter-fill tone-${statusTone(card.status)}`} />
            </div>
            <div className={`client-unit-job-status tone-${statusTone(card.status)}`}>{`Status: ${card.status}`}</div>
          </article>
        ))}
      </div>
    </section>
  )
}

function BuildingSitePageView({ site, zoneId, panelTab, now, onClose, onSelectZone, onSelectTab, user }) {
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
            <div className="client-bu-view">
              <aside className="client-bu-side">
                <button type="button" className="client-building-back" onClick={() => onSelectZone(null)}>
                  ← Back to home page
                </button>
                <h3 className="client-bu-title">Business Unit: {activeZone.machinery.unitPanel.unit}</h3>
                <div className="client-bu-text">
                  <p>
                    <strong>Description:</strong> {activeZone.machinery.unitPanel.description}
                  </p>
                  <p>
                    <strong>BU Manager:</strong> {activeZone.machinery.unitPanel.manager}
                  </p>
                  <p>
                    <strong>Assistant:</strong> {activeZone.machinery.unitPanel.assistant}
                  </p>
                  <p>
                    <strong>Real Time Status:</strong>
                  </p>
                  <ul>
                    <li>Current Status: {activeZone.machinery.status}</li>
                    <li>Active Machines: {activeZone.machinery.unitPanel.activeMachines}</li>
                    <li>Active Operators: {activeZone.machinery.unitPanel.activeOperators}</li>
                    <li>Last Updated: {activeZone.machinery.unitPanel.updatedAt}</li>
                  </ul>
                  <p>
                    <strong>Production Details:</strong>
                  </p>
                  <ul>
                    <li>Today&apos;s Output: {activeZone.machinery.unitPanel.todaysOutput}</li>
                    <li>Target vs Actual: {activeZone.machinery.unitPanel.targetVsActual}</li>
                    <li>Cycle Time (Avg): {activeZone.machinery.unitPanel.cycleTime}</li>
                    <li>Throughput: {activeZone.machinery.unitPanel.throughput}</li>
                  </ul>
                </div>
                <div className="client-bu-local">Local Time: {localLine}</div>
                <div className="client-bu-actions">
                  <span>Status</span>
                  <span>Safety</span>
                  <span>Security</span>
                </div>
              </aside>
              <div
                className={`client-bu-image-wrap${activeZone.machinery.unitPanel.powerBiEmbed?.reportUrl ? ' client-bu-image-wrap--analytics' : ''}`}
              >
                <UnitJobsPanel user={user} unitLabel={activeZone.machinery.unitPanel.unit.replace(/^BU\s*/i, '')} />
              </div>
            </div>
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
              <p className="client-building-tab-panel-text">{panelCopy}</p>
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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      if (buildingZoneId) setBuildingZoneId(null)
      else onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [buildingZoneId, onClose])

  return (
    <BuildingSitePageView
      site={site}
      zoneId={buildingZoneId}
      panelTab={buildingPanelTab}
      now={now}
      onClose={onClose}
      onSelectZone={setBuildingZoneId}
      onSelectTab={setBuildingPanelTab}
      user={user}
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
