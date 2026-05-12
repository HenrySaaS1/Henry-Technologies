import { Link } from 'react-router-dom'
import {
  AVIORA_CONSTRUCTION_PROJECTS,
  AVIORA_OLIVIA_LEAD_IMAGE_URL,
  AVIORA_PORTFOLIO_FOOTER,
} from './avioraPortfolioData.js'
import leadEthanBrooks from '../assets/uploads/aviora-lead-ethan-brooks.jpg'
import leadMayaSingh from '../assets/uploads/aviora-lead-maya-singh.jpg'
import siteImgSkyline from '../assets/uploads/aviora-site-skyline-residences.jpg'
import siteImgGreenfield from '../assets/uploads/aviora-site-greenfield-heights.jpg'
import siteImgRiverstone from '../assets/uploads/aviora-site-riverstone-villas.jpg'

/** Lead portraits cropped from stakeholder mockup; site heroes match reference properties. */
const PROJECT_VISUALS = {
  skyline: { lead: AVIORA_OLIVIA_LEAD_IMAGE_URL, site: siteImgSkyline, leadObjectPosition: '50% 38%' },
  greenfield: { lead: leadEthanBrooks, site: siteImgGreenfield, leadObjectPosition: '50% 18%' },
  riverstone: { lead: leadMayaSingh, site: siteImgRiverstone, leadObjectPosition: '50% 16%' },
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

function IcCal() {
  return (
    <svg className="aviora-port-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
      />
    </svg>
  )
}

function IcPeople() {
  return (
    <svg className="aviora-port-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"
      />
    </svg>
  )
}

function IcCloud() {
  return (
    <svg className="aviora-port-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
      />
    </svg>
  )
}

function IcShield() {
  return (
    <svg className="aviora-port-ico aviora-port-ico--blue" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  )
}

function IcHelmet() {
  return (
    <svg className="aviora-port-ico aviora-port-ico--teal" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C8.13 2 5 5.13 5 9v1h14V9c0-3.87-3.13-7-7-7zm-1 12H9v2h2v-2zm2 0h2v2h-2v-2zm6-4H5v6c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-6z"
      />
    </svg>
  )
}

function IcWarn() {
  return (
    <svg className="aviora-port-ico aviora-port-ico--orange" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="currentColor" d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  )
}

function IcCalSm() {
  return (
    <svg className="aviora-port-ico aviora-port-ico--green" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"
      />
    </svg>
  )
}

function CompletionRing({ pct, tone }) {
  const size = 112
  const r = (size / 2) - 10
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(100, Math.max(0, pct)) / 100) * circ
  const color =
    tone === 'operational' ? '#16a34a' : tone === 'monitoring' ? '#ea580c' : '#dc2626'
  const track = tone === 'operational' ? '#dcfce7' : tone === 'monitoring' ? '#ffedd5' : '#fee2e2'

  return (
    <div className="aviora-port-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} stroke={track} strokeWidth="10" fill="none" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="aviora-port-ring-text">
        <span className="aviora-port-ring-cap">Completion</span>
        <strong className="aviora-port-ring-pct" style={{ color }}>
          {pct}%
        </strong>
      </div>
    </div>
  )
}

function ProjectCard({ p, visuals }) {
  const tone = p.statusKey === 'operational' ? 'operational' : p.statusKey === 'monitoring' ? 'monitoring' : 'risk'
  const statusLabel =
    p.statusKey === 'operational' ? 'OPERATIONAL' : p.statusKey === 'monitoring' ? 'MONITORING' : 'AT RISK'
  const leadSrc = visuals?.lead
  const siteSrc = visuals?.site

  return (
    <Link
      to={`/property/${p.id}`}
      className={`aviora-port-card aviora-port-card--link aviora-port-card--${tone}`}
      aria-label={`Open property detail for ${p.name}`}
    >
      <div className="aviora-port-card-head">
        <span className={`aviora-port-pill aviora-port-pill--${tone}`}>
          <span className="aviora-port-pill-dot" aria-hidden="true" />
          {statusLabel}
        </span>
      </div>
      <div className="aviora-port-card-title-row">
        <div className="aviora-port-lead-photo" aria-hidden="true">
          <div className="aviora-port-lead-photo-inner">
            {leadSrc ? (
              <img
                src={leadSrc}
                alt=""
                loading="lazy"
                decoding="async"
                style={{ objectPosition: visuals?.leadObjectPosition ?? '50% 16%' }}
              />
            ) : (
              <span className="aviora-port-lead-photo-fallback">{leadInitials(p.lead)}</span>
            )}
          </div>
        </div>
        <div className="aviora-port-card-title-text">
          <h3 className="aviora-port-project-name">{p.name}</h3>
          <p className="aviora-port-project-loc">
            <span aria-hidden="true">📍</span> {p.location}
          </p>
          <p className="aviora-port-project-lead">
            Lead: <strong>{p.lead}</strong>
          </p>
        </div>
        <div className="aviora-port-site-thumb" aria-hidden="true" title="Site preview (demo)">
          {siteSrc ? <img src={siteSrc} alt="" loading="lazy" decoding="async" /> : null}
        </div>
      </div>

      <div className="aviora-port-card-mid">
        <div className="aviora-port-stat-col">
          <div className="aviora-port-stat">
            <IcCal />
            <div>
              <span className="aviora-port-stat-label">Day progress</span>
              <strong>
                {p.dayProgress.current} / {p.dayProgress.total}
              </strong>
              <span className="aviora-port-stat-sub">{p.dayProgress.cyclePct}% of cycle</span>
            </div>
          </div>
          <div className="aviora-port-stat">
            <IcPeople />
            <div>
              <span className="aviora-port-stat-label">Crew on site</span>
              <strong>{p.crewWorkers} workers</strong>
            </div>
          </div>
          <div className="aviora-port-stat">
            <IcCloud />
            <div>
              <span className="aviora-port-stat-label">Weather delay</span>
              <strong>{p.weatherDelayHrs} hrs</strong>
              <span className="aviora-port-stat-sub">This week</span>
            </div>
          </div>
        </div>
        <div className="aviora-port-ring-wrap">
          <CompletionRing pct={p.completion.pct} tone={tone} />
          <div className={`aviora-port-complete-meta aviora-port-complete-meta--${tone}`}>
            {p.completion.arrow === 'check' ? (
              <span className="aviora-port-arrow" aria-hidden="true">
                ✓
              </span>
            ) : (
              <span className="aviora-port-arrow" aria-hidden="true">
                ↓
              </span>
            )}
            <span>{p.completion.label}</span>
          </div>
        </div>
      </div>

      <div className="aviora-port-metrics4">
        <div className="aviora-port-m4">
          <IcCalSm />
          <span className="aviora-port-m4-label">Schedule adherence</span>
          <strong>
            {p.schedule.pct}% <span className="aviora-port-m4-sub">{p.schedule.status}</span>
          </strong>
        </div>
        <div className="aviora-port-m4">
          <IcShield />
          <span className="aviora-port-m4-label">Quality score</span>
          <strong>
            {p.quality.pct}% <span className="aviora-port-m4-sub">{p.quality.status}</span>
          </strong>
        </div>
        <div className="aviora-port-m4">
          <IcHelmet />
          <span className="aviora-port-m4-label">Safety score</span>
          <strong>
            {p.safety.pct}% <span className="aviora-port-m4-sub">{p.safety.status}</span>
          </strong>
        </div>
        <div className="aviora-port-m4">
          <IcWarn />
          <span className="aviora-port-m4-label">Open issues</span>
          <strong>
            {p.issues.count} <span className="aviora-port-m4-sub">{p.issues.level}</span>
          </strong>
        </div>
      </div>

      <div className={`aviora-port-card-foot aviora-port-card-foot--${p.footer.tone}`}>
        <span className="aviora-port-foot-ico" aria-hidden="true">
          {p.footer.tone === 'good' ? '✓' : '!'}
        </span>
        <p>{p.footer.text}</p>
      </div>
    </Link>
  )
}

/**
 * Aviora Construction portfolio overview (demo data from stakeholder reference).
 */
export default function AvioraConstructionPortfolio({ companyName, nowTick }) {
  const tick = nowTick ?? new Date()
  const today = tick.toLocaleDateString(undefined, { dateStyle: 'long' })
  const time = tick.toLocaleTimeString(undefined, { timeStyle: 'short' })
  const f = AVIORA_PORTFOLIO_FOOTER

  return (
    <section className="aviora-port" aria-label="Construction portfolio overview">
      <header className="aviora-port-header">
        <div>
          <h2 className="aviora-port-brand">{companyName}</h2>
          <p className="aviora-port-tag">
            Portfolio overview – property leadership, build progress, site health, and schedule performance.
          </p>
        </div>
        <div className="aviora-port-header-meta">
          <div>
            <span className="aviora-port-meta-label">Today&apos;s date</span>
            <strong>{today}</strong>
          </div>
          <div>
            <span className="aviora-port-meta-label">Local time</span>
            <strong>
              {time} <span className="aviora-port-tz">CDT</span>
            </strong>
          </div>
        </div>
      </header>

      <div className="aviora-port-grid">
        {AVIORA_CONSTRUCTION_PROJECTS.map((p) => (
          <ProjectCard key={p.id} p={p} visuals={PROJECT_VISUALS[p.id]} />
        ))}
      </div>

      <footer className="aviora-port-summary">
        <div className="aviora-port-sum-cell">
          <span>Active properties</span>
          <strong>{f.activeProperties}</strong>
        </div>
        <div className="aviora-port-sum-cell">
          <span>Total workforce</span>
          <strong>{f.totalWorkforce} on site</strong>
        </div>
        <div className="aviora-port-sum-cell">
          <span>Portfolio completion (avg)</span>
          <strong>{f.portfolioCompletionAvg}%</strong>
        </div>
        <div className="aviora-port-sum-cell">
          <span>Schedule adherence (avg)</span>
          <strong>{f.scheduleAdherenceAvg}%</strong>
        </div>
        <div className="aviora-port-sum-cell">
          <span>Quality score (avg)</span>
          <strong>{f.qualityScoreAvg}%</strong>
        </div>
        <div className="aviora-port-sum-cell">
          <span>Open issues</span>
          <strong>
            {f.openIssuesTotal} <span className="aviora-port-sum-sub">across portfolio</span>
          </strong>
        </div>
      </footer>
    </section>
  )
}
