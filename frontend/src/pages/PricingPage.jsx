const pricingTiers = [
  {
    planId: 'basic',
    name: 'Basic',
    price: '$150 / month',
    bestFor: 'Small teams getting started with digital monitoring.',
    inherit: null,
    highlighted: false,
    blocks: [
      {
        kind: 'list',
        items: [
          {
            ok: true,
            text: 'Machine integration — connect machines to the dashboard (PLC / IoT).',
          },
          {
            ok: true,
            text: 'Basic machine metrics: uptime / downtime, cycle count, core performance data.',
          },
          {
            ok: true,
            text: 'Camera access (security only): live feeds; no AI analysis or alerts.',
          },
          {
            ok: true,
            text: 'Single dashboard and workspace access.',
          },
          {
            ok: true,
            text: 'Limited users (e.g. 2–3 seats).',
          },
        ],
      },
      {
        kind: 'list',
        items: [
          {
            ok: false,
            text: 'No AI insights.',
          },
          {
            ok: false,
            text: 'No anomaly detection.',
          },
          {
            ok: false,
            text: 'No safety / compliance monitoring.',
          },
          {
            ok: false,
            text: 'No multi-location support.',
          },
        ],
      },
    ],
  },

  {
    planId: 'plus',
    name: 'Plus',
    price: '$200 / month',
    bestFor:
      'Growing factories needing automation & safety intelligence.',
    inherit: 'Everything in Basic, plus:',
    highlighted: true,
    blocks: [
      {
        kind: 'subheading',
        text: 'AI-powered factory monitoring',
      },
      {
        kind: 'list',
        items: [
          {
            ok: true,
            text: 'Drone / mobile camera scanning: automated floor coverage and machine activity tracking.',
          },
        ],
      },
      {
        kind: 'subheading',
        text: 'Computer vision insights (detects)',
      },
      {
        kind: 'nested',
        items: [
          'Machine crossings of safety lines',
          'Doors left unlocked',
          'Lights on during off-hours',
          'Worker safety violations',
        ],
      },
      {
        kind: 'list',
        items: [
          {
            ok: true,
            text: 'Advanced analytics: Immediate alerts and visual insights from camera + machine data.',
          },
          {
            ok: true,
            text: 'Event-based alerts for safety and operational anomalies.',
          },
          {
            ok: true,
            text: 'Expanded user access with role-based dashboards (Admin, Manager, Operator).',
          },
          {
            ok: false,
            text: 'Single factory location only.',
          },
        ],
      },
    ],
  },

  {
    planId: 'premium',
    name: 'Premium',
    price: '$300 / month',
    bestFor:
      'Enterprises managing multiple plants with AI-driven intelligence.',
    inherit: 'Everything in Plus, plus:',
    highlighted: false,
    blocks: [
      {
        kind: 'list',
        items: [
          {
            ok: true,
            text: 'Multi-location support: up to 5 factory sites with one centralized dashboard.',
          },
        ],
      },
      {
        kind: 'subheading',
        text: 'Personal AI agent — AskHenry',
      },
      {
        kind: 'nested',
        items: [
          'Natural language queries (e.g. “Which machine had the highest downtime today?”)',
          'On-demand insights & recommendations trained on your factory data',
          'Expandable modules: HR, Maintenance, Production, Compliance',
        ],
      },
      {
        kind: 'subheading',
        text: 'Advanced intelligence layer',
      },
      {
        kind: 'nested',
        items: [
          'Predictive insights (roadmap)',
          'Cross-location performance comparison',
          'Custom KPI dashboards',
        ],
      },
      {
        kind: 'list',
        items: [
          {
            ok: 'addon',
            text: 'Additional locations beyond 5 available at extra cost — scale as you grow.',
          },
        ],
      },
    ],
  },
]

const pricingComparisonRows = [
  {
    feature: 'Machine Integration',
    basic: 'check',
    plus: 'check',
    premium: 'check',
  },
  {
    feature: 'Machine Metrics Dashboard',
    basic: 'check',
    plus: 'check',
    premium: 'check',
  },
  {
    feature: 'Camera Feed (Security)',
    basic: 'check',
    plus: 'check',
    premium: 'check',
  },
  {
    feature: 'AI Vision Monitoring',
    basic: 'cross',
    plus: 'check',
    premium: 'check',
  },
  {
    feature: 'Safety Alerts',
    basic: 'cross',
    plus: 'check',
    premium: 'check',
  },
  {
    feature: 'Drone / Mobile Scanning',
    basic: 'cross',
    plus: 'check',
    premium: 'check',
  },
  {
    feature: 'Locations Included',
    basic: '1',
    plus: '1',
    premium: '5',
  },
  {
    feature: 'Additional Locations',
    basic: 'cross',
    plus: 'cross',
    premium: 'Paid On',
  },
  {
    feature: 'AskHenry AI Agent',
    basic: 'cross',
    plus: 'cross',
    premium: 'check',
  },
  {
    feature: 'Multi-Location Dashboard',
    basic: 'cross',
    plus: 'cross',
    premium: 'check',
  },
]

function renderPricingBlock(block) {
  if (block.kind === 'subheading') {
    return (
      <p className="pricing-subhead">
        {block.text}
      </p>
    )
  }

  if (block.kind === 'nested') {
    return (
      <ul className="pricing-nested">
        {block.items.map((line) => (
          <li key={line}>
            {line}
          </li>
        ))}
      </ul>
    )
  }

  if (block.kind === 'list') {
    return (
      <ul className="pricing-items">
        {block.items.map((item) => {
          const isOut = item.ok === false
          const isAddon = item.ok === 'addon'

          return (
            <li
              key={item.text}
              className={
                isOut
                  ? 'is-out'
                  : isAddon
                    ? 'is-addon'
                    : 'is-in'
              }
            >
              <span
                className="pricing-item-icon"
                aria-hidden="true"
              >
                {isOut
                  ? '✕'
                  : isAddon
                    ? '+'
                    : '✓'}
              </span>

              <span className="pricing-item-text">
                {item.text}
              </span>
            </li>
          )
        })}
      </ul>
    )
  }

  return null
}

function renderComparisonValue(value) {
  if (value === 'check') {
    return (
      <span className="pricing-compare-icon is-check">
        ✓
      </span>
    )
  }

  if (value === 'cross') {
    return (
      <span className="pricing-compare-icon is-cross">
        ✕
      </span>
    )
  }

  return (
    <span className="pricing-compare-text">
      {value}
    </span>
  )
}

function PricingPage({ onGetStarted }) {
  return (
    <section
      id="pricing"
      className="pricing-section"
    >
      <h2 className="pricing-title">
        Pricing
      </h2>

      <p className="pricing-lead">
        Choose a plan that fits your operations. Scale seamlessly
        as your business grows with flexible features and
        transparent pricing.
      </p>

      <div className="pricing-grid">
        {pricingTiers.map((tier) => (
          <article
            key={tier.name}
            className={`pricing-card${
              tier.highlighted
                ? ' pricing-card--featured'
                : ''
            }`}
          >
            {tier.highlighted ? (
              <span className="pricing-ribbon">
                Popular
              </span>
            ) : null}

            <h3 className="pricing-tier-name">
              {tier.name}
            </h3>

            <p className="pricing-price">
              {tier.price}
            </p>

            <p className="pricing-best-for">
              <span className="pricing-best-label">
                Best for
              </span>{' '}
              {tier.bestFor}
            </p>

            {tier.inherit ? (
              <p className="pricing-inherit">
                {tier.inherit}
              </p>
            ) : null}

            <div className="pricing-body">
              {tier.blocks.map((block, i) => (
                <div key={`${tier.name}-${i}`}>
                  {renderPricingBlock(block)}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn-pricing-cta"
              onClick={() =>
                onGetStarted(tier.planId)
              }
            >
              Get started
            </button>
          </article>
        ))}
      </div>

      <p className="pricing-footnote">
        Volume pricing and annual billing available.{' '}
        <a href="#request-demo">
          Request a demo
        </a>{' '}
        or{' '}
        <a href="#request-demo">
          contact sales
        </a>{' '}
        for a tailored quote.
      </p>

      <section
        className="pricing-compare"
        aria-label="Pricing feature comparison"
      >
        <h3 className="pricing-compare-title">
          PRICING
        </h3>

        <div className="pricing-compare-wrap">
          <table className="pricing-compare-table">

            <thead>
              <tr>
                <th scope="col">
                  Features
                </th>

                <th scope="col">
                  Basic
                </th>

                <th scope="col">
                  Plus
                </th>

                <th scope="col">
                  Premium
                </th>
              </tr>
            </thead>

            <tbody>
              {pricingComparisonRows.map((row) => (
                <tr key={row.feature}>

                  <th scope="row">
                    {row.feature}
                  </th>

                  <td>
                    {renderComparisonValue(row.basic)}
                  </td>

                  <td>
                    {renderComparisonValue(row.plus)}
                  </td>

                  <td>
                    {renderComparisonValue(row.premium)}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </section>
    </section>
  )
}

export default PricingPage