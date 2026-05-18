import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AVIORA_PROPERTY_DETAILS } from './avioraPropertyDetailData.js'
import AvioraPropertySnapshot from './AvioraPropertySnapshot.jsx'
import AvioraSafetySecurityDashboard from './AvioraSafetySecurityDashboard.jsx'
import FactoryPulseChartsPanel from '../FactoryPulseChartsPanel.jsx'

/** @param {{ label: string; value: string }[]} rows */
function realtimeColumns(rows) {
  const filtered = rows.filter((r) => !/overall completion/i.test(r.label))
  const left = []
  const right = []
  /** @type {{ label: string; value: string } | null} */
  let day = null
  for (const r of filtered) {
    const l = r.label.toLowerCase()
    if (l.startsWith('day')) {
      day = r
      continue
    }
    const toRight = l.includes('delayed') || l.includes('at risk')
    if (toRight) right.push(r)
    else left.push(r)
  }
  return { left, right, day }
}

/** @param {{ label: string; value: string }[]} rows */
function constructionColumns(rows) {
  const mid = Math.ceil(rows.length / 2)
  return { left: rows.slice(0, mid), right: rows.slice(mid) }
}

/** @param {string} label */
function metricValueTone(label) {
  const l = label.toLowerCase()
  if (l.includes('at risk') && l.includes('delayed')) return 'bad'
  if (l.includes('delayed')) return 'bad'
  if (l.includes('at risk')) return 'warn'
  return undefined
}

function IconHardHat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M2 18h20v2H2v-2zM4.5 18V9.5C4.5 6.5 7 4 10.5 4h3C17 4 19.5 6.5 19.5 9.5V18" strokeLinecap="round" />
      <path d="M9 14h6M10 10h4" strokeLinecap="round" />
    </svg>
  )
}

function IconTrend() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <path d="M4 18V6M9 18V10M14 18v-8M19 18v-12" strokeLinecap="round" />
    </svg>
  )
}

function IconBuilding() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M4 21V8l8-4v17M12 21V12h5v9M9 14h2M9 17h2M16 14h2M16 17h2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPackage() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeLinejoin="round" />
      <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeLinejoin="round" />
    </svg>
  )
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" />
    </svg>
  )
}

/** Bar chart — reference Status control */
function IconBar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" strokeLinecap="round" />
    </svg>
  )
}

function IconWrench() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-5 5a2 2 0 0 0 2.8 2.8l5-5a4 4 0 0 0 5.4-5.4l-1.5-1.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconBuildingCog() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 21V8l8-4v17M12 21V12h5v9M9 14h2M9 17h2M16 14h2M16 17h2" />
      <circle cx="18" cy="6" r="2.2" />
      <path d="M18 4.2v.65M18 7.15v.65M16.35 6h-.55M20.2 6h-.55M17.1 4.9l.4.4M18.5 6.3l.4.4M18.5 4.9l-.4.4M17.1 6.3l-.4.4" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l8 4v6c0 5-3.4 9.8-8 11-4.6-1.2-8-6-8-11V6l8-4z" opacity="0.92" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  )
}

/** @param {{ icon: unknown; title: string }} props */
function SideSectionHead({ icon, title }) {
  return (
    <div className="aviora-prop-side-head">
      <span className="aviora-prop-side-slot aviora-prop-side-slot--ic">{icon}</span>
      <h2 className="aviora-prop-side-h">{title}</h2>
    </div>
  )
}

/** @param {{ label: string; value: string }} props */
function StatRow({ label, value }) {
  const tone = metricValueTone(label)
  return (
    <div className="aviora-prop-stat-row">
      <span className="aviora-prop-stat-l">{label}</span>
      <strong className={`aviora-prop-stat-v${tone ? ` aviora-prop-stat-v--${tone}` : ''}`}>{value}</strong>
    </div>
  )
}

/** @param {{ label: string; value: string }} props */
function DayProgressRow({ label, value }) {
  const m = String(value).match(/(\d+)\s*of\s*(\d+)/i)
  if (!m) return <StatRow label={label} value={value} />
  const cur = Number(m[1])
  const total = Number(m[2])
  const pct = total > 0 ? Math.min(100, Math.round((cur / total) * 100)) : 0
  return (
    <div className="aviora-prop-stat-row aviora-prop-stat-row--day">
      <span className="aviora-prop-stat-l">{label}</span>
      <strong className="aviora-prop-stat-v">{value}</strong>
      <div className="aviora-prop-day-track" aria-hidden="true">
        <div className="aviora-prop-day-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** @param {{ label: string; portfolioTone: string }} props */
function CurrentStatusLine({ label, portfolioTone }) {
  const toneClass =
    portfolioTone === 'operational' ? 'ok' : portfolioTone === 'monitoring' ? 'warn' : portfolioTone === 'risk' ? 'recovery' : 'neutral'
  return (
    <p className="aviora-prop-current-status">
      Current Status:{' '}
      <strong className={`aviora-prop-current-status-val aviora-prop-current-status-val--${toneClass}`}>
        <span className="aviora-prop-status-pulse" aria-hidden="true" />
        {label}
      </strong>
    </p>
  )
}

function ShipStatusIcon({ status }) {
  if (status === 'onTrack') {
    return (
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <circle cx="10" cy="10" r="9" fill="#dcfce7" stroke="#16a34a" strokeWidth="1.5" />
        <path d="M6 10.5l2.2 2.2L14 7.5" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (status === 'atRisk') {
    return (
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <path d="M10 3.5 17 16H3L10 3.5z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8v4M10 14.5v.5" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
      <rect x="2.5" y="4" width="15" height="13" rx="2" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.3" />
      <path d="M2.5 8h15M6.5 2.5v3M13.5 2.5v3" stroke="#7c3aed" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

function VarianceArrow({ direction }) {
  if (direction === 'up') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M8 13V4M4.5 7.5 8 4l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (direction === 'down') {
    return (
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path d="M8 3v9M4.5 8.5 8 12l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return <span aria-hidden="true">—</span>
}

function pkgShipLabel(status) {
  if (status === 'onTrack') return 'On Track'
  if (status === 'atRisk') return 'At Risk'
  return 'Delayed'
}

function pkgTone(status) {
  if (status === 'onTrack') return 'ok'
  if (status === 'atRisk') return 'warn'
  return 'bad'
}

function pkgCompletionTone(pct) {
  if (pct >= 75) return 'stable'
  if (pct >= 45) return 'moderate'
  return 'critical'
}

function parseVariance(text) {
  const t = String(text || '').replace(/\u2212/g, '-')
  if (/ahead|early/i.test(t)) {
    const primary = t.replace(/\s*(ahead|early)\s*/i, '').trim() || t
    return { dir: 'up', primary, label: 'Ahead' }
  }
  if (/behind|late/i.test(t)) return { dir: 'down', primary: t, label: 'Behind' }
  return { dir: 'flat', primary: t || '0 days', label: 'On Time' }
}

function PackageCard({ pkg }) {
  const tone = pkgCompletionTone(pkg.pct)
  const ship = pkgTone(pkg.status)
  const tv = parseVariance(pkg.timeVariance)
  const barClass = ship === 'ok' ? 'aviora-prop-pkg-bar--ok' : ship === 'warn' ? 'aviora-prop-pkg-bar--warn' : 'aviora-prop-pkg-bar--bad'

  return (
    <article className="aviora-prop-pkg aviora-prop-pkg--v2">
      <div className="aviora-prop-pkg-body">
        <div className="aviora-prop-pkg-photo">
          <span className="aviora-prop-pkg-num">{pkg.num}</span>
          <img
            src={pkg.image}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ objectPosition: pkg.imageFocus ?? 'center' }}
          />
        </div>
        <div className="aviora-prop-pkg-content">
          <div className="aviora-prop-pkg-intro">
            <div className="aviora-prop-pkg-titles">
              <h3 className="aviora-prop-pkg-name">{pkg.title}</h3>
              <p className="aviora-prop-pkg-sub">{pkg.subtitle}</p>
            </div>
            <span className={`aviora-prop-pkg-ship aviora-prop-pkg-ship--${ship}`}>
              <ShipStatusIcon status={pkg.status} />
              <strong>{pkgShipLabel(pkg.status)}</strong>
            </span>
          </div>
          <div className="aviora-prop-pkg-tiles">
            <div className="aviora-prop-pkg-tile">
              <span className="aviora-prop-pkg-metric-label">Percent Complete</span>
              <span className={`aviora-prop-pkg-pct aviora-prop-pkg-pct--${tone}`}>{`${pkg.pct}%`}</span>
            </div>
            <div className="aviora-prop-pkg-tile">
              <span className="aviora-prop-pkg-metric-label">Ship Status</span>
              <span className={`aviora-prop-pkg-ship-inline aviora-prop-pkg-ship--${ship}`}>
                <ShipStatusIcon status={pkg.status} />
                <strong>{pkgShipLabel(pkg.status)}</strong>
              </span>
            </div>
            <div className="aviora-prop-pkg-tile">
              <span className="aviora-prop-pkg-metric-label">Time Variance</span>
              <span
                className={`aviora-prop-pkg-variance aviora-prop-pkg-variance--${tv.dir === 'up' ? 'ok' : tv.dir === 'down' ? 'bad' : 'neutral'}`}
              >
                <VarianceArrow direction={tv.dir} />
                <strong>{tv.primary}</strong>
              </span>
              <span className="aviora-prop-pkg-variance-sub">{tv.label}</span>
            </div>
            <div className="aviora-prop-pkg-tile">
              <span className="aviora-prop-pkg-metric-label">Days Remaining</span>
              <span className="aviora-prop-pkg-days">
                <CalendarIcon />
                <strong>{pkg.daysLeft}</strong>
              </span>
              <span className="aviora-prop-pkg-days-sub">days left</span>
            </div>
          </div>
        </div>
      </div>
      <footer className="aviora-prop-pkg-foot">
        <span className="aviora-prop-pkg-foot-label">Build Progress</span>
        <div className="aviora-prop-pkg-bar-track" aria-hidden="true">
          <div className={`aviora-prop-pkg-bar-fill ${barClass}`} style={{ width: `${pkg.pct}%` }} />
        </div>
        <span className={`aviora-prop-pkg-foot-pct aviora-prop-pkg-foot-pct--${tone}`}>{`${pkg.pct}%`}</span>
      </footer>
    </article>
  )
}

function PropertyStatusPanel({ packages }) {
  return (
    <div className="aviora-prop-status-panel">
      <div className="aviora-prop-grid">
        {packages.map((pkg) => (
          <PackageCard key={pkg.num} pkg={pkg} />
        ))}
      </div>
    </div>
  )
}

function personInitials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function PersonRow({ label, person }) {
  return (
    <div className="aviora-prop-info-line aviora-prop-info-line--person">
      <span className="aviora-prop-side-slot aviora-prop-side-slot--avatar">
        <span className="aviora-prop-person-avatar">
          {person.photo ? (
            <img src={person.photo} alt="" loading="lazy" decoding="async" style={{ objectPosition: person.photoFocus ?? 'center' }} />
          ) : (
            <span className="aviora-prop-person-initials" aria-hidden="true">
              {personInitials(person.name)}
            </span>
          )}
        </span>
      </span>
      <div className="aviora-prop-info-body">
        <strong className="aviora-prop-info-person-name">{person.name}</strong>
        <span className="aviora-prop-info-k">{label}</span>
      </div>
    </div>
  )
}

/**
 * @param {{ propertyId: string; companyName: string; nowTick?: Date }} props
 */
export default function AvioraPropertyDetailPage({ propertyId, companyName, nowTick }) {
  const d = AVIORA_PROPERTY_DETAILS[propertyId]
  const [period, setPeriod] = useState('daily')
  const [propView, setPropView] = useState(/** @type {'status' | 'safety' | 'security' | 'systems'} */ ('safety'))
  const tick = nowTick ?? new Date()
  const today = tick.toLocaleDateString(undefined, { dateStyle: 'long' })
  const time = tick.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  const sidebarToneClass =
    d.portfolioTone === 'operational'
      ? 'aviora-prop-side--ok'
      : d.portfolioTone === 'monitoring'
        ? 'aviora-prop-side--warn'
        : 'aviora-prop-side--risk'

  const clockLine = tick.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  if (!d) return null

  const rt = realtimeColumns(d.realtime)
  const co = constructionColumns(d.construction)
  const bullets = d.deliveryBullets || []
  const deliveryLeft = bullets.filter((b) => b.tone !== 'bad')
  const deliveryRight = bullets.filter((b) => b.tone === 'bad')
  const footOk = /on track|monitoring|watch/i.test(String(d.deliveryFoot || ''))

  return (
    <div className="aviora-prop" aria-label={`Property ${d.name}`}>
      <header className="aviora-prop-top">
        <div className="aviora-prop-top-brand">
          <span className="aviora-prop-logo" aria-hidden="true">
            A
          </span>
          <span className="aviora-prop-brand-text">{companyName}</span>
        </div>
        <div className="aviora-prop-top-center">
          <h1 className="aviora-prop-page-title">
            Property: {d.name}
            <span className="aviora-prop-code">{d.code}</span>
          </h1>
          <div className="aviora-prop-period" role="tablist" aria-label="Reporting period">
            {['daily', 'weekly', 'monthly'].map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={period === id}
                className={`aviora-prop-period-btn${period === id ? ' aviora-prop-period-btn--active' : ''}`}
                onClick={() => setPeriod(id)}
              >
                {id === 'daily' ? 'Daily' : id === 'weekly' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>
        <div className="aviora-prop-top-meta">
          <div className="aviora-prop-meta-item">
            <span className="aviora-prop-meta-ico" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
                />
              </svg>
            </span>
            <div>
              <span className="aviora-prop-meta-lab">Today&apos;s Date</span>
              <strong>{today}</strong>
            </div>
          </div>
          <div className="aviora-prop-meta-item">
            <span className="aviora-prop-meta-ico" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                />
              </svg>
            </span>
            <div>
              <span className="aviora-prop-meta-lab">Local Time</span>
              <strong>{time}</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="aviora-prop-body">
        <aside className={`aviora-prop-side ${sidebarToneClass}`}>
          <Link className="aviora-prop-back" to="/">
            ← Back to portfolio overview
          </Link>

          <div className="aviora-prop-side-shell">
            <div className="aviora-prop-side-sheet">
              <div className="aviora-prop-side-sheet-scroll">
                <div className="aviora-prop-side-section aviora-prop-side-section--lead">
                  <div className="aviora-prop-side-banner">Property: {d.name}</div>
                  <div className="aviora-prop-side-panel-body">
                    <div
                      className={`aviora-prop-side-profile-split${d.heroImage ? '' : ' aviora-prop-side-profile-split--no-photo'}`}
                    >
                      {d.heroImage ? (
                        <div className="aviora-prop-side-hero">
                          <img src={d.heroImage} alt="" loading="lazy" decoding="async" />
                        </div>
                      ) : null}
                      <div className="aviora-prop-side-profile-copy">
                        <div className="aviora-prop-side-profile-stack">
                          <div className="aviora-prop-info-line aviora-prop-info-line--desc">
                            <span className="aviora-prop-side-slot aviora-prop-side-slot--ic" aria-hidden="true">
                              <IconBuilding />
                            </span>
                            <div className="aviora-prop-info-body">
                              <span className="aviora-prop-info-k">Description</span>
                              <p className="aviora-prop-info-v">{d.description}</p>
                            </div>
                          </div>
                          <PersonRow label="Project Manager" person={d.projectManager} />
                          <PersonRow label="Site Engineer" person={d.siteEngineer} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="aviora-prop-side-section aviora-prop-side-section--realtime">
                  <SideSectionHead icon={<IconTrend />} title="Real-Time Status" />
                  <div className="aviora-prop-rt-split">
                    <CurrentStatusLine label={d.currentStatusLabel} portfolioTone={d.portfolioTone} />
                    <div className="aviora-prop-col">
                      {rt.left.map((row) => (
                        <StatRow key={row.label} label={row.label} value={row.value} />
                      ))}
                    </div>
                    <div className="aviora-prop-col">
                      {rt.right.map((row) => (
                        <StatRow key={row.label} label={row.label} value={row.value} />
                      ))}
                    </div>
                    {rt.day ? <DayProgressRow label={rt.day.label} value={rt.day.value} /> : null}
                  </div>
                </div>

                <div className="aviora-prop-side-section">
                  <SideSectionHead icon={<IconBuildingCog />} title="Construction Overview" />
                  <div className="aviora-prop-cols2 aviora-prop-cols2--split">
                    <div className="aviora-prop-col">
                      {co.left.map((row) => (
                        <StatRow key={row.label} label={row.label} value={row.value} />
                      ))}
                    </div>
                    <div className="aviora-prop-col">
                      {co.right.map((row) => (
                        <StatRow key={row.label} label={row.label} value={row.value} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="aviora-prop-side-section">
                  <SideSectionHead icon={<IconPackage />} title="Delivery Outlook" />
                  <div className="aviora-prop-cols2 aviora-prop-cols2--delivery aviora-prop-cols2--split">
                    <div className="aviora-prop-col">
                      {deliveryLeft.map((b) => (
                        <div key={b.text} className="aviora-prop-delivery-inline">
                          <span className={`aviora-prop-delivery-dot aviora-prop-delivery-dot--${b.tone}`} aria-hidden="true" />
                          <span>{b.text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="aviora-prop-col">
                      {deliveryRight.map((b) => (
                        <div key={b.text} className="aviora-prop-delivery-inline">
                          <span className={`aviora-prop-delivery-dot aviora-prop-delivery-dot--${b.tone}`} aria-hidden="true" />
                          <span>{b.text}</span>
                        </div>
                      ))}
                      {d.deliveryFoot ? (
                        <p className={`aviora-prop-delivery-foot${footOk ? ' aviora-prop-delivery-foot--ok' : ''}`}>{d.deliveryFoot}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="aviora-prop-side-section aviora-prop-side-section--snap">
                  <SideSectionHead icon={<IconEye />} title="Visual Snapshot" />
                  <AvioraPropertySnapshot snap={d.snapshot} />
                </div>
              </div>

              <div className="aviora-prop-side-sheet-foot">
                <p className="aviora-prop-side-clock">
                  <span className="aviora-prop-side-clock-ic" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>
                    <span className="aviora-prop-side-clock-k">Local Time:</span> {clockLine}
                  </span>
                </p>
                <nav className="aviora-prop-viewnav" role="tablist" aria-label="Property workspace">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={propView === 'status'}
                    className={`aviora-prop-cta aviora-prop-cta--status${propView === 'status' ? ' is-active' : ''}`}
                    onClick={() => setPropView('status')}
                  >
                    <IconWrench />
                    Status
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={propView === 'safety'}
                    className={`aviora-prop-cta aviora-prop-cta--safety${propView === 'safety' ? ' is-active' : ''}`}
                    onClick={() => setPropView('safety')}
                  >
                    <IconShield />
                    Safety
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={propView === 'security'}
                    className={`aviora-prop-cta aviora-prop-cta--security${propView === 'security' ? ' is-active' : ''}`}
                    onClick={() => setPropView('security')}
                  >
                    <IconLock />
                    Security
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={propView === 'systems'}
                    className={`aviora-prop-cta aviora-prop-cta--systems${propView === 'systems' ? ' is-active' : ''}`}
                    onClick={() => setPropView('systems')}
                  >
                    <IconBuildingCog />
                    Systems
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </aside>

        <div
          className={`aviora-prop-main${
            propView === 'safety' || propView === 'security'
              ? ' aviora-prop-main--hub'
              : propView === 'status'
                ? ' aviora-prop-main--status'
                : ''
          }`}
        >
          {propView === 'status' ? (
            <PropertyStatusPanel packages={d.packages} />
          ) : propView === 'systems' ? (
            <FactoryPulseChartsPanel heading={`Systems — ${d.name}`} />
          ) : (
            <AvioraSafetySecurityDashboard
              key={`${propertyId}-${propView}`}
              propertyId={propertyId}
              companyName={companyName}
              nowTick={nowTick}
              layout="embedded"
              initialMode={propView === 'security' ? 'security' : 'safety'}
              onOpenStatus={() => setPropView('status')}
              onOpenSystems={() => setPropView('systems')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
