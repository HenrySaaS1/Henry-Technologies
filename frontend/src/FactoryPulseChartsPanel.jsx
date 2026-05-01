import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COL = {
  partA: '#1e3a8a',
  partB: '#ea580c',
  pass: '#16a34a',
  fail: '#dc2626',
  grid: '#e2e8f0',
  axis: '#64748b',
}

const WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const TOTAL_PARTS_RAN = [
  { day: 'SUN', parts: 4100 },
  { day: 'MON', parts: 5900 },
  { day: 'TUE', parts: 6450 },
  { day: 'WED', parts: 8200 },
  { day: 'THU', parts: 7650 },
  { day: 'FRI', parts: 6980 },
  { day: 'SAT', parts: 4950 },
]

const PARTS_DISTRIBUTION = [
  { name: 'Part A', value: 80.75 },
  { name: 'Part B', value: 19.25 },
]

const TEST_RESULTS = [
  { name: 'Passed', value: 95.28 },
  { name: 'Failed', value: 4.72 },
]

const PARTS_BY_DAY = WEEK.map((day, i) => ({
  day,
  partA: [4200, 5100, 5400, 5800, 5600, 5200, 3800][i],
  partB: [980, 1100, 1050, 1200, 1150, 1080, 900][i],
}))

const EFFICIENCY = [
  { day: 'SUN', pct: 68.5 },
  { day: 'MON', pct: 72 },
  { day: 'TUE', pct: 74 },
  { day: 'WED', pct: 79 },
  { day: 'THU', pct: 79.5 },
  { day: 'FRI', pct: 76 },
  { day: 'SAT', pct: 64 },
]

const DAILY_SCRAP = WEEK.map((day, i) => ({
  day,
  qty: [118, 132, 125, 140, 128, 175, 200][i],
  saturday: i === 6,
}))

function kTick(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`
  return String(v)
}

function ChartCard({ title, children }) {
  return (
    <div className="client-fpulse-card">
      <h4 className="client-fpulse-card-title">{title}</h4>
      <div className="client-fpulse-card-chart">{children}</div>
    </div>
  )
}

/**
 * Inline Factory Pulse-style visuals for BU dashboards. Demo data — wire to historians / Power BI-backed API when ready.
 */
export default function FactoryPulseChartsPanel({ reportUrl, heading = 'Factory pulse' }) {
  return (
    <div className="client-fpulse-root">
      {reportUrl ? (
        <a className="client-bu-pbi-open" href={reportUrl} target="_blank" rel="noopener noreferrer">
          Open in Power BI
        </a>
      ) : null}
      <p className="client-fpulse-heading">{heading}</p>
      <div className="client-fpulse-grid">
        <ChartCard title="Total Parts Ran Over Time">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={TOTAL_PARTS_RAN} margin={{ top: 4, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COL.grid} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: COL.axis }} interval={0} />
              <YAxis tickFormatter={kTick} tick={{ fontSize: 10, fill: COL.axis }} domain={[3500, 'auto']} />
              <Tooltip formatter={(v) => [v.toLocaleString(), 'Parts']} labelFormatter={(l) => l} />
              <Line type="monotone" dataKey="parts" stroke={COL.partA} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Parts Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={PARTS_DISTRIBUTION}
                cx="50%"
                cy="50%"
                outerRadius={68}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={false}
              >
                {[COL.partA, COL.partB].map((c) => (
                  <Cell key={c} fill={c} stroke="#fff" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Test Results">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={TEST_RESULTS}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={68}
                dataKey="value"
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={false}
              >
                {[COL.pass, COL.fail].map((c) => (
                  <Cell key={c} fill={c} stroke="#fff" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Parts by Day">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={PARTS_BY_DAY} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COL.grid} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: COL.axis }} interval={0} />
              <YAxis tickFormatter={kTick} tick={{ fontSize: 10, fill: COL.axis }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="partA" name="Part A" fill={COL.partA} radius={[2, 2, 0, 0]} />
              <Bar dataKey="partB" name="Part B" fill={COL.partB} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Efficiency">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={EFFICIENCY} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COL.grid} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: COL.axis }} interval={0} />
              <YAxis domain={[65, 'auto']} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: COL.axis }} />
              <Tooltip formatter={(v) => [`${v}%`, 'Efficiency']} />
              <Line type="monotone" dataKey="pct" stroke={COL.partB} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Scrap Quantity">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DAILY_SCRAP} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COL.grid} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: COL.axis }} interval={0} />
              <YAxis tick={{ fontSize: 10, fill: COL.axis }} />
              <Tooltip formatter={(v) => [v, 'Qty']} />
              <Bar dataKey="qty" name="Scrap" radius={[3, 3, 0, 0]}>
                {DAILY_SCRAP.map((entry) => (
                  <Cell key={entry.day} fill={entry.saturday ? COL.fail : COL.partA} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
