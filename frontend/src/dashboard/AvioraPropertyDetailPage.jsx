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
  for (const r of filtered) {
    const l = r.label.toLowerCase()
    const toRight = l.startsWith('day') || l.includes('delayed') || l.includes('at risk')
    if (toRight) right.push(r)
    else left.push(r)
  }
  return { left, right }
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
      <span className="aviora-prop-side-h-ic">{icon}</span>
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

function StatusBadge({ status }) {
  if (status === 'onTrack') {
    return (
      <span className="aviora-prop-pkg-badge aviora-prop-pkg-badge--ok">
        <span aria-hidden="true">✓</span> On Track
      </span>
    )
  }
  if (status === 'atRisk') {
    return (
      <span className="aviora-prop-pkg-badge aviora-prop-pkg-badge--warn">
        <span aria-hidden="true">▲</span> At Risk
      </span>
    )
  }
  return (
    <span className="aviora-prop-pkg-badge aviora-prop-pkg-badge--bad">
      <span aria-hidden="true">✕</span> Delayed
    </span>
  )
}

function PackageCard({ pkg }) {
  const barClass =
    pkg.status === 'onTrack' ? 'aviora-prop-pkg-bar--ok' : pkg.status === 'atRisk' ? 'aviora-prop-pkg-bar--warn' : 'aviora-prop-pkg-bar--bad'
  return (
    <article className="aviora-prop-pkg">
      <header className="aviora-prop-pkg-head">
        <span className="aviora-prop-pkg-num">{pkg.num}</span>
        <div className="aviora-prop-pkg-titles">
          <h3 className="aviora-prop-pkg-name">{pkg.title}</h3>
          <p className="aviora-prop-pkg-sub">{pkg.subtitle}</p>
        </div>
        <StatusBadge status={pkg.status} />
      </header>
      <div className="aviora-prop-pkg-photo">
        <div className="aviora-prop-pkg-photo-inner">
          <img
            src={pkg.image}
            alt=""
            loading="lazy"
            decoding="async"
            style={{ objectPosition: pkg.imageFocus ?? 'center' }}
          />
        </div>
      </div>
      <div className="aviora-prop-pkg-metrics">
        <div>
          <span className="aviora-prop-pkg-metric-label">Percent Complete</span>
          <strong className="aviora-prop-pkg-pct">{pkg.pct}%</strong>
        </div>
        <div>
          <span className="aviora-prop-pkg-metric-label">Time Variance</span>
          <strong
            className={
              pkg.status === 'onTrack'
                ? 'aviora-prop-pkg-var--ok'
                : pkg.status === 'atRisk'
                  ? 'aviora-prop-pkg-var--warn'
                  : 'aviora-prop-pkg-var--bad'
            }
          >
            {pkg.timeVariance}
          </strong>
        </div>
        <div>
          <span className="aviora-prop-pkg-metric-label">Days Remaining</span>
          <strong>{pkg.daysLeft} days left</strong>
        </div>
      </div>
      <div className="aviora-prop-pkg-bar-track" aria-hidden="true">
        <div className={`aviora-prop-pkg-bar-fill ${barClass}`} style={{ width: `${pkg.pct}%` }} />
      </div>
      <p className="aviora-prop-pkg-bar-cap">
        Build Progress <span>{pkg.pct}%</span>
      </p>
    </article>
  )
}

function PersonRow({ label, person, variant = 'pm' }) {
  const LeadIcon = variant === 'engineer' ? IconHardHat : IconUser
  return (
    <div className="aviora-prop-info-line aviora-prop-info-line--person">
      <span className="aviora-prop-info-ic" aria-hidden="true">
        <LeadIcon />
      </span>
      <div className="aviora-prop-info-body">
        <span className="aviora-prop-info-k">{label}</span>
        <strong className="aviora-prop-info-person-name">{person.name}</strong>
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
            Property: {d.name}{' '}
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
                  <div className="aviora-prop-side-panel-body">
                    <div className="aviora-prop-info-line">
                      <span className="aviora-prop-info-ic" aria-hidden="true">
                        <IconBuilding />
                      </span>
                      <div className="aviora-prop-info-body">
                        <span className="aviora-prop-info-k">Description</span>
                        <p className="aviora-prop-info-v">{d.description}</p>
                      </div>
                    </div>
                    <PersonRow label="Project Manager" person={d.projectManager} variant="pm" />
                    <PersonRow label="Site Engineer" person={d.siteEngineer} variant="engineer" />
                  </div>
                </div>

                <div className="aviora-prop-side-section">
                  <SideSectionHead icon={<IconTrend />} title="Real-Time Status" />
                  <div className="aviora-prop-rt-split">
                    <p className="aviora-prop-current-status">
                      Current Status:{' '}
                      <strong className="aviora-prop-current-status-val">{d.currentStatusLabel}</strong>
                    </p>
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
                <div className="aviora-prop-cta-row" role="tablist" aria-label="Property workspace">
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
                  <button
                    type="button"
                    role="tab"
                    aria-selected={propView === 'status'}
                    className={`aviora-prop-cta aviora-prop-cta--status${propView === 'status' ? ' is-active' : ''}`}
                    onClick={() => setPropView('status')}
                  >
                    <IconBar />
                    Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div
          className={`aviora-prop-main${propView === 'safety' || propView === 'security' ? ' aviora-prop-main--hub' : ''}`}
        >
          {propView === 'status' ? (
            <div className="aviora-prop-grid">
              {d.packages.map((pkg) => (
                <PackageCard key={pkg.num} pkg={pkg} />
              ))}
            </div>
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
