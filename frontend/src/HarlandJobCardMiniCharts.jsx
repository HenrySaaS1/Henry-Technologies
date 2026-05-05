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

const WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const TOTAL_PARTS_RAN = WEEK.map((day, i) => ({
  day,
  parts: [4100, 5900, 6450, 8200, 7650, 6980, 4950][i],
}))

const PARTS_DISTRIBUTION = [
  { name: 'A', value: 80.75 },
  { name: 'B', value: 19.25 },
]

const TEST_RESULTS = [
  { name: 'P', value: 95.28 },
  { name: 'F', value: 4.72 },
]

const PARTS_BY_DAY = WEEK.map((day, i) => ({
  day,
  partA: [4200, 5100, 5400, 5800, 5600, 5200, 3800][i],
  partB: [980, 1100, 1050, 1200, 1150, 1080, 900][i],
}))

const EFFICIENCY = WEEK.map((day, i) => ({
  day,
  pct: [68.5, 72, 74, 79, 79.5, 76, 64][i],
}))

const DAILY_SCRAP = WEEK.map((day, i) => ({
  day,
  qty: [118, 132, 125, 140, 128, 175, 200][i],
  saturday: i === 6,
}))

const MINI_H = 68
const M = { top: 2, right: 2, left: -18, bottom: 0 }

function MiniWrap({ title, children }) {
  return (
    <div className="client-hjob-mini-chart">
      <p className="client-hjob-mini-chart-title">{title}</p>
      <div className="client-hjob-mini-chart-body">{children}</div>
    </div>
  )
}

/** Six factory-pulse-style charts per job card — matches Harland BU reference layout. */
export default function HarlandJobCardMiniCharts() {
  return (
    <div className="client-hjob-mini-grid" aria-hidden="true">
      <MiniWrap title="Total Parts">
        <ResponsiveContainer width="100%" height={MINI_H}>
          <LineChart data={TOTAL_PARTS_RAN} margin={M}>
            <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
            <XAxis dataKey="day" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
            <YAxis hide domain={['auto', 'auto']} />
            <Line type="monotone" dataKey="parts" stroke={COL.partA} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </MiniWrap>
      <MiniWrap title="Distribution">
        <ResponsiveContainer width="100%" height={MINI_H}>
          <PieChart>
            <Pie
              data={PARTS_DISTRIBUTION}
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
              data={TEST_RESULTS}
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
      <MiniWrap title="By day">
        <ResponsiveContainer width="100%" height={MINI_H}>
          <BarChart data={PARTS_BY_DAY} margin={M}>
            <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
            <XAxis dataKey="day" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
            <YAxis hide />
            <Bar dataKey="partA" fill={COL.partA} radius={[1, 1, 0, 0]} />
            <Bar dataKey="partB" fill={COL.partB} radius={[1, 1, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </MiniWrap>
      <MiniWrap title="Efficiency">
        <ResponsiveContainer width="100%" height={MINI_H}>
          <LineChart data={EFFICIENCY} margin={M}>
            <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
            <XAxis dataKey="day" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
            <YAxis hide domain={[60, 'auto']} />
            <Line type="monotone" dataKey="pct" stroke={COL.partB} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </MiniWrap>
      <MiniWrap title="Scrap">
        <ResponsiveContainer width="100%" height={MINI_H}>
          <BarChart data={DAILY_SCRAP} margin={M}>
            <CartesianGrid strokeDasharray="2 2" stroke={COL.grid} />
            <XAxis dataKey="day" tick={{ fontSize: 8, fill: COL.axis }} interval={0} />
            <YAxis hide />
            <Bar dataKey="qty" radius={[1, 1, 0, 0]}>
              {DAILY_SCRAP.map((entry) => (
                <Cell key={entry.day} fill={entry.saturday ? COL.fail : COL.partA} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </MiniWrap>
    </div>
  )
}
