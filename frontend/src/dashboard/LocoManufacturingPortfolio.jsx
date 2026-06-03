import { Link } from 'react-router-dom'
import {
  LOCO_MANUFACTURING_PLANTS,
  LOCO_MANUFACTURING_FOOTER,
} from './locoManufacturingData.js'

import northlineLead from '../assets/uploads/loco/loco-northline-lead.png'
import northlinePlant from '../assets/uploads/loco/loco-northline-plant.png'

import greenbeltLead from '../assets/uploads/loco/loco-greenbelt-lead.png'
import greenbeltPlant from '../assets/uploads/loco/loco-greenbelt-plant.png'

import riverportLead from '../assets/uploads/loco/loco-riverport-lead.png'
import riverportPlant from '../assets/uploads/loco/loco-riverport-plant.png'

const PLANT_VISUALS = {
  northline: {
    lead: northlineLead,
    site: northlinePlant,
    leadObjectPosition: '50% 28%',
  },
  greenbelt: {
    lead: greenbeltLead,
    site: greenbeltPlant,
    leadObjectPosition: '50% 22%',
  },
  riverport: {
    lead: riverportLead,
    site: riverportPlant,
    leadObjectPosition: '50% 18%',
  },
}

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

function siteTimeZoneAbbrev(tick, iana) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: iana,
      timeZoneName: 'short',
    }).formatToParts(tick)
    return parts.find((x) => x.type === 'timeZoneName')?.value ?? ''
  } catch {
    return ''
  }
}

function IcCal() {
  return (
    <svg className="aviora-port-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" />
    </svg>
  )
}

function IcPeople() {
  return (
    <svg className="aviora-port-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  )
}

function IcClock() {
  return (
    <svg className="aviora-port-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.59V7h-2v6l5 3 .9-1.45-3.9-1.96z" />
    </svg>
  )
}

function IcShield() {
  return (
    <svg className="aviora-port-ico" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="currentColor" d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z" />
    </svg>
  )
}

function MiniDonut({ value, color, track }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <svg width="66" height="66" viewBox="0 0 66 66" aria-hidden="true">
      <circle cx="33" cy="33" r={r} fill="none" stroke={track} strokeWidth="8" />
      <circle
        cx="33"
        cy="33"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${(pct / 100) * c} ${c}`}
        transform="rotate(-90 33 33)"
      />
      <text x="33" y="38" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0f172a">
        {pct}%
      </text>
    </svg>
  )
}

function OutputRing({ pct, tone }) {
  const color = tone === 'good' ? '#16a34a' : tone === 'warn' ? '#f97316' : '#dc2626'
  const track = tone === 'good' ? '#dcfce7' : tone === 'warn' ? '#ffedd5' : '#fee2e2'
  return (
    <div className="aviora-port-completion">
      <MiniDonut value={pct} color={color} track={track} />
      <span className="aviora-port-completion-label">Output</span>
    </div>
  )
}

function PlantCard({ p, nowTick }) {
  const visuals = PLANT_VISUALS[p.id]
  const tone =
    p.statusKey === 'operational'
      ? 'good'
      : p.statusKey === 'monitoring'
        ? 'warn'
        : 'bad'

  const accent =
    tone === 'good'
      ? { main: '#16a34a', track: '#dcfce7' }
      : tone === 'warn'
        ? { main: '#f97316', track: '#ffedd5' }
        : { main: '#dc2626', track: '#fee2e2' }

  const statusLabel =
    tone === 'good' ? 'Operational' : tone === 'warn' ? 'Monitoring' : 'At Risk'

  const siteHhmm = siteClock24(nowTick, p.siteTimeZone)
  const siteTzAbbr = siteTimeZoneAbbrev(nowTick, p.siteTimeZone)

  return (
    <Link
      to="/plant"
      className={`aviora-port-card aviora-port-card--link aviora-port-card--${tone}`}
      aria-label={`Open plant dashboard for ${p.name}`}
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
            <img src={visuals.lead} alt="" loading="lazy" decoding="async" style={{ objectPosition: visuals.leadObjectPosition }} />
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

        <div className="aviora-port-site-thumb" aria-hidden="true" title="Plant preview">
          <img src={visuals.site} alt="" loading="lazy" decoding="async" />
        </div>
      </div>

      <div className="aviora-port-card-mid">
        <div className="aviora-port-stat-col">
          <div className="aviora-port-stat">
            <IcCal />
            <div>
              <span className="aviora-port-stat-label">Shift progress</span>
              <strong>
                {p.shiftProgress.current} / {p.shiftProgress.total}
              </strong>
              <span className="aviora-port-stat-sub">{p.shiftProgress.cyclePct}% of shift</span>
            </div>
          </div>

          <div className="aviora-port-stat">
            <IcPeople />
            <div>
              <span className="aviora-port-stat-label">Operators on floor</span>
              <strong>{p.operators}</strong>
            </div>
          </div>

          <div className="aviora-port-stat">
            <IcClock />
            <div>
              <span className="aviora-port-stat-label">Downtime</span>
              <strong>{p.downtimeHrs} hrs</strong>
            </div>
          </div>

          <div className="aviora-port-stat">
            <IcShield />
            <div>
              <span className="aviora-port-stat-label">Quality yield</span>
              <strong>{p.qualityYield}</strong>
            </div>
          </div>
        </div>

        <div className="aviora-port-ring-wrap">
          <OutputRing pct={p.output.pct} tone={tone} />
          <div className={`aviora-port-completion-caption aviora-port-completion-caption--${tone}`}>
            {tone === 'good' ? '✓' : tone === 'warn' ? '⚠' : '⚠'} {p.output.label}
          </div>
        </div>
      </div>

      <div className="aviora-port-pillars" aria-label="Safety, security, systems, and status">
        <div className="aviora-port-pcol">
          <span className="aviora-port-pcap">Safety</span>
          <MiniDonut value={p.pillars.safetyPct} color={accent.main} track={accent.track} />
        </div>

        <div className="aviora-port-pcol">
          <span className="aviora-port-pcap">Security</span>
          <div className="aviora-port-sec-bars" style={{ ['--aviora-sec-bar']: accent.main }} aria-hidden="true">
            {[34, 52, 66, 78, 88].map((pct, i) => (
              <span key={i} className="aviora-port-sec-bar" style={{ height: `${pct}%` }} />
            ))}
          </div>
          <span className="aviora-port-pfoot">{p.pillars.securityLevel}</span>
        </div>

        <div className="aviora-port-pcol">
          <span className="aviora-port-pcap">Systems</span>
          <svg className="aviora-port-spark" viewBox="0 0 80 36" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              points={tone === 'good' ? '2,28 18,20 34,24 50,18 66,10 78,6' : tone === 'warn' ? '2,8 18,18 34,22 50,26 66,30 78,34' : '2,8 18,16 34,22 50,24 66,30 78,35'}
              fill="none"
              stroke={accent.main}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <span className="aviora-port-pfoot">{p.pillars.systemsPct}%</span>
        </div>

        <div className="aviora-port-pcol">
          <span className="aviora-port-pcap">Status</span>
          <div className="aviora-port-status-stepper" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`aviora-port-status-dot${tone === 'good' || (tone === 'warn' && i < 3) || (tone === 'bad' && i < 1) ? ' is-on' : ''}`}
                style={tone === 'good' || (tone === 'warn' && i < 3) || (tone === 'bad' && i < 1) ? { background: accent.main, borderColor: accent.main } : undefined}
              />
            ))}
          </div>
          <span className="aviora-port-pfoot">{statusLabel}</span>
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

export default function LocoManufacturingPortfolio({ companyName, nowTick }) {
  const tick = nowTick ?? new Date()
  const today = tick.toLocaleDateString(undefined, { dateStyle: 'long' })
  const timeWithTz = tick.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
  const f = LOCO_MANUFACTURING_FOOTER

  return (
    <section className="aviora-port" aria-label="Loco Manufacturing overview">
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
        {LOCO_MANUFACTURING_PLANTS.map((p) => (
          <PlantCard key={p.id} p={p} nowTick={tick} />
        ))}
      </div>

      <footer className="aviora-port-summary">
        <div className="aviora-port-sum-cell">
          <span>Active plants</span>
          <strong>{f.activePlants}</strong>
        </div>
        <div className="aviora-port-sum-cell">
          <span>Total workforce</span>
          <strong>{f.totalWorkforce} on shift</strong>
        </div>
        <div className="aviora-port-sum-cell">
          <span>Portfolio output (avg)</span>
          <strong>{f.portfolioOutputAvg}%</strong>
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
            {f.openIssuesTotal} <span className="aviora-port-sum-sub">across all plants</span>
          </strong>
        </div>
      </footer>
    </section>
  )
}