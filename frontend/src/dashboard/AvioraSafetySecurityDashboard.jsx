import { useState } from 'react'
import {
  AVIORA_HUB,
  AVIORA_SAFETY_KPI_CARDS,
  AVIORA_SAFETY_OBSERVATIONS,
  AVIORA_SAFETY_SIDEBAR_STATS,
  AVIORA_SECURITY_EVENTS,
  AVIORA_SECURITY_FOOT_METRICS,
  AVIORA_SECURITY_KPI_CARDS,
  AVIORA_SECURITY_SIDEBAR_STATS,
} from './avioraSafetySecurityData.js'

/** @param {{ pct: number; label: string; variant: 'safety' | 'security' }} props */
function ScoreRing({ pct, label, variant }) {
  const r = 46
  const sw = 7
  const c = 2 * Math.PI * r
  const dash = Math.min(100, Math.max(0, pct)) / 100
  const dashLen = dash * c
  const ringLabelColor = variant === 'safety' ? '#14b8a6' : '#38bdf8'
  return (
    <div className="aviora-hub-ring-wrap">
      <svg className="aviora-hub-ring-svg" viewBox="0 0 112 112" aria-hidden="true">
        <defs>
          <linearGradient id={`hubRingGrad-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={variant === 'safety' ? '#0d9488' : '#0ea5e9'} />
            <stop offset="100%" stopColor={variant === 'safety' ? '#5eead4' : '#7dd3fc'} />
          </linearGradient>
        </defs>
        <circle className="aviora-hub-ring-track" cx="56" cy="56" r={r} fill="none" strokeWidth={sw} />
        <circle
          className="aviora-hub-ring-prog"
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke={`url(#hubRingGrad-${variant})`}
          strokeWidth={sw}
          strokeDasharray={`${dashLen} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 56 56)"
        />
      </svg>
      <div className="aviora-hub-ring-center">
        <strong className="aviora-hub-ring-pct">{pct}%</strong>
        <span className="aviora-hub-ring-lbl" style={{ color: ringLabelColor }}>
          {label}
        </span>
      </div>
    </div>
  )
}

function IconPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
        fill="currentColor"
        opacity="0.85"
      />
      <circle cx="12" cy="9" r="2.25" fill="#fff" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" strokeLinecap="round" />
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

function IconBar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" strokeLinecap="round" />
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

function SidebarGlyph({ name }) {
  if (name === 'clipboard')
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M9 4h6a1 1 0 0 1 1 1v2H8V5a1 1 0 0 1 1-1z" />
        <rect x="5" y="6" width="14" height="15" rx="2" />
      </svg>
    )
  if (name === 'check')
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2" aria-hidden="true">
        <path d="M5 12l5 5L20 7" strokeLinecap="round" />
      </svg>
    )
  if (name === 'alert')
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#dc2626" aria-hidden="true">
        <path d="M12 2L2 20h20L12 2zm0 4v8m0 3v.5" stroke="#fff" strokeWidth="1.2" fill="#dc2626" />
      </svg>
    )
  if (name === 'bolt')
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#ca8a04" aria-hidden="true">
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  )
}

function SecSideIcon({ tone }) {
  const circle =
    tone === 'bad' ? (
      <circle cx="12" cy="12" r="10" fill="#fecaca" stroke="#dc2626" strokeWidth="1.5" />
    ) : tone === 'warn' ? (
      <circle cx="12" cy="12" r="10" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
    ) : tone === 'low' ? (
      <circle cx="12" cy="12" r="10" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" />
    ) : tone === 'invest' ? (
      <circle cx="12" cy="12" r="10" fill="#ede9fe" stroke="#7c3aed" strokeWidth="1.5" />
    ) : (
      <circle cx="12" cy="12" r="10" fill="#f1f5f9" stroke="#64748b" strokeWidth="1.5" />
    )
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      {circle}
      <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0f172a">
        {tone === 'low' ? 'L' : tone === 'invest' ? '?' : '!'}
      </text>
    </svg>
  )
}

function FootGlyph({ icon }) {
  if (icon === 'cam')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M4 9h11v8H4z" />
        <path d="M15 12l5-3v10l-5-3" />
      </svg>
    )
  if (icon === 'people')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <circle cx="9" cy="8" r="3" />
        <path d="M4 20v-1a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1M16 11a3 3 0 1 0 0-6" />
        <path d="M20 20v-1a4 4 0 0 0-3-3.87" />
      </svg>
    )
  if (icon === 'board')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 10h8M8 14h5" strokeLinecap="round" />
      </svg>
    )
  if (icon === 'timer')
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 10v4l2 1M9 3h6" strokeLinecap="round" />
      </svg>
    )
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M12 4l9 14H3L12 4z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
    </svg>
  )
}

function riskLabel(r) {
  if (r === 'high') return 'High Risk'
  if (r === 'medium') return 'Medium Risk'
  return 'Safe'
}

function riskClass(r) {
  if (r === 'high') return 'aviora-hub-risk--high'
  if (r === 'medium') return 'aviora-hub-risk--med'
  return 'aviora-hub-risk--safe'
}

function obsStatusClass(s) {
  if (s === 'open') return 'aviora-hub-obs-st--open'
  if (s === 'in_progress') return 'aviora-hub-obs-st--prog'
  return 'aviora-hub-obs-st--safe'
}

function sevClass(s) {
  if (s === 'high') return 'aviora-hub-sev--high'
  if (s === 'medium') return 'aviora-hub-sev--med'
  return 'aviora-hub-sev--low'
}

/**
 * @param {{ companyName: string; nowTick?: Date; onOpenStatus?: () => void }} props
 */
export default function AvioraSafetySecurityDashboard({ companyName, nowTick, onOpenStatus }) {
  const [mode, setMode] = useState(/** @type {'safety' | 'security'} */ ('safety'))
  const tick = nowTick ?? new Date()

  const dateStr = tick.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timeStr = tick.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  const clockBig = tick.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

  const hub = AVIORA_HUB
  const headerClass = mode === 'safety' ? 'aviora-hub-top aviora-hub-top--safety' : 'aviora-hub-top aviora-hub-top--security'
  const title = mode === 'safety' ? 'SAFETY DASHBOARD' : 'SECURITY DASHBOARD'

  return (
    <div className={`aviora-hub aviora-hub--${mode}`} aria-label={mode === 'safety' ? 'Safety dashboard' : 'Security dashboard'}>
      <header className={headerClass}>
        <div className="aviora-hub-top-skyline" aria-hidden="true" />
        <div className="aviora-hub-top-inner">
          <div className="aviora-hub-brand">
            <span className="aviora-hub-logo" aria-hidden="true">
              A
            </span>
            <div>
              <span className="aviora-hub-brand-line">{hub.companyLine}</span>
              <span className="aviora-hub-brand-sub">{companyName}</span>
            </div>
          </div>
          <div className="aviora-hub-title-block">
            {mode === 'security' ? (
              <span className="aviora-hub-title-ic" aria-hidden="true">
                <IconShield />
              </span>
            ) : null}
            <h1 className="aviora-hub-title">{title}</h1>
            <p className="aviora-hub-loc">
              <IconPin /> {hub.locationLine}
            </p>
          </div>
          <div className="aviora-hub-datetime">
            <div className="aviora-hub-dt-card">
              <IconCalendar />
              <div>
                <span className="aviora-hub-dt-k">Today&apos;s Date</span>
                <span className="aviora-hub-dt-v">{dateStr}</span>
              </div>
            </div>
            <div className="aviora-hub-dt-card">
              <IconClock />
              <div>
                <span className="aviora-hub-dt-k">Local Time</span>
                <span className="aviora-hub-dt-v">{timeStr}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="aviora-hub-body">
        <aside className="aviora-hub-side" aria-label="Property and summary">
          <div className="aviora-hub-side-hero">
            <img src={hub.sitePhoto} alt="" className="aviora-hub-side-img" loading="lazy" decoding="async" />
          </div>
          <div className="aviora-hub-side-block">
            <h2 className="aviora-hub-side-h">Property</h2>
            <p className="aviora-hub-prop-name">
              {hub.propertyName} <span className="aviora-hub-prop-code">{hub.propertyCode}</span>
            </p>
            <p className="aviora-hub-prop-desc">{hub.description}</p>
            <ul className="aviora-hub-people">
              <li>
                <span className="aviora-hub-av" aria-hidden="true">
                  {hub.projectManager.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')}
                </span>
                <div>
                  <span className="aviora-hub-people-role">{hub.projectManager.role}</span>
                  <span className="aviora-hub-people-name">{hub.projectManager.name}</span>
                </div>
              </li>
              <li>
                <span className="aviora-hub-av" aria-hidden="true">
                  {hub.siteEngineer.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')}
                </span>
                <div>
                  <span className="aviora-hub-people-role">{hub.siteEngineer.role}</span>
                  <span className="aviora-hub-people-name">{hub.siteEngineer.name}</span>
                </div>
              </li>
            </ul>
          </div>

          {mode === 'safety' ? (
            <div className="aviora-hub-side-block aviora-hub-side-block--tint">
              <h2 className="aviora-hub-side-h">Safety Summary (Today)</h2>
              <ul className="aviora-hub-sum-list">
                {AVIORA_SAFETY_SIDEBAR_STATS.map((row) => (
                  <li key={row.id} className="aviora-hub-sum-row">
                    <span className="aviora-hub-sum-ic">
                      <SidebarGlyph name={row.icon} />
                    </span>
                    <span className="aviora-hub-sum-label">{row.label}</span>
                    <span className="aviora-hub-sum-val">{row.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <>
              <div className="aviora-hub-side-block aviora-hub-side-block--tint aviora-hub-side-block--sec">
                <h2 className="aviora-hub-side-h">Security Summary (Today)</h2>
                <ul className="aviora-hub-sum-list">
                  {AVIORA_SECURITY_SIDEBAR_STATS.map((row) => (
                    <li key={row.id} className="aviora-hub-sum-row">
                      <span className="aviora-hub-sum-ic">
                        <SecSideIcon tone={row.tone} />
                      </span>
                      <span className="aviora-hub-sum-label">{row.label}</span>
                      <span className="aviora-hub-sum-val">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="aviora-hub-clock-big" aria-label="Local time">
                {clockBig}
              </div>
            </>
          )}

          <nav className="aviora-hub-side-nav" aria-label="Hub sections">
            <button type="button" className="aviora-hub-navbtn aviora-hub-navbtn--status" onClick={() => onOpenStatus?.()}>
              <IconBar />
              Status
            </button>
            <button
              type="button"
              className={`aviora-hub-navbtn aviora-hub-navbtn--safety${mode === 'safety' ? ' is-active' : ''}`}
              onClick={() => setMode('safety')}
            >
              <IconShield />
              Safety
            </button>
            <button
              type="button"
              className={`aviora-hub-navbtn aviora-hub-navbtn--sec${mode === 'security' ? ' is-active' : ''}`}
              onClick={() => setMode('security')}
            >
              <IconLock />
              Security
            </button>
          </nav>
        </aside>

        <div className="aviora-hub-main">
          {mode === 'safety' ? (
            <>
              <ul className="aviora-hub-kpis" aria-label="Safety KPIs">
                {AVIORA_SAFETY_KPI_CARDS.map((k) => (
                  <li key={k.id} className="aviora-hub-kpi-card">
                    {k.kind === 'ring' ? (
                      <>
                        <span className="aviora-hub-kpi-label">{k.label}</span>
                        <ScoreRing pct={k.ringPct ?? 0} label={k.ringLabel ?? ''} variant="safety" />
                      </>
                    ) : k.kind === 'fraction' ? (
                      <>
                        <span className="aviora-hub-kpi-label">{k.label}</span>
                        <p className="aviora-hub-kpi-frac">
                          <strong>
                            {k.num} / {k.den}
                          </strong>
                        </p>
                        <span className="aviora-hub-kpi-sub">{k.sub}</span>
                        {k.foot ? <span className="aviora-hub-kpi-foot">{k.foot}</span> : null}
                      </>
                    ) : (
                      <>
                        <span className="aviora-hub-kpi-label">{k.label}</span>
                        <strong className="aviora-hub-kpi-num">{k.value}</strong>
                        <span className="aviora-hub-kpi-sub">{k.sub}</span>
                        {k.trend ? (
                          <span
                            className={`aviora-hub-kpi-trend${k.trendGood ? ' aviora-hub-kpi-trend--good' : ' aviora-hub-kpi-trend--bad'}`}
                          >
                            {k.trend}
                          </span>
                        ) : null}
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <div className="aviora-hub-section-head">
                <h2 className="aviora-hub-section-h">Safety Observations (Today)</h2>
                <button type="button" className="aviora-hub-viewall">
                  View All
                </button>
              </div>
              <div className="aviora-hub-scroll">
                {AVIORA_SAFETY_OBSERVATIONS.map((o) => (
                  <article key={o.id} className="aviora-hub-obs-card">
                    <div className="aviora-hub-obs-visual">
                      <img src={o.imageSrc} alt="" loading="lazy" decoding="async" className="aviora-hub-obs-img" />
                      <span
                        className={`aviora-hub-obs-badge${o.topBadge === 'Safe' ? ' aviora-hub-obs-badge--safe' : ' aviora-hub-obs-badge--vio'}`}
                      >
                        {o.topBadge}
                      </span>
                    </div>
                    <div className="aviora-hub-obs-body">
                      <h3 className="aviora-hub-obs-title">{o.title}</h3>
                      <p className="aviora-hub-obs-loc">
                        <IconPin /> {o.location}
                      </p>
                      <p className="aviora-hub-obs-desc">{o.description}</p>
                      <div className="aviora-hub-obs-foot">
                        <span className={`aviora-hub-risk ${riskClass(o.risk)}`}>{riskLabel(o.risk)}</span>
                        <span className={`aviora-hub-obs-st ${obsStatusClass(o.status)}`}>{o.statusLabel}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <ul className="aviora-hub-kpis" aria-label="Security KPIs">
                {AVIORA_SECURITY_KPI_CARDS.map((k) => (
                  <li key={k.id} className="aviora-hub-kpi-card">
                    {k.kind === 'ring' ? (
                      <>
                        <span className="aviora-hub-kpi-label">{k.label}</span>
                        <ScoreRing pct={k.ringPct ?? 0} label={k.ringLabel ?? ''} variant="security" />
                      </>
                    ) : k.kind === 'fraction' ? (
                      <>
                        <span className="aviora-hub-kpi-label">
                          {k.icon === 'cam' ? (
                            <span className="aviora-hub-kpi-ic">
                              <FootGlyph icon="cam" />
                            </span>
                          ) : null}
                          {k.label}
                        </span>
                        <p className="aviora-hub-kpi-frac">
                          <strong>
                            {k.num} / {k.den}
                          </strong>
                        </p>
                        <span className="aviora-hub-kpi-sub">{k.sub}</span>
                        {k.foot ? <span className="aviora-hub-kpi-foot">{k.foot}</span> : null}
                      </>
                    ) : (
                      <>
                        <span className="aviora-hub-kpi-label">
                          {k.icon === 'shield' ? (
                            <span className="aviora-hub-kpi-ic aviora-hub-kpi-ic--bad">
                              <IconShield />
                            </span>
                          ) : k.icon === 'cam' ? (
                            <span className="aviora-hub-kpi-ic aviora-hub-kpi-ic--inv">
                              <FootGlyph icon="cam" />
                            </span>
                          ) : null}
                          {k.label}
                        </span>
                        <strong className="aviora-hub-kpi-num">{k.value}</strong>
                        <span className="aviora-hub-kpi-sub">{k.sub}</span>
                        {k.trend ? (
                          <span
                            className={`aviora-hub-kpi-trend${
                              k.trendGood === false ? ' aviora-hub-kpi-trend--bad' : ' aviora-hub-kpi-trend--good'
                            }`}
                          >
                            {k.trend}
                          </span>
                        ) : null}
                      </>
                    )}
                  </li>
                ))}
              </ul>

              <div className="aviora-hub-section-head">
                <h2 className="aviora-hub-section-h">Latest Security Events (Today)</h2>
                <button type="button" className="aviora-hub-viewall">
                  View All
                </button>
              </div>
              <div className="aviora-hub-scroll">
                {AVIORA_SECURITY_EVENTS.map((e) => (
                  <article key={e.id} className="aviora-hub-sec-card">
                    <div className="aviora-hub-sec-visual">
                      <img src={e.imageSrc} alt="" loading="lazy" decoding="async" className="aviora-hub-sec-img" />
                      <span className={`aviora-hub-sev ${sevClass(e.severity)}`}>{e.severityLabel}</span>
                    </div>
                    <div className="aviora-hub-sec-body">
                      <h3 className="aviora-hub-sec-title">{e.title}</h3>
                      <p className="aviora-hub-sec-meta">
                        <IconPin /> {e.location} · {e.timeClock}
                      </p>
                      <p className={`aviora-hub-sec-status aviora-hub-sec-status--${e.statusTone}`}>{e.statusLabel}</p>
                    </div>
                  </article>
                ))}
              </div>

              <ul className="aviora-hub-foot-row" aria-label="Security operations">
                {AVIORA_SECURITY_FOOT_METRICS.map((m) => (
                  <li key={m.id} className="aviora-hub-foot-card">
                    <span className="aviora-hub-foot-ic">
                      <FootGlyph icon={m.icon} />
                    </span>
                    <span className="aviora-hub-foot-label">{m.label}</span>
                    <strong className="aviora-hub-foot-val">{m.value}</strong>
                    {m.sub ? <span className="aviora-hub-foot-sub">{m.sub}</span> : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
