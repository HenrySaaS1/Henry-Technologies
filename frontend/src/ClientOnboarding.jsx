import { useState, useEffect, useCallback } from 'react'
import { apiJson, getToken } from './apiClient.js'
import { mapUserFromApi } from './mapUserFromApi.js'
import henryLogo from './assets/henry-logo.png'

const STEPS = [
  'Personal information',
  'Sign up questions',
]

const INDUSTRY_OPTIONS = [
  { value: '', label: 'Select your industry' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'medical-devices', label: 'Medical devices' },
  { value: 'pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'food-beverage', label: 'Food & beverage' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'other', label: 'Other' },
]

const FACILITY_OPTIONS = [
  { value: 'factory', label: 'Factory / Production Plant' },
  { value: 'warehouse', label: 'Warehouse / Distribution Center' },
  { value: 'office', label: 'Office / Corporate Site' },
  { value: 'mixed', label: 'Mixed' },
]

const MONITOR_OPTIONS = [
  { id: 'production-output', label: 'Production / Output' },
  { id: 'machine-performance', label: 'Machine Performance' },
  { id: 'safety-compliance', label: 'Safety & Compliance' },
  { id: 'security-access', label: 'Security / Access' },
  { id: 'workforce-activity', label: 'Workforce Activity' },
]

const SETUP_OPTIONS = [
  { value: 'multi-units-lines', label: 'Multiple business units / production lines' },
  { value: 'single-line', label: 'Single production line' },
  { value: 'departments-zones', label: 'Departments / zones' },
  { value: 'not-sure', label: 'Not sure' },
]

const OPERATION_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '200+', label: '200+' },
]

function defaultForm(user) {
  let tz
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    tz = 'UTC'
  }
  return {
    personal: {
      displayName: user?.company || '',
      line1: '',
      line2: '',
      city: '',
      region: '',
      postal: '',
      country: 'US',
      phone: '',
      website: '',
      siteManager: '',
      timeZone: tz,
    },
    profile: {
      industry: '',
      locationCount: '',
      facilityType: '',
    },
    setup: {
      monitorAreas: [],
      setupStructure: '',
      operationSize: '',
    },
  }
}

function mergeLoadedForm(fetched, user) {
  const base = defaultForm(user)
  if (!fetched || typeof fetched !== 'object') return base

  // Backward-compatible mapping from older onboarding shapes.
  const org = fetched.organization || {}
  const addr = fetched.primaryAddress || {}
  const oldIndustry = org.industry || ''
  const oldLocationCount = fetched.scale?.siteCount || ''
  const oldMonitorAreas = Array.isArray(fetched.focus?.areas) ? fetched.focus.areas : []

  const legacyPersonal = {
    displayName: org.displayName,
    line1: addr.line1,
    line2: addr.line2,
    city: addr.city,
    region: addr.region,
    postal: addr.postal,
    country: addr.country,
    phone: org.phone,
    website: org.website,
    siteManager: org.siteManager,
    timeZone: org.timeZone,
  }

  const legacyDefined = Object.fromEntries(
    Object.entries(legacyPersonal).filter(([, v]) => v != null),
  )

  return {
    personal: {
      ...base.personal,
      ...legacyDefined,
      ...(fetched.personal || {}),
    },
    profile: {
      ...base.profile,
      ...(fetched.profile || {}),
      industry: fetched.profile?.industry || oldIndustry,
      locationCount: fetched.profile?.locationCount || oldLocationCount,
    },
    setup: {
      ...base.setup,
      ...(fetched.setup || {}),
      monitorAreas: Array.isArray(fetched.setup?.monitorAreas)
        ? [...fetched.setup.monitorAreas]
        : oldMonitorAreas,
    },
  }
}

/** Mirrors personal → legacy keys so the API can update `user.company` from organization.displayName. */
function formToOnboardingPayload(form) {
  const { personal, profile, setup } = form
  return {
    personal,
    profile,
    setup,
    organization: {
      displayName: personal.displayName,
      industry: profile.industry,
      timeZone: personal.timeZone,
      phone: personal.phone,
      website: personal.website,
      siteManager: personal.siteManager,
    },
    primaryAddress: {
      line1: personal.line1,
      line2: personal.line2,
      city: personal.city,
      region: personal.region,
      postal: personal.postal,
      country: personal.country,
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

  const toggleMonitorArea = (id) => {
    setForm((f) => {
      const set = new Set(f.setup.monitorAreas)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...f, setup: { ...f.setup, monitorAreas: [...set] } }
    })
  }

  const validate = (n) => {
    if (n === 0) {
      if (!form.personal.displayName?.trim()) return 'Enter your organization name.'
      if (!form.personal.line1?.trim()) return 'Street address is required.'
      if (!form.personal.city?.trim()) return 'City is required.'
      if (!form.personal.country?.trim()) return 'Country is required.'
      if (!form.personal.siteManager?.trim()) return 'Enter the site manager’s name.'
    }
    if (n === 1) {
      if (!form.profile.industry) return 'Select your industry.'
      if (!String(form.profile.locationCount).trim()) return 'Enter number of locations.'
      if (!form.profile.facilityType) return 'Select what best describes your facility.'
      if (!form.setup.monitorAreas.length) return 'Select at least one monitoring focus.'
      if (!form.setup.setupStructure) return 'Select how your setup is structured.'
      if (!form.setup.operationSize) return 'Select your operation size.'
    }
    return ''
  }

  const save = async (complete) => {
    setSaving(true)
    setStatus('')
    try {
      const res = await apiJson('/api/client/onboarding', {
        method: 'PUT',
        body: { data: formToOnboardingPayload(form), complete },
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
    const err = validate(1) || validate(0)
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
          <section className="onboarding-panel" aria-labelledby="onb-personal">
            <h2 id="onb-personal">Personal information</h2>
            <p className="onboarding-hint">
              Step 1 of 2 — Your site details appear in the client workspace and help tune HENRY defaults.
            </p>
            <label className="onboarding-label">
              Organization name
              <input
                className="onboarding-input"
                value={form.personal.displayName}
                onChange={(e) => setField('personal', 'displayName', e.target.value)}
                autoComplete="organization"
                required
              />
            </label>
            <h3 className="onboarding-h3">Address</h3>
            <label className="onboarding-label">
              Street line 1
              <input
                className="onboarding-input"
                value={form.personal.line1}
                onChange={(e) => setField('personal', 'line1', e.target.value)}
                autoComplete="address-line1"
              />
            </label>
            <label className="onboarding-label">
              Street line 2 (optional)
              <input
                className="onboarding-input"
                value={form.personal.line2}
                onChange={(e) => setField('personal', 'line2', e.target.value)}
                autoComplete="address-line2"
              />
            </label>
            <div className="onboarding-row">
              <label className="onboarding-label">
                City
                <input
                  className="onboarding-input"
                  value={form.personal.city}
                  onChange={(e) => setField('personal', 'city', e.target.value)}
                  autoComplete="address-level2"
                />
              </label>
              <label className="onboarding-label">
                State / region
                <input
                  className="onboarding-input"
                  value={form.personal.region}
                  onChange={(e) => setField('personal', 'region', e.target.value)}
                />
              </label>
            </div>
            <div className="onboarding-row">
              <label className="onboarding-label">
                Postal code
                <input
                  className="onboarding-input"
                  value={form.personal.postal}
                  onChange={(e) => setField('personal', 'postal', e.target.value)}
                />
              </label>
              <label className="onboarding-label">
                Country
                <input
                  className="onboarding-input"
                  value={form.personal.country}
                  onChange={(e) => setField('personal', 'country', e.target.value)}
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
                  value={form.personal.phone}
                  onChange={(e) => setField('personal', 'phone', e.target.value)}
                  autoComplete="tel"
                />
              </label>
              <label className="onboarding-label">
                Website
                <input
                  className="onboarding-input"
                  type="url"
                  value={form.personal.website}
                  onChange={(e) => setField('personal', 'website', e.target.value)}
                  placeholder="https://"
                  autoComplete="url"
                />
              </label>
            </div>
            <label className="onboarding-label">
              Site manager
              <input
                className="onboarding-input"
                value={form.personal.siteManager}
                onChange={(e) => setField('personal', 'siteManager', e.target.value)}
                autoComplete="name"
                placeholder="Main on-site contact"
              />
            </label>
            <label className="onboarding-label">
              Time zone
              <input
                className="onboarding-input"
                value={form.personal.timeZone}
                onChange={(e) => setField('personal', 'timeZone', e.target.value)}
              />
            </label>
          </section>
        )}

        {step === 1 && (
          <section className="onboarding-panel" aria-labelledby="onb-questions">
            <h2 id="onb-questions">Sign up questions</h2>
            <p className="onboarding-hint">Step 2 of 2 — Tell us about your operation.</p>
            <label className="onboarding-label">
              1. What industry are you in?
              <select
                className="onboarding-input"
                value={form.profile.industry}
                onChange={(e) => setField('profile', 'industry', e.target.value)}
              >
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.value || 'none'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="onboarding-label">
              2. Number of Locations?
              <input
                className="onboarding-input"
                type="number"
                min="1"
                value={form.profile.locationCount}
                onChange={(e) => setField('profile', 'locationCount', e.target.value)}
                placeholder="Enter number of locations"
              />
            </label>
            <fieldset className="onboarding-fieldset">
              <legend>3. What best describes your facility?</legend>
              <div className="onboarding-radios">
                {FACILITY_OPTIONS.map((o) => (
                  <label key={o.value} className="onboarding-radio">
                    <input
                      type="radio"
                      name="facilityType"
                      value={o.value}
                      checked={form.profile.facilityType === o.value}
                      onChange={() => setField('profile', 'facilityType', o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="onboarding-fieldset">
              <legend>4. What Do You Want to Monitor?</legend>
              <div className="onboarding-chips">
                {MONITOR_OPTIONS.map((o) => (
                  <label key={o.id} className="onboarding-chip">
                    <input
                      type="checkbox"
                      checked={form.setup.monitorAreas.includes(o.id)}
                      onChange={() => toggleMonitorArea(o.id)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="onboarding-fieldset">
              <legend>5. How Is Your Setup Structured?</legend>
              <div className="onboarding-radios">
                {SETUP_OPTIONS.map((o) => (
                  <label key={o.value} className="onboarding-radio">
                    <input
                      type="radio"
                      name="setupStructure"
                      value={o.value}
                      checked={form.setup.setupStructure === o.value}
                      onChange={() => setField('setup', 'setupStructure', o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="onboarding-fieldset">
              <legend>6. Roughly how large is your operation?</legend>
              <div className="onboarding-radios">
                {OPERATION_SIZE_OPTIONS.map((o) => (
                  <label key={o.value} className="onboarding-radio">
                    <input
                      type="radio"
                      name="operationSize"
                      value={o.value}
                      checked={form.setup.operationSize === o.value}
                      onChange={() => setField('setup', 'operationSize', o.value)}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="onboarding-review" role="status">
              <h3 className="onboarding-h3">Summary</h3>
              <ul className="onboarding-review-list">
                <li>
                  <strong>{form.personal.displayName || '—'}</strong>
                  {form.personal.phone ? ` · ${form.personal.phone}` : null}
                  {form.personal.website ? ` · ${form.personal.website}` : null}
                </li>
                <li>Site manager: {form.personal.siteManager || '—'}</li>
                <li>
                  {form.personal.city ? (
                    <>
                      {form.personal.line1}, {form.personal.city}
                      {form.personal.region ? `, ${form.personal.region}` : null} · {form.personal.country}
                    </>
                  ) : (
                    '—'
                  )}
                </li>
                <li>
                  Industry:{' '}
                  {INDUSTRY_OPTIONS.find((opt) => opt.value === form.profile.industry)?.label || '—'}
                </li>
                <li>Locations: {form.profile.locationCount || '—'}</li>
                <li>
                  Facility:{' '}
                  {FACILITY_OPTIONS.find((opt) => opt.value === form.profile.facilityType)?.label || '—'}
                </li>
                <li>
                  Monitor:{' '}
                  {form.setup.monitorAreas.length
                    ? form.setup.monitorAreas
                        .map((id) => MONITOR_OPTIONS.find((opt) => opt.id === id)?.label)
                        .filter(Boolean)
                        .join(', ')
                    : '—'}
                </li>
                <li>
                  Setup: {SETUP_OPTIONS.find((opt) => opt.value === form.setup.setupStructure)?.label || '—'}
                </li>
                <li>
                  Size: {OPERATION_SIZE_OPTIONS.find((opt) => opt.value === form.setup.operationSize)?.label || '—'}
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
