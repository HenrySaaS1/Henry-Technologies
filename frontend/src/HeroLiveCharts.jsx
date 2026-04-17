import { useId } from 'react'

/**
 * Decorative “live report” charts for the mobile hero top-left (marketing demo).
 */
export default function HeroLiveChartsHud() {
  const gid = useId().replace(/:/g, '')

  return (
    <div className="hero-live-charts" aria-hidden="true">
      <div className="hero-chart-card">
        <div className="hero-chart-card-head">
          <span className="hero-chart-live-dot" />
          <span>Throughput</span>
        </div>
        <svg className="hero-spark-svg" viewBox="0 0 120 38" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`${gid}-sp`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <path
            className="hero-spark-path"
            fill="none"
            stroke={`url(#${gid}-sp)`}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2,32 C18,30 26,34 38,24 S58,6 76,16 S98,26 118,8"
          />
        </svg>
        <span className="hero-chart-foot">512 u/hr · rolling</span>
      </div>

      <div className="hero-chart-card hero-chart-card--compact">
        <div className="hero-chart-card-head">
          <span className="hero-chart-live-dot hero-chart-live-dot--slow" />
          <span>Shift mix</span>
        </div>
        <div className="hero-bar-chart" role="presentation">
          <span className="hero-bar" style={{ '--h': '38%' }} />
          <span className="hero-bar" style={{ '--h': '62%' }} />
          <span className="hero-bar" style={{ '--h': '48%' }} />
          <span className="hero-bar" style={{ '--h': '72%' }} />
          <span className="hero-bar" style={{ '--h': '55%' }} />
        </div>
        <span className="hero-chart-foot">OEE 94% · live</span>
      </div>

      <div className="hero-chart-card hero-chart-card--compact">
        <div className="hero-chart-card-head">
          <span className="hero-chart-live-dot" />
          <span>Reports queue</span>
        </div>
        <div className="hero-queue-lines" role="presentation">
          <span className="hero-queue-line hero-queue-line--a" />
          <span className="hero-queue-line hero-queue-line--b" />
          <span className="hero-queue-line hero-queue-line--c" />
        </div>
        <span className="hero-chart-foot">3 exports · syncing</span>
      </div>
    </div>
  )
}
