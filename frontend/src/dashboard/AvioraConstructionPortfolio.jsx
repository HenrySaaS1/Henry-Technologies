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

/** @param {Date} tick @param {string} iana */
function siteClock24(tick, iana) {
  try {
    return tick.toLocaleTimeString('en-US', {
      timeZone: iana,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      hourCycle: 'h23',
    })
  } catch {
    return '—'
  }
}

/** @param {Date} tick @param {string} iana */
function siteTimeZoneAbbrev(tick, iana) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'short' }).formatToParts(tick)
    return parts.find((x) => x.type === 'timeZoneName')?.value ?? ''
  } catch {
    return ''
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

function avioraAccentFromTone(tone) {
  if (tone === 'operational') return { main: '#16a34a', track: '#dcfce7' }
  if (tone === 'monitoring') return { main: '#ea580c', track: '#ffedd5' }
  return { main: '#dc2626', track: '#fee2e2' }
}

/** @param {'High' | 'Medium' | 'N/A'} level */
function avioraSecurityBarHeights(level) {
  if (level === 'High') return [38, 50, 62, 76, 92]
  if (level === 'Medium') return [32, 42, 50, 58, 66]
  return [16, 18, 14, 20, 16]
}

function avioraSparkPercents(projectId, base) {
  const seed = String(projectId)
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0)
  return Array.from({ length: 8 }, (_, i) => {
    const w = Math.sin(seed * 0.07 + i * 0.55) * 3.2 + (i - 3.5) * 0.4
    return Math.round(Math.max(52, Math.min(100, base + w)))
  })
}

/** @param {'operational' | 'monitoring' | 'risk'} statusKey */
function avioraStatusStepperFill(statusKey) {
  if (statusKey === 'operational') return 4
  if (statusKey === 'monitoring') return 3
  if (statusKey === 'risk') return 1
  return 2
}

/** @param {'operational' | 'monitoring' | 'risk'} statusKey */
function avioraPillarStatusCaption(statusKey) {
  if (statusKey === 'operational') return 'Operational'
  if (statusKey === 'monitoring') return 'Monitoring'
  return 'At risk'
}

/** @param {{ value: number; max?: number; color: string; track: string; size?: number; label: string }} props */
function PortfolioMiniDonut({ value, max = 100, color, track, size = 64, label }) {
  const safe = Math.max(0, Math.min(100, Math.round((Number(value) / Number(max)) * 100) || 0))
  const r = size / 2 - 7
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const dash = (safe / 100) * circ
  return (
    <div className="aviora-port-mini-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} stroke={track} strokeWidth="7" fill="none" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth="7"
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="aviora-port-mini-donut-cap">
        <strong>{label}</strong>
      </div>
    </div>
  )
}

function CompletionRing({ pct, tone }) {
  const size = 100
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

function ProjectCard({ p, visuals, nowTick }) {
  const tone = p.statusKey === 'operational' ? 'operational' : p.statusKey === 'monitoring' ? 'monitoring' : 'risk'
  const statusLabel =
    p.statusKey === 'operational' ? 'OPERATIONAL' : p.statusKey === 'monitoring' ? 'MONITORING' : 'AT RISK'
  const leadSrc = visuals?.lead
  const siteSrc = visuals?.site
  const tick = nowTick ?? new Date()
  const tz = typeof p.siteTimeZone === 'string' ? p.siteTimeZone : 'America/Chicago'
  const siteHhmm = siteClock24(tick, tz)
  const siteTzAbbr = siteTimeZoneAbbrev(tick, tz)
  const pillars = p.pillars
  const accent = avioraAccentFromTone(tone)
  const secLevel = pillars?.securityLevel ?? 'N/A'
  const secBars = avioraSecurityBarHeights(secLevel)
  const systemsPct = pillars?.systemsPct ?? 0
  const sparkPts = avioraSparkPercents(p.id, systemsPct)
  const wSp = 72
  const hSp = 30
  const sparkMin = Math.min(...sparkPts)
  const sparkSpan = Math.max(1, Math.max(...sparkPts) - sparkMin)
  const sparkLinePts = sparkPts
    .map((pt, i) => {
      const x = 4 + (i / Math.max(1, sparkPts.length - 1)) * (wSp - 8)
      const y = hSp - 4 - ((pt - sparkMin) / sparkSpan) * (hSp - 8)
      return `${x},${y}`
    })
    .join(' ')
  const stepFill = avioraStatusStepperFill(p.statusKey)
  const statusCaption = avioraPillarStatusCaption(p.statusKey)
  const safetyVal = pillars?.safetyPct ?? 0

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
          <p className="aviora-port-project-site-time" title={`Local time at ${p.location}`}>
            <span className="aviora-port-project-site-time-k">Site time</span>
            <strong className="aviora-port-project-site-time-val">{siteHhmm}</strong>
            {siteTzAbbr ? <span className="aviora-port-project-site-time-z">{siteTzAbbr}</span> : null}
          </p>
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

      <div className="aviora-port-pillars" aria-label="Safety, security, systems, and status">
        <div className="aviora-port-pcol">
          <span className="aviora-port-pcap">Safety</span>
          <PortfolioMiniDonut
            value={safetyVal}
            max={100}
            color={accent.main}
            track={accent.track}
            size={64}
            label={`${safetyVal}%`}
          />
        </div>
        <div className="aviora-port-pcol">
          <span className="aviora-port-pcap">Security</span>
          <div
            className={`aviora-port-sec-bars${secLevel === 'N/A' ? ' aviora-port-sec-bars--na' : ''}`}
            style={secLevel !== 'N/A' ? { ['--aviora-sec-bar']: accent.main } : undefined}
            aria-hidden="true"
          >
            {secBars.map((pct, i) => (
              <span key={i} className="aviora-port-sec-bar" style={{ height: `${pct}%` }} />
            ))}
          </div>
          <span className="aviora-port-pfoot">{secLevel}</span>
        </div>
        <div className="aviora-port-pcol">
          <span className="aviora-port-pcap">Systems</span>
          <svg className="aviora-port-spark" viewBox={`0 0 ${wSp} ${hSp}`} preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points={sparkLinePts}
              fill="none"
              stroke={accent.main}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <span className="aviora-port-pfoot">{systemsPct}%</span>
        </div>
        <div className="aviora-port-pcol">
          <span className="aviora-port-pcap">Status</span>
          <div className="aviora-port-status-stepper" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`aviora-port-status-dot${i < stepFill ? ' is-on' : ''}`}
                style={
                  i < stepFill
                    ? { background: accent.main, borderColor: accent.main }
                    : undefined
                }
              />
            ))}
          </div>
          <span className="aviora-port-pfoot">{statusCaption}</span>
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
  const timeWithTz = tick.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  const f = AVIORA_PORTFOLIO_FOOTER

  return (
    <section className="aviora-port" aria-label="Construction portfolio overview">
      <header className="aviora-port-header">
        <div>
          <h2 className="aviora-port-brand">{companyName}</h2>
        </div>
        <div className="aviora-port-header-meta">
          <div className="aviora-port-meta-pill">
            <span className="aviora-port-meta-label">Today&apos;s date</span>
            <strong>{today}</strong>
          </div>
          <div className="aviora-port-meta-pill">
            <span className="aviora-port-meta-label">Local time</span>
            <strong>{timeWithTz}</strong>
          </div>
        </div>
      </header>

      <div className="aviora-port-grid">
        {AVIORA_CONSTRUCTION_PROJECTS.map((p) => (
          <ProjectCard key={p.id} p={p} visuals={PROJECT_VISUALS[p.id]} nowTick={tick} />
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
