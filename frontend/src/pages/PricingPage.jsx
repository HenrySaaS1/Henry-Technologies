import { useState } from 'react'
import './PricingPage.css'

const PLANS = [
  { name: 'Basic', description: 'A single facility starting with safety and security', price: 'Pricing on request' },
  { name: 'Plus', description: 'Growing operations needing all four pillars', price: 'Pricing on request' },
  { name: 'Enterprise', description: 'Multiple facilities and custom requirements', price: 'Custom pricing' },
]
const FEATURES = [
  [
    "Facilities included",
    "1 facility",
    "1 facility; additional facilities available",
    "As agreed"
  ],
  [
    "Cameras per facility",
    "Up to 4",
    "Up to 12",
    "As agreed"
  ],
  [
    "Monitored areas or zones per facility",
    "Up to 5",
    "Up to 20",
    "Custom"
  ],
  [
    "Safety monitoring",
    "Included",
    "Included",
    "Included"
  ],
  [
    "Security monitoring",
    "Included",
    "Included",
    "Included"
  ],
  [
    "Systems monitoring",
    "Not included",
    "Included",
    "Included"
  ],
  [
    "Status and work progress monitoring",
    "Not included",
    "Included",
    "Included"
  ],
  [
    "Monitoring schedule",
    "Selected shifts, up to 12 hours/day",
    "Up to 24 hours/day",
    "Custom schedules, up to 24 hours/day"
  ],
  [
    "Detection images and event history",
    "7 days",
    "30 days",
    "90 days or custom retention"
  ],
  [
    "User accounts",
    "Up to 3",
    "Up to 10",
    "As agreed"
  ],
  [
    "Dashboards",
    "Facility-level overview",
    "Detailed views by module and zone",
    "Consolidated views across facilities and companies"
  ],
  [
    "Alerts",
    "Standard alerts",
    "Configurable alert rules and recipients",
    "Custom escalation workflows"
  ],
  [
    "Reports",
    "Standard summaries",
    "Scheduled reports and exports",
    "Custom reporting requirements"
  ],
  [
    "Microsoft Dynamics 365 Business Central integration",
    "Optional add-on",
    "Included for 1 company",
    "Multiple companies and custom integration scope"
  ],
  [
    "Camera and robot sources",
    "Fixed cameras and robo-dogs",
    "Fixed cameras, robo-dogs, rover or humanoid integration as an add-on",
    "Custom mix of fixed cameras, rovers and robots"
  ],
  [
    "Onboarding and support",
    "Standard onboarding and email support",
    "Assisted onboarding and priority support",
    "Dedicated onboarding and agreed service levels"
  ]
]
const SERVICES = [
  ['safety', 'Safety only'],
  ['security', 'Security only'],
  ['safety-security', 'Safety + Security'],
  ['safety-security-systems', 'Safety + Security + Systems'],
  ['safety-security-systems-status', 'Safety + Security + Systems + Status'],
]

const INITIAL_CONFIGURATION = { facilities: '', area: '', schedule: '8', services: 'safety-security' }

export default function PricingPage() {
  // Test-only form: no API requests, emails, or storage writes.
  const [configuration, setConfiguration] = useState({ ...INITIAL_CONFIGURATION })
  const [submitted, setSubmitted] = useState(false)
  const update = (event) => {
    const { name, value } = event.target
    setSubmitted(false)
    setConfiguration((previous) => ({ ...previous, [name]: value }))
  }

  const submitQuote = (event) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    setConfiguration({ ...INITIAL_CONFIGURATION })
    setSubmitted(true)
  }

  return (
    <main className="henry-pricing">
      <header className="hp-intro">
        <h1>Visibility for every stage<br className="hp-desktop-break" /> of your operation.</h1>
        <p>Start with safety and security. Expand to systems and work progress as your needs grow.</p>
        <a className="hp-text-link" href="#quote-request">Explore your requirements <span aria-hidden="true">↓</span></a>
      </header>

      <section className="hp-comparison" aria-labelledby="hp-plans-title">
        <div className="hp-section-heading">
          <div><p className="hp-eyebrow">Choose your coverage</p><h2 id="hp-plans-title">Compare plans</h2></div>
          <p>Basic and Plus are priced per facility, per month.<br />Contact us for current pricing.</p>
        </div>
        <p className="hp-scroll-hint" id="hp-table-help">Scroll horizontally to compare all plans on smaller screens.</p>
        <div className="hp-table-scroll" role="region" aria-label="Plan comparison" aria-describedby="hp-table-help" tabIndex={0}>
          <table className="hp-table">
            <caption className="hp-sr-only">HENRY SnapShot subscription features by plan</caption>
            <thead><tr>
              <th scope="col" className="hp-feature-heading">What’s included</th>
              {PLANS.map((plan) => <th scope="col" key={plan.name} className={plan.name === 'Plus' ? 'hp-plus' : ''}>
                <span className="hp-plan-name">{plan.name}</span>
                <span className="hp-plan-description">{plan.description}</span>
                <span className="hp-plan-price">{plan.price}</span>
                <a className={`hp-button ${plan.name === 'Plus' ? 'hp-button-primary' : ''}`} href="/#request-demo" aria-label={`Contact sales about ${plan.name}`}>Contact sales</a>
              </th>)}
            </tr></thead>
            <tbody>{FEATURES.map(([feature, ...values]) => <tr key={feature}>
              <th scope="row">{feature}</th>
              {values.map((value, index) => <td key={PLANS[index].name} className={index === 1 ? 'hp-plus' : ''}>
                {value === 'Included' ? <span className="hp-included"><span aria-hidden="true">✓ </span>Included</span> : value}
              </td>)}
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <div className="hp-quote-band">
      <section className="hp-quote" id="quote-request" aria-labelledby="hp-quote-title">
        <div className="hp-quote-intro">
          <p className="hp-eyebrow">Plan your coverage</p>
          <h2 id="hp-quote-title">Request a quote</h2>
          <p>Tell us what you need to monitor.</p>
          <p id="hp-quote-note" className="hp-note">HENRY SnapShot uses AI-powered visual monitoring to help identify safety and security concerns, track equipment conditions, and review work progress across your facilities.</p>
        </div>
        <form className="hp-form" aria-describedby="hp-quote-note" onSubmit={submitQuote}>
          <div className="hp-fields">
            <div className="hp-field"><label htmlFor="hp-facilities">Number of facilities</label>
              <input id="hp-facilities" name="facilities" type="number" required min="1" step="1" inputMode="numeric" placeholder="e.g. 1" value={configuration.facilities} onChange={update} />
            </div>
            <div className="hp-field"><label htmlFor="hp-area">Total area to be covered (sq m)</label>
              <input id="hp-area" name="area" type="number" required min="0.01" step="0.01" inputMode="decimal" placeholder="e.g. 2500" value={configuration.area} onChange={update} aria-describedby="hp-area-help" />
              <small id="hp-area-help">Combined area across all facilities.</small>
            </div>
            <div className="hp-field"><label htmlFor="hp-schedule">Monitoring schedule</label>
              <select id="hp-schedule" name="schedule" value={configuration.schedule} onChange={update}>
                <option value="8">8 hours</option><option value="12">12 hours</option><option value="24">24 hours</option>
              </select>
            </div>
            <div className="hp-field"><label htmlFor="hp-services">Services</label>
              <select id="hp-services" name="services" value={configuration.services} onChange={update}>
                {SERVICES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          </div>
          <div className="hp-form-actions">
            <button type="submit" className="hp-button hp-button-primary">Get Quote</button>
          </div>
          <div role="status" aria-live="polite" aria-atomic="true">
            {submitted && (
              <p className="hp-quote-success">Form submitted successfully</p>
            )}
          </div>
        </form>
      </section>
      </div>
    </main>
  )
}
