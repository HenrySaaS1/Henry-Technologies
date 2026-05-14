import { AVIORA_SAFETY_FEED, AVIORA_SAFETY_KPIS } from './avioraSafetySecurityData.js'

function toneToGradient(tone) {
  switch (tone) {
    case 'critical':
      return 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 45%, #f97316 100%)'
    case 'warning':
      return 'linear-gradient(135deg, #9a3412 0%, #ea580c 50%, #fbbf24 100%)'
    case 'positive':
      return 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)'
    case 'security':
      return 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #475569 100%)'
    case 'structural':
      return 'linear-gradient(135deg, #334155 0%, #64748b 45%, #94a3b8 100%)'
    case 'weather':
      return 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #38bdf8 100%)'
    default:
      return 'linear-gradient(135deg, #475569, #94a3b8)'
  }
}

function toneLabel(tone) {
  if (tone === 'critical') return 'Critical'
  if (tone === 'warning') return 'Watch'
  if (tone === 'positive') return 'Compliant'
  if (tone === 'security') return 'Security'
  if (tone === 'structural') return 'Structural'
  if (tone === 'weather') return 'Weather'
  return 'Info'
}

function FeedCard({ item }) {
  const pillClass =
    item.tone === 'critical'
      ? 'aviora-ss-feed-pill--bad'
      : item.tone === 'warning'
        ? 'aviora-ss-feed-pill--warn'
        : item.tone === 'positive'
          ? 'aviora-ss-feed-pill--ok'
          : 'aviora-ss-feed-pill--neutral'

  return (
    <article className="aviora-ss-feed-card">
      <div className="aviora-ss-feed-visual">
        {item.imageSrc ? (
          <img src={item.imageSrc} alt="" loading="lazy" decoding="async" className="aviora-ss-feed-img" />
        ) : (
          <div
            className="aviora-ss-feed-placeholder"
            style={{ background: toneToGradient(item.tone) }}
            aria-hidden="true"
          />
        )}
        <span className={`aviora-ss-feed-pill ${pillClass}`}>{toneLabel(item.tone)}</span>
      </div>
      <div className="aviora-ss-feed-body">
        <h3 className="aviora-ss-feed-title">{item.title}</h3>
        <p className="aviora-ss-feed-meta">
          {item.site} · {item.when}
        </p>
        <p className="aviora-ss-feed-summary">{item.summary}</p>
      </div>
    </article>
  )
}

/**
 * @param {{ companyName: string; nowTick?: Date }} props
 */
export default function AvioraSafetySecurityDashboard({ companyName, nowTick }) {
  const tick = nowTick ?? new Date()
  const stamp = tick.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <div className="aviora-ss-root" aria-label="Safety and security overview">
      <p className="aviora-ss-lead">
        <strong>{companyName}</strong> — site safety, perimeter, and compliance (illustrative). Replace thumbnails under{' '}
        <code className="aviora-ss-code">frontend/src/assets/uploads/aviora-security-*.png</code> or edit{' '}
        <code className="aviora-ss-code">avioraSafetySecurityData.js</code>.
      </p>

      <ul className="aviora-ss-kpis" aria-label="Key safety metrics">
        {AVIORA_SAFETY_KPIS.map((k) => (
          <li key={k.id} className={`aviora-ss-kpi aviora-ss-kpi--${k.tone}`}>
            <span className="aviora-ss-kpi-label">{k.label}</span>
            <strong className="aviora-ss-kpi-value">{k.value}</strong>
            <span className="aviora-ss-kpi-hint">{k.hint}</span>
          </li>
        ))}
      </ul>

      <div className="aviora-ss-feed-head">
        <h2 className="aviora-ss-feed-h">Live feed</h2>
        <span className="aviora-ss-feed-stamp">Updated {stamp}</span>
      </div>

      <div className="aviora-ss-feed-grid">
        {AVIORA_SAFETY_FEED.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
