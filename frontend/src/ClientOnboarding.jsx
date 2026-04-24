import { useState, useEffect, useCallback } from 'react'
import { apiJson, getToken } from './apiClient.js'
import { mapUserFromApi } from './mapUserFromApi.js'
import henryLogo from './assets/henry-logo.png'

const STEPS = [
  'Organization',
  'Size & locations',
  'Key people',
  'Focus & finish',
]

const EMPLOYEE_OPTIONS = [
  { value: '1-50', label: '1 – 50' },
  { value: '51-200', label: '51 – 200' },
  { value: '201-1000', label: '201 – 1,000' },
  { value: '1000+', label: '1,000+' },
]

const SITE_OPTIONS = [
  { value: '1', label: 'One site' },
  { value: '2-5', label: '2 – 5 sites' },
  { value: '6+', label: '6+ sites' },
]

const FOCUS_OPTIONS = [
  { id: 'production', label: 'Production & OEE' },
  { id: 'quality', label: 'Quality & compliance' },
  { id: 'safety', label: 'Safety' },
  { id: 'energy', label: 'Energy & utilities' },
  { id: 'esg', label: 'ESG / sustainability' },
  { id: 'supply', label: 'Supply chain' },
]

function defaultForm(user) {
  let tz
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    tz = 'UTC'
  }
  return {
    organization: {
      displayName: user?.company || '',
      industry: '',
      timeZone: tz,
      phone: '',
      website: '',
      siteManager: '',
    },
    scale: {
      employeeBand: '',
      siteCount: '1',
    },
    primaryAddress: {
      line1: '',
      line2: '',
      city: '',
      region: '',
      postal: '',
      country: 'US',
    },
    additionalSites: [],
    people: {
      primary: { name: '', email: user?.email || '', role: 'Operations' },
      secondary: { name: '', email: '', role: '' },
    },
    focus: {
      areas: [],
    },
  }
}

function mergeLoadedForm(fetched, user) {
  const base = defaultForm(user)
  if (!fetched || typeof fetched !== 'object') return base
  return {
    organization: { ...base.organization, ...(fetched.organization || {}) },
    scale: { ...base.scale, ...(fetched.scale || {}) },
    primaryAddress: { ...base.primaryAddress, ...(fetched.primaryAddress || {}) },
    additionalSites: Array.isArray(fetched.additionalSites) ? fetched.additionalSites : base.additionalSites,
    people: {
      primary: { ...base.people.primary, ...(fetched.people?.primary || {}) },
      secondary: { ...base.people.secondary, ...(fetched.people?.secondary || {}) },
    },
    focus: {
      areas: Array.isArray(fetched.focus?.areas) ? [...fetched.focus.areas] : base.focus.areas,
    },
  }
}

export default function ClientOnboarding({ user, onComplete, onSignOut }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(() => defaultForm(user))
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await apiJson('/api/client/onboarding', { method: 'GET' })
        if (cancelled) return
        if (data.completed) {
          const me = await apiJson('/api/auth/me', { method: 'GET' })
          const u = mapUserFromApi(me.user)
          if (u) onComplete(u)
          return
        }
        setForm(mergeLoadedForm(data.data, user))
      } catch (e) {
        if (!cancelled) setStatus(e?.message || 'Could not load your setup status.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- run once; parent refreshes user on complete
  }, [])

  const setField = useCallback((section, key, value) => {
    setForm((f) => ({
      ...f,
      [section]: typeof f[section] === 'object' && f[section] !== null && !Array.isArray(f[section])
        ? { ...f[section], [key]: value }
        : f[section],
    }))
  }, [])

  const toggleFocus = (id) => {
    setForm((f) => {
      const set = new Set(f.focus.areas)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...f, focus: { areas: [...set] } }
    })
  }

  const validate = (n) => {
    if (n === 0) {
      if (!form.organization.displayName?.trim()) return 'Enter your organization name.'
      if (!form.primaryAddress.line1?.trim()) return 'Street address is required.'
      if (!form.primaryAddress.city?.trim()) return 'City is required.'
      if (!form.primaryAddress.country?.trim()) return 'Country is required.'
      if (!form.organization.siteManager?.trim()) return 'Enter the site manager’s name.'
    }
    if (n === 1) {
      if (!form.scale.employeeBand) return 'Select an approximate company size.'
      if (!form.scale.siteCount) return 'Select how many physical locations you operate.'
    }
    if (n === 2) {
      if (!form.people.primary.name?.trim()) return 'Primary contact name is required.'
      if (!form.people.primary.email?.trim()) return 'Primary contact email is required.'
    }
    return ''
  }

  const save = async (complete) => {
    setSaving(true)
    setStatus('')
    try {
      const res = await apiJson('/api/client/onboarding', {
        method: 'PUT',
        body: { data: form, complete },
        token: getToken(),
      })
      const u = mapUserFromApi(res.user)
      if (u) {
        if (complete) onComplete(u)
        return u
      }
    } catch (e) {
      setStatus(e?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
    return null
  }

  const goNext = async () => {
    const err = validate(step)
    if (err) {
      setStatus(err)
      return
    }
    setStatus('')
    const u = await save(false)
    if (u == null) return
    if (step < STEPS.length - 1) setStep((s) => s + 1)
  }

  const goBack = () => {
    setStatus('')
    if (step > 0) setStep((s) => s - 1)
  }

  const finish = async () => {
    const err = validate(2) || validate(1) || validate(0)
    if (err) {
      setStatus(err)
      return
    }
    setStatus('')
    await save(true)
  }

  if (loading) {
    return (
      <div className="onboarding-page">
        <p className="onboarding-lead">Loading workspace setup…</p>
      </div>
    )
  }

  return (
    <div className="onboarding-page">
      <header className="onboarding-header">
        <div className="onboarding-brand">
          <img src={henryLogo} alt="" className="onboarding-logo" width={56} height={56} />
          <div>
            <div className="onboarding-title">Welcome to HENRY</div>
            <div className="onboarding-sub">Set up your workspace — about {STEPS.length} short steps</div>
          </div>
        </div>
        {onSignOut ? (
          <button type="button" className="onboarding-signout" onClick={onSignOut}>
            Sign out
          </button>
        ) : null}
      </header>

      <ol className="onboarding-progress" aria-label="Onboarding progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`onboarding-step-pill${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}
          >
            <span className="onboarding-step-num">{i + 1}</span>
            <span className="onboarding-step-label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="onboarding-card">
        {step === 0 && (
          <section className="onboarding-panel" aria-labelledby="onb-org">
            <h2 id="onb-org">Organization</h2>
            <p className="onboarding-hint">
              Your site details appear in the client workspace and help tune SnapTile defaults.
            </p>
            <label className="onboarding-label">
              Name
              <input
                className="onboarding-input"
                value={form.organization.displayName}
                onChange={(e) => setField('organization', 'displayName', e.target.value)}
                autoComplete="organization"
                required
              />
            </label>
            <h3 className="onboarding-h3">Address</h3>
            <label className="onboarding-label">
              Street line 1
              <input
                className="onboarding-input"
                value={form.primaryAddress.line1}
                onChange={(e) =>
                  setForm((f) => ({ ...f, primaryAddress: { ...f.primaryAddress, line1: e.target.value } }))
                }
                autoComplete="address-line1"
              />
            </label>
            <label className="onboarding-label">
              Street line 2 (optional)
              <input
                className="onboarding-input"
                value={form.primaryAddress.line2}
                onChange={(e) =>
                  setForm((f) => ({ ...f, primaryAddress: { ...f.primaryAddress, line2: e.target.value } }))
                }
                autoComplete="address-line2"
              />
            </label>
            <div className="onboarding-row">
              <label className="onboarding-label">
                City
                <input
                  className="onboarding-input"
                  value={form.primaryAddress.city}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primaryAddress: { ...f.primaryAddress, city: e.target.value } }))
                  }
                  autoComplete="address-level2"
                />
              </label>
              <label className="onboarding-label">
                State / region
                <input
                  className="onboarding-input"
                  value={form.primaryAddress.region}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primaryAddress: { ...f.primaryAddress, region: e.target.value } }))
                  }
                />
              </label>
            </div>
            <div className="onboarding-row">
              <label className="onboarding-label">
                Postal code
                <input
                  className="onboarding-input"
                  value={form.primaryAddress.postal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primaryAddress: { ...f.primaryAddress, postal: e.target.value } }))
                  }
                />
              </label>
              <label className="onboarding-label">
                Country
                <input
                  className="onboarding-input"
                  value={form.primaryAddress.country}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primaryAddress: { ...f.primaryAddress, country: e.target.value } }))
                  }
                  autoComplete="country"
                />
              </label>
            </div>
            <div className="onboarding-row">
              <label className="onboarding-label">
                Phone
                <input
                  className="onboarding-input"
                  type="tel"
                  value={form.organization.phone}
                  onChange={(e) => setField('organization', 'phone', e.target.value)}
                  autoComplete="tel"
                />
              </label>
              <label className="onboarding-label">
                Website
                <input
                  className="onboarding-input"
                  type="url"
                  value={form.organization.website}
                  onChange={(e) => setField('organization', 'website', e.target.value)}
                  placeholder="https://"
                  autoComplete="url"
                />
              </label>
            </div>
            <label className="onboarding-label">
              Site manager
              <input
                className="onboarding-input"
                value={form.organization.siteManager}
                onChange={(e) => setField('organization', 'siteManager', e.target.value)}
                autoComplete="name"
                placeholder="Main on-site contact"
              />
            </label>
            <h3 className="onboarding-h3">More about your org (optional)</h3>
            <label className="onboarding-label">
              Industry (optional)
              <input
                className="onboarding-input"
                value={form.organization.industry}
                onChange={(e) => setField('organization', 'industry', e.target.value)}
                placeholder="e.g. medical devices, automotive"
              />
            </label>
            <label className="onboarding-label">
              Time zone
              <input
                className="onboarding-input"
                value={form.organization.timeZone}
                onChange={(e) => setField('organization', 'timeZone', e.target.value)}
              />
            </label>
          </section>
        )}

        {step === 1 && (
          <section className="onboarding-panel" aria-labelledby="onb-scale">
            <h2 id="onb-scale">Company size & footprint</h2>
            <fieldset className="onboarding-fieldset">
              <legend>Approximate employees</legend>
              <div className="onboarding-radios">
                {EMPLOYEE_OPTIONS.map((o) => (
                  <label key={o.value} className="onboarding-radio">
                    <input
                      type="radio"
                      name="emp"
                      value={o.value}
                      checked={form.scale.employeeBand === o.value}
                      onChange={() => setField('scale', 'employeeBand', o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="onboarding-fieldset">
              <legend>Manufacturing or operations sites</legend>
              <div className="onboarding-radios">
                {SITE_OPTIONS.map((o) => (
                  <label key={o.value} className="onboarding-radio">
                    <input
                      type="radio"
                      name="sites"
                      value={o.value}
                      checked={form.scale.siteCount === o.value}
                      onChange={() => setField('scale', 'siteCount', o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </section>
        )}

        {step === 2 && (
          <section className="onboarding-panel" aria-labelledby="onb-people">
            <h2 id="onb-people">Key people</h2>
            <p className="onboarding-hint">We use this for roll-out contacts and admin alerts. You can add more later.</p>
            <h3 className="onboarding-h3">Primary</h3>
            <div className="onboarding-row">
              <label className="onboarding-label">
                Name
                <input
                  className="onboarding-input"
                  value={form.people.primary.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      people: { ...f.people, primary: { ...f.people.primary, name: e.target.value } },
                    }))
                  }
                />
              </label>
              <label className="onboarding-label">
                Role
                <input
                  className="onboarding-input"
                  value={form.people.primary.role}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      people: { ...f.people, primary: { ...f.people.primary, role: e.target.value } },
                    }))
                  }
                />
              </label>
            </div>
            <label className="onboarding-label">
              Email
              <input
                className="onboarding-input"
                type="email"
                value={form.people.primary.email}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    people: { ...f.people, primary: { ...f.people.primary, email: e.target.value } },
                  }))
                }
              />
            </label>
            <h3 className="onboarding-h3">Secondary (optional)</h3>
            <div className="onboarding-row">
              <label className="onboarding-label">
                Name
                <input
                  className="onboarding-input"
                  value={form.people.secondary.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      people: { ...f.people, secondary: { ...f.people.secondary, name: e.target.value } },
                    }))
                  }
                />
              </label>
              <label className="onboarding-label">
                Role
                <input
                  className="onboarding-input"
                  value={form.people.secondary.role}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      people: { ...f.people, secondary: { ...f.people.secondary, role: e.target.value } },
                    }))
                  }
                />
              </label>
            </div>
            <label className="onboarding-label">
              Email
              <input
                className="onboarding-input"
                type="email"
                value={form.people.secondary.email}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    people: { ...f.people, secondary: { ...f.people.secondary, email: e.target.value } },
                  }))
                }
              />
            </label>
          </section>
        )}

        {step === 3 && (
          <section className="onboarding-panel" aria-labelledby="onb-focus">
            <h2 id="onb-focus">Initial focus & review</h2>
            <p className="onboarding-hint">We tune your SnapTile defaults from these areas (you can change anytime).</p>
            <div className="onboarding-chips">
              {FOCUS_OPTIONS.map((o) => (
                <label key={o.id} className="onboarding-chip">
                  <input
                    type="checkbox"
                    checked={form.focus.areas.includes(o.id)}
                    onChange={() => toggleFocus(o.id)}
                  />
                  {o.label}
                </label>
              ))}
            </div>
            <div className="onboarding-review" role="status">
              <h3 className="onboarding-h3">Summary</h3>
              <ul className="onboarding-review-list">
                <li>
                  <strong>{form.organization.displayName || '—'}</strong>
                  {form.organization.industry ? ` · ${form.organization.industry}` : null}
                  {form.organization.phone ? ` · ${form.organization.phone}` : null}
                  {form.organization.website ? ` · ${form.organization.website}` : null}
                </li>
                <li>Site manager: {form.organization.siteManager || '—'}</li>
                <li>
                  {EMPLOYEE_OPTIONS.find((e) => e.value === form.scale.employeeBand)?.label || '—'} employees ·{' '}
                  {SITE_OPTIONS.find((s) => s.value === form.scale.siteCount)?.label || '—'}
                </li>
                <li>
                  {form.primaryAddress.city ? (
                    <>
                      {form.primaryAddress.line1}, {form.primaryAddress.city}
                      {form.primaryAddress.region ? `, ${form.primaryAddress.region}` : null}
                    </>
                  ) : (
                    '—'
                  )}
                </li>
                <li>Primary: {form.people.primary.name || '—'}</li>
                <li>
                  Focus:{' '}
                  {form.focus.areas.length
                    ? form.focus.areas
                        .map((id) => FOCUS_OPTIONS.find((f) => f.id === id)?.label)
                        .filter(Boolean)
                        .join(', ')
                    : 'General'}
                </li>
              </ul>
            </div>
          </section>
        )}

        {status ? <p className="onboarding-error">{status}</p> : null}

        <div className="onboarding-nav">
          <button type="button" className="onboarding-btn-secondary" onClick={goBack} disabled={step === 0 || saving}>
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="onboarding-btn-primary" onClick={goNext} disabled={saving}>
              {saving ? 'Saving…' : 'Continue'}
            </button>
          ) : (
            <button type="button" className="onboarding-btn-primary" onClick={finish} disabled={saving}>
              {saving ? 'Finishing…' : 'Finish & open workspace'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
