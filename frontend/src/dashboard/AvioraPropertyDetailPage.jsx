import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AVIORA_PROPERTY_DETAILS } from './avioraPropertyDetailData.js'
import AvioraPropertySnapshot from './AvioraPropertySnapshot.jsx'

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
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

function PersonRow({ label, person }) {
  const focus = person.photoFocus ?? '50% 16%'
  return (
    <div className="aviora-prop-person">
      <div className="aviora-prop-person-photo" aria-hidden="true">
        <div className="aviora-prop-person-photo-inner">
          {person.photo ? (
            <img
              src={person.photo}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ objectPosition: focus }}
            />
          ) : (
            <span className="aviora-prop-person-fallback">{initials(person.name)}</span>
          )}
        </div>
      </div>
      <div>
        <span className="aviora-prop-person-label">{label}</span>
        <strong className="aviora-prop-person-name">{person.name}</strong>
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
  const tick = nowTick ?? new Date()
  const today = tick.toLocaleDateString(undefined, { dateStyle: 'long' })
  const time = tick.toLocaleTimeString(undefined, { timeStyle: 'short' })
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
  })

  if (!d) return null

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
              <strong>
                {time} <span className="aviora-prop-tz">CDT</span>
              </strong>
            </div>
          </div>
        </div>
      </header>

      <div className="aviora-prop-body">
        <aside className={`aviora-prop-side ${sidebarToneClass}`}>
          <Link className="aviora-prop-back" to="/">
            ← Back to portfolio overview
          </Link>

          <div className="aviora-prop-side-hero">
            <img src={d.heroImage} alt="" loading="lazy" decoding="async" />
          </div>
          <p className="aviora-prop-desc">{d.description}</p>

          <div className="aviora-prop-side-block">
            <PersonRow label="Project Manager" person={d.projectManager} />
            <PersonRow label="Site Engineer" person={d.siteEngineer} />
          </div>

          <div className="aviora-prop-side-block">
            <h2 className="aviora-prop-side-h">Real-Time Status</h2>
            <p className="aviora-prop-status-line">
              <span className="aviora-prop-status-dot" aria-hidden="true" />
              Current Status: <strong>{d.currentStatusLabel}</strong>
            </p>
            <ul className="aviora-prop-kv">
              {d.realtime.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="aviora-prop-side-block">
            <h2 className="aviora-prop-side-h">Construction Overview</h2>
            <ul className="aviora-prop-kv">
              {d.construction.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="aviora-prop-side-block">
            <h2 className="aviora-prop-side-h">Delivery Outlook</h2>
            <ul className="aviora-prop-delivery-list">
              {(d.deliveryBullets || []).map((b) => (
                <li key={b.text}>
                  <span className={`aviora-prop-delivery-dot aviora-prop-delivery-dot--${b.tone}`} aria-hidden="true" />
                  {b.text}
                </li>
              ))}
            </ul>
            {d.deliveryFoot ? <p className="aviora-prop-delivery-foot">{d.deliveryFoot}</p> : null}
          </div>

          <div className="aviora-prop-side-block aviora-prop-snap">
            <h2 className="aviora-prop-side-h">Visual Snapshot</h2>
            <AvioraPropertySnapshot snap={d.snapshot} />
          </div>

          <div className="aviora-prop-side-foot">
            <p className="aviora-prop-side-clock">{clockLine}</p>
            <div className="aviora-prop-cta-row">
              <button type="button" className="aviora-prop-cta aviora-prop-cta--fill">
                Status
              </button>
              <button type="button" className="aviora-prop-cta aviora-prop-cta--outline">
                Safety
              </button>
              <button type="button" className="aviora-prop-cta aviora-prop-cta--green">
                Security
              </button>
            </div>
          </div>
        </aside>

        <div className="aviora-prop-main">
          <div className="aviora-prop-grid">
            {d.packages.map((pkg) => (
              <PackageCard key={pkg.num} pkg={pkg} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
