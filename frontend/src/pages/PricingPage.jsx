import { useState } from 'react'
import './PricingPage.css'

const INITIAL_FORM = {
  company: '', contactName: '', jobTitle: '', email: '', phone: '',
  street: '', addressLine2: '', city: '', region: '', postalCode: '', country: '',
  sameAddress: true, siteStreet: '', siteAddressLine2: '', siteCity: '',
  siteRegion: '', sitePostalCode: '', siteCountry: '',
  facilityType: '', facilities: '', area: '', cameras: '',
  schedule: '8', requirements: '',
}

// Defined outside PricingPage so typing does not remount the input or lose focus.
function Field({ name, label, form, onChange, required = false, hint, wide = false, ...inputProps }) {
  const id = `hc-${name}`
  return (
    <div className={`hc-field${wide ? ' hc-wide' : ''}`}>
      <label htmlFor={id}>{label}{required ? <span aria-hidden="true"> *</span> : <span className="hc-optional"> (optional)</span>}</label>
      <input id={id} name={name} type="text" {...inputProps} required={required}
        value={form[name]} onChange={onChange} aria-describedby={hint ? `${id}-help` : undefined} />
      {hint && <small id={`${id}-help`}>{hint}</small>}
    </div>
  )
}

function AddressFields({ site = false, form, onChange }) {
  const name = (field) => site ? `site${field[0].toUpperCase()}${field.slice(1)}` : field
  const section = site ? 'section-site' : 'section-client'
  const shared = { form, onChange }
  return (
    <div className="hc-grid">
      <Field {...shared} name={name('street')} label="Street address" required wide maxLength={200} autoComplete={`${section} address-line1`} />
      <Field {...shared} name={name('addressLine2')} label="Suite, unit or building" wide maxLength={100} autoComplete={`${section} address-line2`} />
      <Field {...shared} name={name('city')} label="City" required maxLength={100} autoComplete={`${section} address-level2`} />
      <Field {...shared} name={name('region')} label="State / province / region" maxLength={100} autoComplete={`${section} address-level1`} />
      <Field {...shared} name={name('postalCode')} label="ZIP / postal code" maxLength={20} autoComplete={`${section} postal-code`} />
      <Field {...shared} name={name('country')} label="Country" required maxLength={100} autoComplete={`${section} country-name`} />
    </div>
  )
}

export default function PricingPage() {
  const [form, setForm] = useState({ ...INITIAL_FORM })
  const [submitted, setSubmitted] = useState(false)

  const update = (event) => {
    const { name, value, type, checked } = event.target
    setSubmitted(false)
    setForm((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }))
  }

  const submitQuote = (event) => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    // Prototype only: intentionally no API, email, analytics payload or storage write.
    // A future integration should use the client address when sameAddress is true.
    setForm({ ...INITIAL_FORM })
    setSubmitted(true)
  }

  const fieldProps = { form, onChange: update }

  return (
    <main className="henry-configurator">
      <header className="hc-hero">
        <div className="hc-hero-inner">
          <p className="hc-eyebrow">HENRY SnapShot</p>
          <h1>Configure your HENRY solution.</h1>
          <p>Tell us about your facilities and what you need to monitor. Build a request around your safety, security, systems and work progress needs.</p>
          <div className="hc-pillars" aria-label="HENRY monitoring services">
            <span>Safety</span><span>Security</span><span>Systems</span><span>Status</span>
          </div>
        </div>
      </header>

      <div className="hc-layout">
        <aside className="hc-guide" aria-label="Configurator overview">
          <p className="hc-eyebrow">Plan your coverage</p>
          <h2>A solution shaped around your operations.</h2>
          <p>HENRY SnapShot uses AI-powered visual monitoring to help identify safety and security concerns, track equipment conditions, and review work progress.</p>
        </aside>

        <form className="hc-form" onSubmit={submitQuote} aria-label="HENRY solution configurator" aria-describedby="hc-required">
          <p className="hc-required" id="hc-required">Fields marked * are required.</p>

          <fieldset className="hc-section">
            <legend><span className="hc-number" aria-hidden="true">01</span> Company &amp; contact details</legend>
            <p className="hc-section-note">Who is this solution for?</p>
            <div className="hc-grid">
              <Field {...fieldProps} name="company" label="Company name" required wide maxLength={150} autoComplete="organization" />
              <Field {...fieldProps} name="contactName" label="Contact name" required maxLength={120} autoComplete="name" />
              <Field {...fieldProps} name="jobTitle" label="Job title" maxLength={100} autoComplete="organization-title" />
              <Field {...fieldProps} name="email" label="Email address" type="email" required maxLength={254} autoComplete="email" />
              <Field {...fieldProps} name="phone" label="Phone number" type="tel" required maxLength={40} autoComplete="tel" hint="Include your country code, e.g. +1 or +91." />
            </div>
          </fieldset>

          <fieldset className="hc-section">
            <legend><span className="hc-number" aria-hidden="true">02</span> Client &amp; site address</legend>
            <p className="hc-section-note">Enter your company’s contact address.</p>
            <AddressFields {...fieldProps} />
            <label className="hc-checkbox" htmlFor="hc-sameAddress">
              <input id="hc-sameAddress" name="sameAddress" type="checkbox" checked={form.sameAddress} onChange={update} aria-controls="hc-site-address" />
              <span>Monitoring site address is the same as the client address.</span>
            </label>
            {!form.sameAddress && (
              <div id="hc-site-address" className="hc-site-address">
                <h3>Primary monitoring site</h3>
                <p className="hc-section-note">For multiple facilities, enter your primary site here and describe other locations in Additional requirements.</p>
                <AddressFields site {...fieldProps} />
              </div>
            )}
          </fieldset>

          <fieldset className="hc-section">
            <legend><span className="hc-number" aria-hidden="true">03</span> Monitoring requirements</legend>
            <p className="hc-section-note">Tell us about your facilities and monitoring coverage.</p>
            <div className="hc-grid">
              <div className="hc-field">
                <label htmlFor="hc-facilityType">Facility type <span aria-hidden="true">*</span></label>
                <select id="hc-facilityType" name="facilityType" required value={form.facilityType} onChange={update}>
                  <option value="">Select facility type</option>
                  <option value="manufacturing">Factory / manufacturing plant</option>
                  <option value="warehouse">Warehouse / distribution center</option>
                  <option value="construction">Construction site</option>
                  <option value="office">Office / commercial building</option>
                  <option value="mixed">Multiple facility types</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Field {...fieldProps} name="facilities" label="Number of facilities" required type="number" min="1" step="1" inputMode="numeric" placeholder="e.g. 1" />
              <Field {...fieldProps} name="area" label="Total area to be covered (sq m)" required type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="e.g. 2500" hint="Combined area across all facilities." />
              <Field {...fieldProps} name="cameras" label="Number of cameras" type="number" min="0" step="1" inputMode="numeric" placeholder="e.g. 12" hint="Total across all facilities. Leave blank if unsure." />
              <div className="hc-field">
                <label htmlFor="hc-schedule">Monitoring schedule <span aria-hidden="true">*</span></label>
                <select id="hc-schedule" name="schedule" required value={form.schedule} onChange={update}>
                  <option value="8">8 hours per day</option><option value="12">12 hours per day</option><option value="24">24 hours per day</option>
                </select>
              </div>
              <div className="hc-field hc-wide">
                <label htmlFor="hc-requirements">Additional requirements <span className="hc-optional">(optional)</span></label>
                <textarea id="hc-requirements" name="requirements" rows={5} maxLength={3000} value={form.requirements} onChange={update}
                  placeholder="Tell us about other sites, specific concerns, existing cameras, Business Central integration, or your preferred timeline." />
              </div>
            </div>
          </fieldset>

          <div className="hc-actions">
            <button type="submit" className="hc-submit">Request a Quote <span aria-hidden="true">→</span></button>
          </div>
          <div role="status" aria-live="polite" aria-atomic="true">
            {submitted && <p className="hc-success">Form submitted successfully (test only). No information was sent or saved. The form has been reset.</p>}
          </div>
        </form>
      </div>
    </main>
  )
}
