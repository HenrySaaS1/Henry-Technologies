/** Reference-style mini charts for Aviora property sidebar (PR 101–103). */

function DonutCard({ fraction, stroke, centerMain, centerSub, caption }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = Math.min(1, Math.max(0, fraction)) * circ
  return (
    <div className="aviora-snap-card">
      <div className="aviora-snap-ring-wrap">
        <svg className="aviora-snap-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="aviora-snap-ring-cap">
          <strong>{centerMain}</strong>
          <span>{centerSub}</span>
        </div>
      </div>
      {caption ? <p className="aviora-snap-card-cap">{caption}</p> : null}
    </div>
  )
}

function ScheduleBars({ ahead, onTime, behind: behindCount }) {
  const max = Math.max(1, ahead + onTime + behindCount)
  const h = (v) => `${Math.round((v / max) * 100)}%`
  return (
    <div className="aviora-snap-card aviora-snap-card--wide">
      <p className="aviora-snap-card-title">Schedule status</p>
      <div className="aviora-snap-sch-bars">
        <div className="aviora-snap-sch-col">
          <div className="aviora-snap-sch-bar aviora-snap-sch-bar--ahead" style={{ height: h(ahead) }} />
          <span>Ahead</span>
        </div>
        <div className="aviora-snap-sch-col">
          <div className="aviora-snap-sch-bar aviora-snap-sch-bar--on" style={{ height: h(onTime) }} />
          <span>On time</span>
        </div>
        <div className="aviora-snap-sch-col">
          <div className="aviora-snap-sch-bar aviora-snap-sch-bar--behind" style={{ height: h(behindCount) }} />
          <span>Behind</span>
        </div>
      </div>
    </div>
  )
}

function DeliveryStack({ onTrack, atRisk, delayed }) {
  const t = onTrack + atRisk + delayed || 1
  return (
    <div className="aviora-snap-card aviora-snap-card--wide">
      <p className="aviora-snap-card-title">Delivery outlook</p>
      <div className="aviora-snap-stack" role="img" aria-label="Delivery mix">
        <div className="aviora-snap-stack-ok" style={{ flex: onTrack }} />
        <div className="aviora-snap-stack-warn" style={{ flex: atRisk }} />
        <div className="aviora-snap-stack-bad" style={{ flex: delayed }} />
      </div>
      <div className="aviora-snap-stack-legend">
        <span>
          <span className="aviora-snap-dot aviora-snap-dot--ok" aria-hidden="true" /> On track{' '}
          {Math.round((onTrack / t) * 100)}%
        </span>
        <span>
          <span className="aviora-snap-dot aviora-snap-dot--warn" aria-hidden="true" /> At risk{' '}
          {Math.round((atRisk / t) * 100)}%
        </span>
        <span>
          <span className="aviora-snap-dot aviora-snap-dot--bad" aria-hidden="true" /> Delayed{' '}
          {Math.round((delayed / t) * 100)}%
        </span>
      </div>
    </div>
  )
}

/** @param {{ snap: Record<string, unknown> }} props */
export default function AvioraPropertySnapshot({ snap }) {
  if (!snap?.kind) return null

  if (snap.kind === 'skyline') {
    return (
      <div className="aviora-snap-root">
        <div className="aviora-snap-row2">
          <DonutCard
            fraction={snap.crewsActive / snap.crewsTotal}
            stroke="#6366f1"
            centerMain={String(snap.crewsActive)}
            centerSub={`of ${snap.crewsTotal} crews`}
            caption="Active crews"
          />
          <DonutCard
            fraction={snap.completionPct / 100}
            stroke="#0d9488"
            centerMain={`${snap.completionPct}%`}
            centerSub={snap.completionSub}
            caption="Overall completion"
          />
        </div>
        <ScheduleBars ahead={snap.scheduleAhead} onTime={snap.scheduleOnTime} behind={snap.scheduleBehind} />
        <DeliveryStack
          onTrack={snap.deliveryOnTrack}
          atRisk={snap.deliveryAtRisk}
          delayed={snap.deliveryDelayed}
        />
      </div>
    )
  }

  if (snap.kind === 'riverstone') {
    return (
      <div className="aviora-snap-root">
        <div className="aviora-snap-row2">
          <DonutCard
            fraction={snap.crewsActive / 12}
            stroke="#6366f1"
            centerMain={String(snap.crewsActive)}
            centerSub="crews"
            caption={`Active crews · ${snap.crewsDelta}`}
          />
          <DonutCard
            fraction={snap.completionPct / 100}
            stroke="#0d9488"
            centerMain={`${snap.completionPct}%`}
            centerSub="complete"
            caption={`Overall completion · ${snap.completionDelta}`}
          />
        </div>
        <ScheduleBars ahead={snap.scheduleAhead} onTime={snap.scheduleOnTime} behind={snap.scheduleBehind} />
        <DeliveryStack
          onTrack={snap.deliveryOnTrack}
          atRisk={snap.deliveryAtRisk}
          delayed={snap.deliveryDelayed}
        />
      </div>
    )
  }

  if (snap.kind === 'greenfield') {
    const maxT = Math.max(snap.targetPct, snap.actualPct, 1)
    const hT = `${Math.round((snap.targetPct / maxT) * 100)}%`
    const hA = `${Math.round((snap.actualPct / maxT) * 100)}%`
    const ptsRaw = snap.linePoints && snap.linePoints.length ? snap.linePoints : [48, 48, 49, 48, 47, 49, 50]
    const min = Math.min(...ptsRaw)
    const max = Math.max(...ptsRaw, 1)
    const norm =
      ptsRaw.length < 2
        ? [28, 28]
        : ptsRaw.map((p) => {
            const t = max === min ? 0.5 : (p - min) / (max - min)
            return 32 - t * 22
          })

    return (
      <div className="aviora-snap-root">
        <div className="aviora-snap-row2">
          <DonutCard
            fraction={0.72}
            stroke="#6366f1"
            centerMain={String(snap.crewsActive)}
            centerSub="active"
            caption="Active crews"
          />
          <div className="aviora-snap-card">
            <p className="aviora-snap-card-title">Target vs actual</p>
            <div className="aviora-snap-tva">
              <div>
                <span className="aviora-snap-tva-lab">Target</span>
                <div className="aviora-snap-tva-bar">
                  <div className="aviora-snap-tva-fill aviora-snap-tva-fill--tgt" style={{ height: hT }} />
                </div>
                <span className="aviora-snap-tva-pct">{snap.targetPct}%</span>
              </div>
              <div>
                <span className="aviora-snap-tva-lab">Actual</span>
                <div className="aviora-snap-tva-bar">
                  <div className="aviora-snap-tva-fill aviora-snap-tva-fill--act" style={{ height: hA }} />
                </div>
                <span className="aviora-snap-tva-pct">{snap.actualPct}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="aviora-snap-card aviora-snap-card--wide">
          <p className="aviora-snap-card-title">Cycle time trend</p>
          <svg className="aviora-snap-spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
            <polyline
              fill="none"
              stroke="#6366f1"
              strokeWidth="2"
              points={norm.map((y, i) => `${(i / Math.max(1, norm.length - 1)) * 100},${y}`).join(' ')}
            />
          </svg>
        </div>
        <div className="aviora-snap-card aviora-snap-card--wide">
          <p className="aviora-snap-card-title">Material throughput</p>
          <div className="aviora-snap-thru">
            {(snap.throughputBars || []).map((h, i) => (
              <div key={i} className="aviora-snap-thru-bar">
                <div style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
