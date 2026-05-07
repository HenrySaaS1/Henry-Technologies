import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COL = {
  partA: '#1e3a8a',
  partB: '#ea580c',
  pass: '#16a34a',
  fail: '#dc2626',
  grid: '#e5e7eb',
  axis: '#94a3b8',
}

const MINI_H = 68
const M = { top: 2, right: 2, left: -18, bottom: 0 }

/** @typedef {'daily' | 'weekly' | 'monthly'} JobTimeRange */

/** Dummy series per rollup — visibly different shapes per toggle. */
const RANGE_DATA = {
  daily: {
    volumeLabel: 'Total Parts',
    partsRollupTitle: 'By day',
    periods: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    totalParts: [4100, 5900, 6450, 8200, 7650, 6980, 4950],
    partA: [4200, 5100, 5400, 5800, 5600, 5200, 3800],
    partB: [980, 1100, 1050, 1200, 1150, 1080, 900],
    efficiency: [68.5, 72, 74, 79, 79.5, 76, 64],
    scrap: [118, 132, 125, 140, 128, 175, 200],
    scrapHighlightIndex: 6,
    distribution: [
      { name: 'A', value: 80.75 },
      { name: 'B', value: 19.25 },
    ],
    testResults: [
      { name: 'P', value: 95.28 },
      { name: 'F', value: 4.72 },
    ],
  },
  weekly: {
    volumeLabel: 'Total Parts',
    partsRollupTitle: 'By week',
    periods: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
    totalParts: [28800, 31200, 30100, 33500, 31800, 30200],
    partA: [24500, 26800, 25100, 27900, 26200, 25500],
    partB: [4300, 4400, 5000, 5600, 5600, 4700],
    efficiency: [71, 73.5, 72.2, 76.8, 75.1, 74],
    scrap: [820, 760, 890, 705, 810, 680],
    scrapHighlightIndex: 2,
    distribution: [
      { name: 'A', value: 82.4 },
      { name: 'B', value: 17.6 },
    ],
    testResults: [
      { name: 'P', value: 96.1 },
      { name: 'F', value: 3.9 },
    ],
  },
  monthly: {
    volumeLabel: 'Total Parts',
    partsRollupTitle: 'By month',
    periods: ['J', 'F', 'M', 'A', 'M', 'J'],
    totalParts: [118000, 124500, 121200, 129800, 127000, 131200],
    partA: [98500, 103200, 100800, 108500, 105400, 109200],
    partB: [19500, 21300, 20400, 21300, 21600, 22000],
    efficiency: [74.2, 75.8, 74.9, 77.5, 76.8, 78.1],
    scrap: [3200, 2980, 3150, 2720, 2890, 2650],
    scrapHighlightIndex: 2,
    distribution: [
      { name: 'A', value: 77.9 },
      { name: 'B', value: 22.1 },
    ],
    testResults: [
      { name: 'P', value: 97.05 },
      { name: 'F', value: 2.95 },
    ],
  },
}

function buildRows(rangeKey) {
  const d = RANGE_DATA[rangeKey] || RANGE_DATA.daily
  return d.periods.map((period, i) => ({
    period,
    parts: d.totalParts[i],
    partA: d.partA[i],
    partB: d.partB[i],
    pct: d.efficiency[i],
    qty: d.scrap[i],
    scrapSpike: i === d.scrapHighlightIndex,
  }))
}

function MiniWrap({ title, children }) {
  return (
    <div className="client-hjob-mini-chart">
      <p className="client-hjob-mini-chart-title">{title}</p>
      <div className="client-hjob-mini-chart-body">{children}</div>
    </div>
  )
}

/**
 * Factory-pulse mini charts — dummy data swaps by Daily / Weekly / Monthly.
 * If `machinePhotoSrc` is provided we render the photo on the left and 2x2
 * charts on the right (Distribution, Test, Efficiency, Scrap). Otherwise we
 * render the legacy 3x2 grid (TotalParts, Distribution, Test, ByDay,
 * Efficiency, Scrap).
 *
 * @param {{ timeRange?: JobTimeRange, machinePhotoSrc?: string | null, machinePhotoAlt?: string }} props
 */
export default function HarlandJobCardMiniCharts({
  timeRange = 'daily',
  machinePhotoSrc = null,
  machinePhotoAlt = '',
}) {
  const key = RANGE_DATA[timeRange] ? timeRange : 'daily'
  const meta = RANGE_DATA[key]
  const rows = buildRows(key)

  if (machinePhotoSrc) {
    return (
      <div className="client-hjob-with-photo" aria-hidden="true">
        <div className="client-hjob-photo">
          <img src={machinePhotoSrc} alt={machinePhotoAlt} loading="lazy" decoding="async" />
        </div>
        <MiniWrap title="Parts Distribution">
          <ResponsiveContainer width="100%" height={MINI_H}>
            <PieChart>
              <Pie
                data={meta.distribution}
                cx="50%"
                cy="50%"
                outerRadius={22}
                dataKey="value"
                stroke="#fff"
                strokeWidth={1}
              >
                {[COL.partA, COL.partB].map((c) => (
                  <Cell key={c} fill={c} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </MiniWrap>
        <MiniWrap title="Test Results">
          <ResponsiveContainer width="100%" height={MINI_H}>
            <PieChart>
              <Pie
                data={meta.testResults}
                cx="50%"
                cy="50%"
                innerRadius={12}
                outerRadius={22}
                dataKey="value"
                stroke="#fff"
                strokeWidth={1}
              >
                {[COL.pass, COL.fail].map((c) => (
                  <Cell key={c} fill={c} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </MiniWrap>
        <MiniWrap title="Efficiency">
          <ResponsiveContainer width="100%" height={MINI_H}>
            <LineChart data={rows} margin={M}>
              <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
              <XAxis dataKey="period" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
              <YAxis hide domain={[60, 'auto']} />
              <Line type="monotone" dataKey="pct" stroke={COL.partB} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </MiniWrap>
        <MiniWrap title="Monthly Scrap Quantity">
          <ResponsiveContainer width="100%" height={MINI_H}>
            <BarChart data={rows} margin={M}>
              <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
              <XAxis dataKey="period" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
              <YAxis hide />
              <Bar dataKey="qty" radius={[1, 1, 0, 0]}>
                {rows.map((entry) => (
                  <Cell key={entry.period} fill={entry.scrapSpike ? COL.fail : COL.partA} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </MiniWrap>
      </div>
    )
  }

  return (
    <div className="client-hjob-mini-grid" aria-hidden="true">
      <MiniWrap title={meta.volumeLabel}>
        <ResponsiveContainer width="100%" height={MINI_H}>
          <LineChart data={rows} margin={M}>
            <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
            <XAxis dataKey="period" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
            <YAxis hide domain={['auto', 'auto']} />
            <Line type="monotone" dataKey="parts" stroke={COL.partA} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </MiniWrap>
      <MiniWrap title="Distribution">
        <ResponsiveContainer width="100%" height={MINI_H}>
          <PieChart>
            <Pie
              data={meta.distribution}
              cx="50%"
              cy="50%"
              outerRadius={22}
              dataKey="value"
              stroke="#fff"
              strokeWidth={1}
            >
              {[COL.partA, COL.partB].map((c) => (
                <Cell key={c} fill={c} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </MiniWrap>
      <MiniWrap title="Test">
        <ResponsiveContainer width="100%" height={MINI_H}>
          <PieChart>
            <Pie
              data={meta.testResults}
              cx="50%"
              cy="50%"
              innerRadius={12}
              outerRadius={22}
              dataKey="value"
              stroke="#fff"
              strokeWidth={1}
            >
              {[COL.pass, COL.fail].map((c) => (
                <Cell key={c} fill={c} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </MiniWrap>
      <MiniWrap title={meta.partsRollupTitle}>
        <ResponsiveContainer width="100%" height={MINI_H}>
          <BarChart data={rows} margin={M}>
            <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
            <XAxis dataKey="period" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
            <YAxis hide />
            <Bar dataKey="partA" fill={COL.partA} radius={[1, 1, 0, 0]} />
            <Bar dataKey="partB" fill={COL.partB} radius={[1, 1, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </MiniWrap>
      <MiniWrap title="Efficiency">
        <ResponsiveContainer width="100%" height={MINI_H}>
          <LineChart data={rows} margin={M}>
            <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
            <XAxis dataKey="period" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
            <YAxis hide domain={[60, 'auto']} />
            <Line type="monotone" dataKey="pct" stroke={COL.partB} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </MiniWrap>
      <MiniWrap title="Scrap">
        <ResponsiveContainer width="100%" height={MINI_H}>
          <BarChart data={rows} margin={M}>
            <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
            <XAxis dataKey="period" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
            <YAxis hide />
            <Bar dataKey="qty" radius={[1, 1, 0, 0]}>
              {rows.map((entry) => (
                <Cell key={entry.period} fill={entry.scrapSpike ? COL.fail : COL.partA} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </MiniWrap>
    </div>
  )
}
