import { useState } from 'react'
import locoLogo from '../assets/clients/loco-manufacturing-logo.jpeg'
import safetyPpe from '../assets/uploads/loco/safety/loco-safety-ppe.png'
import safetyForkliftLane from '../assets/uploads/loco/safety/loco-safety-forklift-lane.png'
import safetyMachineGuard from '../assets/uploads/loco/safety/loco-safety-machine-guard.png'
import safetySpillHazard from '../assets/uploads/loco/safety/loco-safety-spill-hazard.png'
import safetyEmergencyExit from '../assets/uploads/loco/safety/loco-safety-emergency-exit.png'

import securityUnauthorizedEntry from '../assets/uploads/loco/security/loco-security-unauthorized-entry.png'
import securityAfterHours from '../assets/uploads/loco/security/loco-security-after-hours.png'
import securityPerimeterMotion from '../assets/uploads/loco/security/loco-security-perimeter-motion.png'
import securityGateAccess from '../assets/uploads/loco/security/loco-security-gate-access.png'
import securityRestrictedVehicle from '../assets/uploads/loco/security/loco-security-restricted-vehicle.png'

import systemsHvac from '../assets/uploads/loco/systems/loco-systems-hvac.png'
import systemsElectricalPanel from '../assets/uploads/loco/systems/loco-systems-electrical-panel.png'
import systemsWaterPump from '../assets/uploads/loco/systems/loco-systems-water-pump.png'
import systemsConveyorControl from '../assets/uploads/loco/systems/loco-systems-conveyor-control.png'
import systemsBackupGenerator from '../assets/uploads/loco/systems/loco-systems-backup-generator.png'

import statusAssemblyLine from '../assets/uploads/loco/status/loco-status-assembly-line.png'
import statusRoboticsCell from '../assets/uploads/loco/status/loco-status-robotics-cell.png'
import statusPaintShopConveyor from '../assets/uploads/loco/status/loco-status-paint-shop-conveyor.png'
import statusWeldingStation from '../assets/uploads/loco/status/loco-status-welding-station.png'
import statusFinalInspection from '../assets/uploads/loco/status/loco-status-final-inspection.png'

const TAB_ITEMS = [
  { id: 'safety', label: 'Safety' },
  { id: 'security', label: 'Security' },
  { id: 'systems', label: 'Systems' },
  { id: 'status', label: 'Status' },
]

const KPI_DATA = {
  status: [
    { label: 'Output Score', value: '92%', sub: 'Excellent' },
    { label: 'Production Output', value: '72%', sub: 'On Target' },
    { label: 'Downtime', value: '1.2 hrs', sub: 'Today' },
    { label: 'Quality Yield', value: '98.1%', sub: 'Stable' },
    { label: 'Open Issues', value: '2', sub: 'Requires Attention' },
  ],
  safety: [
    { label: 'Safety Score', value: '92%', sub: 'Excellent' },
    { label: 'Total Observations', value: '24', sub: 'Today' },
    { label: 'Violations', value: '3', sub: 'Today' },
    { label: 'Open Actions', value: '5', sub: 'Requires Attention' },
    { label: 'Areas Inspected', value: '11 / 14', sub: '79% of total areas' },
  ],
  security: [
    { label: 'Security Score', value: '94%', sub: 'Excellent' },
    { label: 'Total Events', value: '18', sub: 'Today' },
    { label: 'High Severity', value: '3', sub: 'Today' },
    { label: 'Open Investigations', value: '4', sub: 'Requires Attention' },
    { label: 'Cameras Online', value: '46 / 48', sub: '96% Online' },
  ],
  systems: [
    { label: 'System Health', value: '89%', sub: 'Stable' },
    { label: 'Total Alerts', value: '15', sub: 'Today' },
    { label: 'Critical Issues', value: '2', sub: 'Today' },
    { label: 'Open Work Orders', value: '6', sub: 'Requires Attention' },
    { label: 'Systems Online', value: '7 / 8', sub: '88% available' },
  ],
}

const CARD_DATA = {
  status: [
    {
      badge: 'On Target',
      title: 'Assembly Line 2',
      location: 'Body Shop',
      time: '8:12 AM',
      detail: 'Line running at expected takt time with stable quality yield.',
      risk: 'Normal',
      status: 'Operational',
      image: statusAssemblyLine,
    },
    {
      badge: 'Monitoring',
      title: 'Robotics Cell 3',
      location: 'Robotics Zone',
      time: '9:38 AM',
      detail: 'Minor cycle-time variation detected during operation.',
      risk: 'Medium Priority',
      status: 'Monitoring',
      image: statusRoboticsCell,
    },
    {
      badge: 'At Risk',
      title: 'Paint Shop Conveyor',
      location: 'Paint Shop',
      time: '10:15 AM',
      detail: 'Conveyor variance above normal threshold.',
      risk: 'High Priority',
      status: 'Review Needed',
      image: statusPaintShopConveyor,
    },
    {
      badge: 'Delayed',
      title: 'Welding Station 4',
      location: 'Welding Bay',
      time: '11:05 AM',
      detail: 'Station output below expected cycle rate due to equipment calibration delay.',
      risk: 'Medium Priority',
      status: 'Attention Required',
      image: statusWeldingStation,
    },
    {
      badge: 'Resolved',
      title: 'Final Inspection Line',
      location: 'Quality Control',
      time: '11:42 AM',
      detail: 'Earlier inspection backlog cleared and line performance returned to normal.',
      risk: 'Low Priority',
      status: 'Operational',
      image: statusFinalInspection,
    },
  ],
  safety: [
    {
      badge: 'Safe',
      title: 'PPE Compliance',
      location: 'Body Shop - Line 2',
      time: '8:12 AM',
      detail: 'Operator wearing all required PPE correctly.',
      risk: 'Low Risk',
      status: 'Safe',
      image: safetyPpe,
    },
    {
      badge: 'Warning',
      title: 'Forklift Lane Obstruction',
      location: 'Material Handling - Aisle 4',
      time: '9:05 AM',
      detail: 'Pallet left in forklift lane partially blocking path.',
      risk: 'Medium Risk',
      status: 'In Progress',
      image: safetyForkliftLane,
    },
    {
      badge: 'Violation',
      title: 'Machine Guard Removed',
      location: 'Robotics Cell 3',
      time: '9:38 AM',
      detail: 'Guard removed during operation without lockout/tagout.',
      risk: 'High Risk',
      status: 'Open',
      image: safetyMachineGuard,
    },
    {
      badge: 'Warning',
      title: 'Spill Hazard',
      location: 'Assembly Area - Bay 7',
      time: '10:15 AM',
      detail: 'Hydraulic fluid spill on floor not cleaned up.',
      risk: 'Medium Risk',
      status: 'In Progress',
      image: safetySpillHazard,
    },
    {
      badge: 'Safe',
      title: 'Emergency Exit Clear',
      location: 'Paint Shop - Exit B',
      time: '10:42 AM',
      detail: 'Exit path clear and unobstructed. Signage visible.',
      risk: 'Low Risk',
      status: 'Resolved',
      image: safetyEmergencyExit,
    },
  ],
  security: [
    {
      badge: 'High',
      title: 'Unauthorized Entry Attempt',
      location: 'Gate 3 - North Entrance',
      time: '5:42 AM',
      detail: 'Access attempt by unknown individual without badge.',
      risk: 'High Severity',
      status: 'Investigating',
      image: securityUnauthorizedEntry,
    },
    {
      badge: 'Medium',
      title: 'After Hours Movement',
      location: 'Assembly Line B',
      time: '2:18 AM',
      detail: 'Motion detected in production area outside operating hours.',
      risk: 'Medium Severity',
      status: 'Under Review',
      image: securityAfterHours,
    },
    {
      badge: 'Low',
      title: 'Perimeter Motion',
      location: 'East Perimeter',
      time: '1:06 AM',
      detail: 'Motion detected along east perimeter fence line.',
      risk: 'Low Severity',
      status: 'Closed',
      image: securityPerimeterMotion,
    },
    {
      badge: 'Medium',
      title: 'Gate Access Exception',
      location: 'Shipping Entrance',
      time: '12:44 AM',
      detail: 'Badge used outside of normal access schedule.',
      risk: 'Medium Severity',
      status: 'Escalated',
      image: securityGateAccess,
    },
    {
      badge: 'High',
      title: 'Vehicle in Restricted Zone',
      location: 'Paint Shop Area',
      time: '11:58 PM',
      detail: 'Unregistered vehicle detected in restricted production zone.',
      risk: 'High Severity',
      status: 'Investigating',
      image: securityRestrictedVehicle,
    },
  ],
  systems: [
    {
      badge: 'Healthy',
      title: 'HVAC Performance',
      location: 'Rooftop Zone',
      time: '6:12 AM',
      detail: 'Cooling systems operating within normal parameters.',
      risk: 'Normal',
      status: 'Healthy',
      image: systemsHvac,
    },
    {
      badge: 'Warning',
      title: 'Electrical Control Panel',
      location: 'Main Utility Room',
      time: '5:58 AM',
      detail: 'Minor voltage fluctuations detected on Panel B.',
      risk: 'Medium Priority',
      status: 'Monitoring',
      image: systemsElectricalPanel,
    },
    {
      badge: 'Healthy',
      title: 'Water Pump System',
      location: 'Basement Plant Room',
      time: '5:33 AM',
      detail: 'Pump cycle performance within normal range.',
      risk: 'Normal',
      status: 'Healthy',
      image: systemsWaterPump,
    },
    {
      badge: 'Warning',
      title: 'Conveyor Control System',
      location: 'Assembly Line 2',
      time: '4:47 AM',
      detail: 'Conveyor 2 speed variance above normal threshold.',
      risk: 'Medium Priority',
      status: 'In Progress',
      image: systemsConveyorControl,
    },
    {
      badge: 'Critical',
      title: 'Backup Generator',
      location: 'Service Yard',
      time: '4:05 AM',
      detail: 'Generator 2 in maintenance mode during load testing.',
      risk: 'High Priority',
      status: 'Maintenance',
      image: systemsBackupGenerator,
    },
  ],
}

function getBadgeClass(badge) {
  const b = String(badge || '').toLowerCase()
  if (b.includes('safe') || b.includes('healthy') || b.includes('target')) return 'loco-detail-badge--good'
  if (b.includes('warning') || b.includes('medium') || b.includes('monitoring')) return 'loco-detail-badge--warn'
  if (b.includes('critical') || b.includes('violation') || b.includes('high') || b.includes('risk')) {
    return 'loco-detail-badge--bad'
  }
  return 'loco-detail-badge--neutral'
}

export default function LocoPlantDetailPage({ companyName = 'LOCO MANUFACTURING, INC.', nowTick }) {
  const [tab, setTab] = useState('safety')
  const tick = nowTick ?? new Date()

  const today = tick.toLocaleDateString(undefined, { dateStyle: 'long' })
  const time = tick.toLocaleTimeString(undefined, {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const title =
    tab === 'safety'
      ? 'Safety Dashboard'
      : tab === 'security'
        ? 'Security Dashboard'
        : tab === 'systems'
          ? 'Systems Dashboard'
          : 'Status Dashboard'

  return (
    <div className="loco-detail">
      <header className="loco-detail-top">
        <div className="loco-detail-brand">
          <img className="loco-detail-logo-img" src={locoLogo} alt="Loco Manufacturing" />
          <div>
            <strong>{companyName}</strong>
            <span>Northline Assembly Plant | PLT 102</span>
          </div>
        </div>

        <div className="loco-detail-title">
          <h1>{title}</h1>
          <p>Northline Assembly Plant &nbsp; | &nbsp; PLT 102</p>
        </div>

        <div className="loco-detail-time">
          <div>
            <span>Today&apos;s Date</span>
            <strong>{today}</strong>
          </div>
          <div>
            <span>Local Time</span>
            <strong>{time}</strong>
          </div>
        </div>
      </header>

      <div className="loco-detail-body">
        <aside className="loco-detail-side">
          <a className="loco-detail-back" href="/loco">
            ← Back to overview
          </a>

          <section className="loco-detail-side-card">
            <h2>Plant Details</h2>
            <p className="loco-detail-k">Plant</p>
            <strong>Northline Assembly Plant</strong>

            <p className="loco-detail-k">Plant Code</p>
            <strong>PLT 102</strong>

            <p className="loco-detail-k">Description</p>
            <p>Automotive assembly and robotics production line</p>

            <p className="loco-detail-k">Plant Manager</p>
            <strong>Sarah Coleman</strong>

            <p className="loco-detail-k">Lead</p>
            <strong>
              {tab === 'safety'
                ? 'David Parker'
                : tab === 'security'
                  ? 'Angela Ruiz'
                  : tab === 'systems'
                    ? 'Michael Chen'
                    : 'Sarah Coleman'}
            </strong>
          </section>

          <section className="loco-detail-side-card">
            <h2>{tab.charAt(0).toUpperCase() + tab.slice(1)} Summary</h2>
            {KPI_DATA[tab].slice(1).map((item) => (
              <div className="loco-detail-side-row" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </section>

          <div className="loco-detail-local-time">
            Local Time: {tick.toLocaleDateString(undefined, {
              timeZone: 'America/New_York',
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}, {tick.toLocaleTimeString(undefined, {
              timeZone: 'America/New_York',
              hour: 'numeric',
              minute: '2-digit',
              timeZoneName: 'short',
            })}
          </div>
        </aside>

        <main className="loco-detail-main">
          <nav className="loco-detail-tabs-top" aria-label="Plant dashboard tabs">
            {TAB_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={tab === item.id ? 'is-active' : ''}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <section className="loco-detail-kpis">
            {KPI_DATA[tab].map((item) => (
              <article className="loco-detail-kpi" key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.sub}</p>
              </article>
            ))}
          </section>

          <section className="loco-detail-events">
            <div className="loco-detail-section-head">
              <h2>
                {tab === 'safety'
                  ? 'Safety Observations'
                  : tab === 'security'
                    ? 'Latest Security Events'
                    : tab === 'systems'
                      ? 'Systems Status'
                      : 'Production Status'}{' '}
                (Today)
              </h2>
              <button type="button">View All</button>
            </div>

            <div className="loco-detail-card-grid">
              {CARD_DATA[tab].map((item) => (
                <article className="loco-detail-card" key={item.title}>
                  <div
                    className="loco-detail-card-img"
                    style={item.image ? { backgroundImage: `linear-gradient(135deg, rgba(3, 16, 39, .2), rgba(82, 196, 26, .2)), url(${item.image})` } : undefined}
                  >
                    <span className={`loco-detail-badge ${getBadgeClass(item.badge)}`}>{item.badge}</span>
                  </div>
                  <div className="loco-detail-card-body">
                    <h3>{item.title}</h3>
                    <p className="loco-detail-card-meta">
                      📍 {item.location} <span>{item.time}</span>
                    </p>
                    <p>{item.detail}</p>
                    <div className="loco-detail-card-foot">
                      <span>{item.risk}</span>
                      <strong>Status: {item.status}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="loco-detail-bottom-metrics">
            <div>
              <span>Active Cameras / Systems</span>
              <strong>{tab === 'security' ? '46 / 48' : tab === 'systems' ? '8' : '4'}</strong>
            </div>
            <div>
              <span>Open Corrective Actions</span>
              <strong>{tab === 'safety' ? '5' : '3'}</strong>
            </div>
            <div>
              <span>Inspections Completed</span>
              <strong>{tab === 'systems' ? '9' : '16'}</strong>
            </div>
            <div>
              <span>Avg Response Time</span>
              <strong>{tab === 'safety' ? '2h 15m' : '3m 42s'}</strong>
            </div>
            <div>
              <span>Open Incidents</span>
              <strong>{tab === 'security' ? '3' : '2'}</strong>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}