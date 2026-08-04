import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { BrowserRouter } from 'react-router-dom'
import ClientDashboard from './ClientDashboard.jsx'
import ClientOnboarding from './ClientOnboarding.jsx'

import ProductsPage from './pages/ProductsPage.jsx'
import CaseStudiesPage from './pages/CaseStudiesPage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import HomePage from './pages/HomePage.jsx'

import SiteHeader, {
  SHOW_NAV_PRICING_LINK,
} from './components/SiteHeader.jsx'

import SiteFooter from './components/SiteFooter.jsx'
import RequestDemoSection from './components/RequestDemoSection.jsx'
import RequestDemoIntroSection from './components/RequestDemoIntroSection.jsx'

import { DEFAULT_PRODUCT_IDS } from './productCatalog.js'
import { mapUserFromApi } from './mapUserFromApi.js'
import { AUTH_BYPASS, bypassDemoUser } from './authBypass.js'
import {
  ApiError,
  activateDashboardDemo,
  apiJson,
  clearAuth,
  avioraApexDashboardPath,
  clientDashboardBasename,
  getTenantSlug,
  getToken,
  harlandApexDashboardPath,
  isAvioraTenantHostname,
  isAvioraWorkspaceUser,
  isDemoDashboardToken,
  isHarlandTenantHostname,
  isHarlandWorkspaceUser,
  readPersistedDemoPresetKey,
  setToken,
} from './apiClient.js'
import {
  dashboardDemoShortcutsVisible,
  dashboardDemoUser,
  DASHBOARD_DEMO_PRESETS_ORDER,
} from './dashboard/dashboardDemo.js'


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

const PRIMARY_GOAL_OPTIONS = [
  { value: 'improve-efficiency', label: 'Improve efficiency' },
  { value: 'reduce-downtime', label: 'Reduce downtime' },
  { value: 'improve-safety', label: 'Improve safety' },
  { value: 'increase-visibility', label: 'Increase visibility' },
  { value: 'reduce-costs', label: 'Reduce costs' },
]

const INSIGHT_FREQUENCY_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

function SignupOutcomeGoalIcon({ value }) {
  const p = { width: 18, height: 18, viewBox: '0 0 24 24', 'aria-hidden': true }
  switch (value) {
    case 'improve-efficiency':
      return (
        <svg {...p} fill="none">
          <path
            d="M4 18h16v2H4v-2zm2-3h2.5v3H6v-3zm4-4H13v7H10v-7zm4-6h2.5v13H14V5z"
            fill="currentColor"
          />
        </svg>
      )
    case 'reduce-downtime':
      return (
        <svg {...p} fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'improve-safety':
      return (
        <svg {...p} fill="none">
          <path
            d="M12 3l8 4v6c0 5-4 8-8 10-4-2-8-5-8-10V7l8-4z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      )
    case 'increase-visibility':
      return (
        <svg {...p} fill="none">
          <path
            d="M1 12s4-6 11-6 11 6 11 6-4 6-11 6S1 12 1 12z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      )
    case 'reduce-costs':
      return (
        <svg {...p} fill="none">
          <path
            d="M12 2v20M17 5H9.5a2.5 2.5 0 000 5H14a2.5 2.5 0 010 5H7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )
    default:
      return null
  }
}

function SignupFrequencyGlyph({ value }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', 'aria-hidden': true }
  if (value === 'hourly') {
    return (
      <svg {...p}>
        <path d="M13 2L4 14h7l-1 8 10-14h-7l1-6z" fill="currentColor" />
      </svg>
    )
  }
  return (
    <svg {...p} fill="none">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 10h16M9 3v4M15 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const PHONE_COUNTRY_OPTIONS = [
  { value: '+1', label: 'US (+1)' },
  { value: '+44', label: 'UK (+44)' },
  { value: '+91', label: 'IN (+91)' },
  { value: '+61', label: 'AU (+61)' },
  { value: '+49', label: 'DE (+49)' },
  { value: '+33', label: 'FR (+33)' },
  { value: '+81', label: 'JP (+81)' },
  { value: '+971', label: 'UAE (+971)' },
]

const COUNTRY_OPTIONS = (() => {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DisplayNames === 'function') {
      const regions =
        typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('region') : []
      const display = new Intl.DisplayNames(['en'], { type: 'region' })
      const options = regions
        .map((code) => ({ code, name: display.of(code) || code }))
        .filter((item) => item.name && item.name !== item.code)
        .sort((a, b) => a.name.localeCompare(b.name))
      if (options.length) return options
    }
  } catch {
    // Fall back to a safe baseline list if Intl region enumeration is unavailable.
  }
  return [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'IN', name: 'India' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'SG', name: 'Singapore' },
  ]
})()

/** Default HENRY modules suggested when registering from a pricing tier. */
const PLAN_REGISTRATION_DEFAULTS = {
  basic: { productIds: ['core'] },
  plus: { productIds: ['core', 'factory-analytics', 'automation'] },
  premium: { productIds: [...DEFAULT_PRODUCT_IDS] },
}

const PLAN_DISPLAY = {
  basic: { label: 'Basic', price: '$150 / month' },
  plus: { label: 'Plus', price: '$200 / month' },
  premium: { label: 'Premium', price: '$300 / month' },
}
const BOOK_DEMO_URL = 'https://larrya-dostiglobal61.zohobookings.com/#/yourbusinessname'

function defaultOrganizationFromEmail(email) {
  const norm = String(email).trim().toLowerCase()
  const domain = norm.split('@')[1]
  if (!domain) return 'My workspace'
  const main = domain.split('.')[0] || ''
  const word = main.replace(/[^a-z0-9]/g, '')
  if (!word) return 'My workspace'
  return `${word.charAt(0).toUpperCase()}${word.slice(1)} workspace`
}

function signupStatusTone(message) {
  if (!message) return ''
  if (message.includes('already exists')) return 'signup-status-warning'
  if (
    message.includes('does not match') ||
    message.includes('do not match') ||
    message.includes('incorrect') ||
    message.includes('Select at least') ||
    message.includes('Cannot reach the API') ||
    message.includes('not in the selected workspace') ||
    message.includes('Sign-in is unavailable') ||
    message.includes('Sign-in is temporarily unavailable') ||
    message.includes('Sign-in did not finish')
  ) {
    return 'signup-status-error'
  }
  if (
    message.includes('Welcome back') ||
    message.includes('Account created') ||
    message.includes('Signed in as')
  ) {
    return 'signup-status-success'
  }
  return ''
}

function authNetworkHint(err) {
  const msg = String(err?.message || '').trim()
  if (msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('Load failed')) {
    return 'Cannot reach the API. In a terminal run: cd backend then npm run dev (port 5000), keep it running, then try again.'
  }
  return msg
}

/** User-facing login error — prefer API `message` when the backend already explains (503); soften generic 500. */
function signInFailureMessage(apiError, { showDemoShortcutsHint }) {
  const hintFallback = authNetworkHint(apiError)
  if (!(apiError instanceof ApiError)) {
    return hintFallback || 'Email or password does not match. Try again or create an account.'
  }
  const raw = String(apiError.message || '').trim()
  if (apiError.code === 'LOGIN_DATABASE_UNAVAILABLE' || apiError.code === 'LOGIN_SCHEMA_MISMATCH') {
    const body = raw || hintFallback || 'Sign-in is unavailable until the database is ready.'
    const demoFooter = showDemoShortcutsHint
      ? '\n\nYou can use the dashboard preview buttons below (including Aviora) without a password while the API database is offline.'
      : ''
    const devFooter =
      import.meta.env.DEV && apiError.detail ? `\n\nDev detail: ${apiError.detail}` : ''
    return `${body}${demoFooter}${devFooter}`
  }
  if (
    apiError.code === 'LOGIN_SERVER_ERROR' ||
    raw === 'Sign in failed.' ||
    apiError.status === 500 ||
    apiError.status === 503
  ) {
    const body =
      raw && raw !== 'Sign in failed.'
        ? raw
        : 'Sign-in could not finish on our servers. That is usually a temporary outage or a configuration issue—not that your password was wrong.'
    const footer = showDemoShortcutsHint
      ? 'You can use the dashboard preview buttons below without a password.'
      : 'If you need immediate access while this is fixed, ask your rollout contact for status.'
    return `${body}\n\n${footer}`
  }
  return hintFallback || raw || 'Email or password does not match. Try again or create an account.'
}


function App() {
  const isPricingPage =
    typeof window !== 'undefined' &&
    /\/pricing\/?$/.test(window.location.pathname)
  const isProductsPage =
    typeof window !== 'undefined' &&
    /\/products\/?$/.test(window.location.pathname)
  const isCaseStudiesPage =
    typeof window !== 'undefined' &&
    /\/case-studies\/?$/.test(window.location.pathname)
  const isOnboardingPage =
    typeof window !== 'undefined' && /\/onboarding\/?$/.test(window.location.pathname)

  const [showSignup, setShowSignup] = useState(false)
  const [showCaseDemo, setShowCaseDemo] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    companyName: '',
    interest: 'Smart Monitoring Setup',
    notes: '',
  })
  const [status, setStatus] = useState('')
  const [signupForm, setSignupForm] = useState({
    name: '',
    phoneCountryCode: '+1',
    phone: '',
    companyName: '',
    website: '',
    country: '',
    email: '',
    password: '',
    confirmPassword: '',
    industry: '',
    locationCount: '',
    facilityType: '',
    monitorAreas: [],
    setupStructure: '',
    operationSize: '',
    primaryGoal: '',
    insightFrequency: '',
    sampleUploadNames: [],
  })
  const [signupStatus, setSignupStatus] = useState('')
  const [signupStep, setSignupStep] = useState(0)
  const [signupDropActive, setSignupDropActive] = useState(false)
  const sampleFileInputRef = useRef(null)
  const [authMode, setAuthMode] = useState('signup')
  const [forgotPasswordHelpOpen, setForgotPasswordHelpOpen] = useState(false)
  const [signupFromPlan, setSignupFromPlan] = useState(null)
  const [currentUser, setCurrentUser] = useState(() => (AUTH_BYPASS ? bypassDemoUser() : null))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const tenantSlug = getTenantSlug()
  const tenantLabel =
    tenantSlug === 'harland'
      ? 'Harland Medical Systems'
      : tenantSlug === 'aviora'
        ? 'Aviora Construction'
        : null

  useLayoutEffect(() => {
    if (!isProductsPage || typeof window === 'undefined') return undefined

    const hashId = () => {
      const raw = String(window.location.hash || '').replace(/^#/, '')
      return raw ? decodeURIComponent(raw) : ''
    }

    const topOffset = () => {
      const topbar = document.querySelector('.topbar')
      return (topbar ? topbar.getBoundingClientRect().height : 72) + 16
    }

    const scrollToId = (id, behavior) => {
      const el = document.getElementById(id)
      if (!el) return false
      const top = el.getBoundingClientRect().top + window.scrollY - topOffset()
      window.scrollTo({ top: Math.max(0, top), behavior })
      return true
    }

    const prevRestoration = window.history.scrollRestoration
    let attempts = 0
    let cancelled = false
    let timeoutId = 0

    const finish = () => {
      window.history.scrollRestoration = prevRestoration
    }

    const run = () => {
      if (cancelled) return
      const id = hashId()
      if (!id) {
        finish()
        return
      }
      window.history.scrollRestoration = 'manual'
      const behavior = attempts === 0 ? 'smooth' : 'auto'
      if (scrollToId(id, behavior)) {
        finish()
        return
      }
      attempts += 1
      if (attempts < 40) {
        timeoutId = window.setTimeout(run, 50)
      } else {
        finish()
      }
    }

    run()

    const onHashChange = () => {
      attempts = 0
      if (timeoutId) window.clearTimeout(timeoutId)
      run()
    }
    window.addEventListener('hashchange', onHashChange)

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
      window.removeEventListener('hashchange', onHashChange)
      window.history.scrollRestoration = prevRestoration
    }
  }, [isProductsPage])

  useEffect(() => {
    if (AUTH_BYPASS) return

    const ac = new AbortController()

      ; (async () => {
        const tokenSnapshot = getToken()
        if (!tokenSnapshot) return

        if (isDemoDashboardToken(tokenSnapshot)) {
          setCurrentUser(dashboardDemoUser(readPersistedDemoPresetKey()))
          return
        }

        try {
          const data = await apiJson('/api/auth/me', { signal: ac.signal })
          if (ac.signal.aborted) return
          // Ignore stale responses if the user signed in/out while this request was in flight
          if (getToken() !== tokenSnapshot) return
          const u = mapUserFromApi(data.user)
          if (u) setCurrentUser(u)
        } catch (e) {
          if (ac.signal.aborted || e?.name === 'AbortError') return
          if (getToken() === tokenSnapshot) clearAuth()
        }
      })()

    return () => ac.abort()
  }, [])

  /**
   * After sign-in, normalize apex URL to the workspace path: `/harland` (Harland) or `/aviora` (Aviora).
   * Harland subdomain hosts keep the root URL (no `/harland` prefix).
   */
  useEffect(() => {
    if (!currentUser || typeof window === 'undefined') return

    const host = window.location.hostname
    const onHarlandHost = isHarlandTenantHostname(host)
    const onAvioraHost = isAvioraTenantHostname(host)

    const path = window.location.pathname.replace(/\/+$/, '') || '/'
    const allow = (p) => path === p || path.startsWith(`${p}/`)
    if (allow('/onboarding') || allow('/pricing') || allow('/products') || allow('/case-studies')) return

    const harlandUser = isHarlandWorkspaceUser(currentUser)
    const avioraUser = isAvioraWorkspaceUser(currentUser)

    if (harlandUser && !onHarlandHost) {
      if (path === '/harland' || path.startsWith('/harland/')) return
      if (path === '/' || path === '/aviora' || path.startsWith('/aviora/')) {
        window.location.replace(harlandApexDashboardPath())
      }
      return
    }

    if (avioraUser && !onAvioraHost) {
      if (path === '/aviora' || path.startsWith('/aviora/')) return
      if (path === '/' || path === '/harland' || path.startsWith('/harland/')) {
        window.location.replace(avioraApexDashboardPath())
      }
    }
  }, [currentUser])

  useEffect(() => {
    if (AUTH_BYPASS) return
    if (!currentUser || currentUser.onboardingComplete) return
    if (typeof window === 'undefined') return
    const path = window.location.pathname
    if (path === '/onboarding' || path === '/onboarding/') return
    window.location.replace('/onboarding')
  }, [currentUser])

  const signOut = () => {
    clearAuth()
    setCurrentUser(null)
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.replace(/\/+$/, '') || '/'
      if (p === '/harland' || p.startsWith('/harland/') || p === '/aviora' || p.startsWith('/aviora/')) {
        window.location.replace('/')
      }
    }
  }

  const enterBypassWorkspace = () => {
    setCurrentUser(bypassDemoUser())
  }

  const openBookDemo = () => {
    if (typeof window !== 'undefined') {
      window.location.assign(BOOK_DEMO_URL)
    }
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submitContact = async (event) => {
    event.preventDefault()
    setStatus('Submitting...')
    try {
      await apiJson('/api/contact', { method: 'POST', body: form })
      setStatus('Thanks! We received your demo request and will be in touch.')
      setForm({
        name: '',
        email: '',
        companyName: '',
        interest: 'Smart Monitoring Setup',
        notes: '',
      })
    } catch (error) {
      setStatus(error.message)
    }
  }

  const updateSignupField = (event) => {
    const { name, value } = event.target
    setSignupForm((current) => ({ ...current, [name]: value }))
  }

  const toggleSignupMonitorArea = (id) => {
    setSignupForm((current) => {
      const set = new Set(current.monitorAreas || [])
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...current, monitorAreas: [...set] }
    })
  }

  const syncSampleUploadNamesFromFiles = (fileList) => {
    if (!fileList || !fileList.length) {
      setSignupForm((c) => ({ ...c, sampleUploadNames: [] }))
      return
    }
    const names = Array.from(fileList).map((f) => f.name)
    setSignupForm((c) => ({ ...c, sampleUploadNames: names }))
  }

  const onSignupSampleFilesChange = (e) => {
    syncSampleUploadNamesFromFiles(e.target.files)
  }

  const onSignupSampleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setSignupDropActive(false)
    const files = e.dataTransfer?.files
    if (files?.length) syncSampleUploadNamesFromFiles(files)
  }

  const closeSignupModal = () => {
    setShowSignup(false)
    setSignupStatus('')
    setSignupStep(0)
    setSignupFromPlan(null)
    setForgotPasswordHelpOpen(false)
    setSignupForm({
      name: '',
      phoneCountryCode: '+1',
      phone: '',
      companyName: '',
      website: '',
      country: '',
      email: '',
      password: '',
      confirmPassword: '',
      industry: '',
      locationCount: '',
      facilityType: '',
      monitorAreas: [],
      setupStructure: '',
      operationSize: '',
      primaryGoal: '',
      insightFrequency: '',
      sampleUploadNames: [],
    })
  }

  const enterDashboardDemo = (preset) => {
    if (!dashboardDemoShortcutsVisible()) return
    if (!activateDashboardDemo(preset)) return
    setCurrentUser(dashboardDemoUser(readPersistedDemoPresetKey()))
    closeSignupModal()
    setSignupStatus('')
  }

  const dashboardDemoShortcuts = dashboardDemoShortcutsVisible() ? (
    <div className="signup-dashboard-demos" role="group" aria-label="Demo workspaces">
      <p className="signup-dashboard-demos-intro">Browse previews without signing in — data is illustrative only.</p>
      <div className="signup-dashboard-demos-actions">
        {DASHBOARD_DEMO_PRESETS_ORDER.map(([preset, label]) => (
          <button key={preset} type="button" className="signup-demo-dash-btn" onClick={() => enterDashboardDemo(preset)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  ) : null

  const backToHomeFromSignup = () => {
    closeSignupModal()
    if (typeof window !== 'undefined') {
      window.location.assign('/')
    }
  }

  const openCaseDemoModal = (caseStudyTitle) => {
    setStatus('')
    setForm((current) => ({
      ...current,
      notes: current.notes || `Interested in "${caseStudyTitle}" case study.`,
    }))
    setShowCaseDemo(true)
  }

  const closeCaseDemoModal = () => {
    setShowCaseDemo(false)
    setStatus('')
  }

  const openAuthFromAnyPage = (mode = 'signin') => {
    if (typeof window === 'undefined') return
    const onLanding = !isPricingPage && !isProductsPage && !isCaseStudiesPage
    if (onLanding) {
      openAuthModal(mode)
      return
    }
    window.location.assign(`/?auth=${mode}`)
  }

  const openAuthModal = (mode = 'signup', options = {}) => {
    setAuthMode(mode)
    setSignupStatus('')
    setSignupStep(0)
    setForgotPasswordHelpOpen(false)
    const planKey = options.planId
    const validPlan = planKey && PLAN_REGISTRATION_DEFAULTS[planKey] ? planKey : null
    if (mode === 'signup') {
      setSignupFromPlan(validPlan)
      setSignupForm({
        name: '',
        phoneCountryCode: '+1',
        phone: '',
        companyName: '',
        website: '',
        country: '',
        email: '',
        password: '',
        confirmPassword: '',
        industry: '',
        locationCount: '',
        facilityType: '',
        monitorAreas: [],
        setupStructure: '',
        operationSize: '',
        primaryGoal: '',
        insightFrequency: '',
        sampleUploadNames: [],
      })
    } else {
      setSignupFromPlan(null)
      setSignupForm({
        name: '',
        phoneCountryCode: '+1',
        phone: '',
        companyName: '',
        website: '',
        country: '',
        email: '',
        password: '',
        confirmPassword: '',
        industry: '',
        locationCount: '',
        facilityType: '',
        monitorAreas: [],
        setupStructure: '',
        operationSize: '',
        primaryGoal: '',
        insightFrequency: '',
        sampleUploadNames: [],
      })
    }
    setShowSignup(true)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (isPricingPage || isProductsPage || isCaseStudiesPage) return
    const params = new URLSearchParams(window.location.search)
    const auth = params.get('auth')
    if (auth !== 'signin' && auth !== 'signup') return
    openAuthModal(auth)
    params.delete('auth')
    const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash || ''}`
    window.history.replaceState({}, '', next || '/')
  }, [isPricingPage, isProductsPage, isCaseStudiesPage])

  const submitSignup = async (event) => {
    event.preventDefault()
    setSignupStatus('')
    if (signupStep === 0) {
      if (
        !signupForm.name?.trim() ||
        !signupForm.phone?.trim() ||
        !signupForm.companyName?.trim() ||
        !signupForm.country?.trim() ||
        !signupForm.email?.trim() ||
        !signupForm.password ||
        !signupForm.confirmPassword
      ) {
        setSignupStatus('Please fill all required personal details.')
        return
      }
      if (signupForm.password.length < 8) {
        setSignupStatus('Password must be at least 8 characters.')
        return
      }
      if (signupForm.password !== signupForm.confirmPassword) {
        setSignupStatus('Passwords do not match.')
        return
      }
      setSignupStep(1)
      return
    }
    if (signupStep === 1) {
      if (!signupForm.industry || !String(signupForm.locationCount).trim() || !signupForm.facilityType) {
        setSignupStatus('Please complete operational details (industry, locations, and facility type).')
        return
      }
      if (!signupForm.monitorAreas?.length || !signupForm.setupStructure || !signupForm.operationSize) {
        setSignupStatus('Please complete monitoring scope, setup structure, and operation size.')
        return
      }
      setSignupStep(2)
      return
    }
    if (signupStep === 2) {
      if (!signupForm.primaryGoal || !signupForm.insightFrequency) {
        setSignupStatus('Please select your primary goal and how often you want insights.')
        return
      }
    } else {
      return
    }
    const emailKey = signupForm.email.trim().toLowerCase()
    const formattedPhone = `${signupForm.phoneCountryCode || '+1'} ${signupForm.phone.trim()}`.trim()
    const productIds =
      signupFromPlan && PLAN_REGISTRATION_DEFAULTS[signupFromPlan]
        ? [...PLAN_REGISTRATION_DEFAULTS[signupFromPlan].productIds]
        : [...DEFAULT_PRODUCT_IDS]
    try {
      const onboardingData = {
        personal: {
          displayName: signupForm.companyName.trim(),
          line1: '',
          line2: '',
          city: '',
          region: '',
          postal: '',
          country: signupForm.country.trim(),
          phone: formattedPhone,
          website: signupForm.website.trim(),
          siteManager: signupForm.name.trim(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        },
        profile: {
          industry: signupForm.industry,
          locationCount: String(signupForm.locationCount).trim(),
          facilityType: signupForm.facilityType,
        },
        setup: {
          monitorAreas: [...(signupForm.monitorAreas || [])],
          setupStructure: signupForm.setupStructure,
          operationSize: signupForm.operationSize,
        },
        outcomes: {
          primaryGoal: signupForm.primaryGoal,
          insightFrequency: signupForm.insightFrequency,
          sampleUploadNames: [...(signupForm.sampleUploadNames || [])],
          uploadNotes: '',
        },
        organization: {
          displayName: signupForm.companyName.trim(),
          industry: signupForm.industry,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          phone: formattedPhone,
          website: signupForm.website.trim(),
          siteManager: signupForm.name.trim(),
        },
        primaryAddress: {
          line1: '',
          line2: '',
          city: '',
          region: '',
          postal: '',
          country: signupForm.country.trim(),
        },
      }
      const body = {
        email: emailKey,
        password: signupForm.password,
        company:
          tenantSlug === 'harland'
            ? 'Harland Medical Systems'
            : tenantSlug === 'aviora'
              ? 'Aviora Construction Inc'
              : signupForm.companyName.trim() || defaultOrganizationFromEmail(emailKey),
        productIds,
        onboardingData,
        completeOnboarding: true,
      }
      if (signupFromPlan) body.planId = signupFromPlan
      const data = await apiJson('/api/auth/register', {
        method: 'POST',
        body,
        token: null,
      })
      setToken(data.token)
      const u = mapUserFromApi(data.user)
      if (!u) {
        setSignupStatus('Account created but profile could not be loaded. Try Sign In.')
        setAuthMode('signin')
        return
      }
      setCurrentUser(u)
      closeSignupModal()
      if (typeof window !== 'undefined' && !u.onboardingComplete) {
        window.location.assign('/onboarding')
      }
    } catch (e) {
      const msg = authNetworkHint(e)
      if (msg.includes('already registered')) {
        setAuthMode('signin')
      }
      setSignupStatus(msg)
    }
  }

  const submitSignIn = async (event) => {
    event.preventDefault()
    if (!signupForm.email || !signupForm.password) {
      setSignupStatus('Please enter your email and password.')
      return
    }
    const emailKey = signupForm.email.trim().toLowerCase()
    try {
      const data = await apiJson('/api/auth/login', {
        method: 'POST',
        body: { email: emailKey, password: signupForm.password },
        token: null,
      })
      setToken(data.token)
      const u = mapUserFromApi(data.user)
      if (!u) {
        setSignupStatus('Signed in but profile could not be loaded. Please try again.')
        return
      }
      setCurrentUser(u)
      closeSignupModal()
    } catch (e) {
      const serverLoginFailure =
        e instanceof ApiError &&
        (e.code === 'LOGIN_SERVER_ERROR' ||
          e.code === 'LOGIN_DATABASE_UNAVAILABLE' ||
          e.code === 'LOGIN_SCHEMA_MISMATCH' ||
          e.status === 500 ||
          e.status === 503)
      const apiExplainsFailure =
        e instanceof ApiError &&
        (e.code === 'LOGIN_DATABASE_UNAVAILABLE' || e.code === 'LOGIN_SCHEMA_MISMATCH')
      let msg =
        e instanceof ApiError
          ? signInFailureMessage(e, { showDemoShortcutsHint: dashboardDemoShortcutsVisible() })
          : authNetworkHint(e) || 'Email or password does not match. Try again or create an account.'
      if (
        import.meta.env.DEV &&
        serverLoginFailure &&
        e instanceof ApiError &&
        e.detail &&
        !apiExplainsFailure
      ) {
        msg = `${msg}\n\nDev: ${e.detail}`
      }
      if (import.meta.env.DEV && apiExplainsFailure && e instanceof ApiError && e.detail) {
        msg = `${msg}\n\nDev: ${e.detail}`
      }
      setSignupStatus(msg)
    }
  }

  const continueWithGoogle = () => {
    setSignupStatus('Google sign-in will connect when you add OAuth in production.')
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onResize = () => {
      if (window.innerWidth > 900) setMobileMenuOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const renderMobileMenu = (links) => {
    if (!mobileMenuOpen) return null
    const goTo = (href) => {
      setMobileMenuOpen(false)
      if (typeof window !== 'undefined') {
        window.location.assign(href)
      }
    }
    return (
      <section className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
        <nav className="mobile-menu" aria-label="Mobile navigation" onClick={(e) => e.stopPropagation()}>
          {links.map((item) => (
            <button
              key={`${item.href}-${item.label}`}
              type="button"
              className="mobile-menu-link"
              onClick={() => goTo(item.href)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </section>
    )
  }

  const mobileNavLinks = [
    { href: '/products', label: 'Products' },
    { href: '/products', label: '• SnapShot' },
    { href: '/products#safety', label: '   ◦ Safety' },
    { href: '/products#security', label: '   ◦ Security' },
    { href: '/products#systems', label: '   ◦ Systems' },
    { href: '/products#status', label: '   ◦ Status' },
    { href: '/case-studies', label: 'CASE STUDIES' },
    ...(SHOW_NAV_PRICING_LINK ? [{ href: '/pricing', label: 'PRICING' }] : []),
    { href: '/#about', label: 'ABOUT' },
    { href: '/#request-demo', label: 'CONTACT' },
  ]

  if (currentUser && isOnboardingPage && !currentUser.onboardingComplete) {
    return (
      <div className="page page--onboarding">
        <ClientOnboarding
          user={currentUser}
          onComplete={(u) => {
            setCurrentUser(u)
            if (typeof window !== 'undefined') {
              const host = window.location.hostname
              const apexHarland = isHarlandWorkspaceUser(u) && !isHarlandTenantHostname(host)
              const apexAviora = isAvioraWorkspaceUser(u) && !isAvioraTenantHostname(host)
              window.location.replace(
                apexHarland ? harlandApexDashboardPath() : apexAviora ? avioraApexDashboardPath() : '/',
              )
            }
          }}
          onSignOut={signOut}
        />
      </div>
    )
  }

  if (currentUser && !currentUser.onboardingComplete) {
    return (
      <div className="page page--onboarding-wait" aria-live="polite">
        <p className="onboarding-wait-text">Opening workspace setup…</p>
      </div>
    )
  }

  const currentPath =
    typeof window !== 'undefined'
      ? window.location.pathname.replace(/\/+$/, '') || '/'
      : '/'

  const dashboardBase = currentUser ? clientDashboardBasename(currentUser) : ''
  const isDashboardPage =
    currentUser &&
    dashboardBase &&
    (currentPath === dashboardBase || currentPath.startsWith(`${dashboardBase}/`))

  if (isDashboardPage && !isOnboardingPage && !isPricingPage && !isProductsPage && !isCaseStudiesPage) {
    return (
      <BrowserRouter basename={dashboardBase}>
        <div className="page page--client">
          <ClientDashboard key={currentUser.email} user={currentUser} onSignOut={signOut} />
        </div>
      </BrowserRouter>
    )
  }

  if (isPricingPage) {
    return (
      <div className="page">

        <SiteHeader
          currentUser={currentUser}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          mobileNavLinks={mobileNavLinks}
          renderMobileMenu={renderMobileMenu}
          openAuthFromAnyPage={openAuthFromAnyPage}
          signOut={signOut}
        />

        <PricingPage
          onGetStarted={(planId) =>
            AUTH_BYPASS
              ? enterBypassWorkspace()
              : openAuthModal('signup', { planId })
          }
        />

        <RequestDemoIntroSection />

        <RequestDemoSection
          form={form}
          status={status}
          updateField={updateField}
          submitContact={submitContact}
        />

        <SiteFooter />

      </div>
    )
  }

  if (isProductsPage) {
    return (
      <div className="page">
        <SiteHeader
          currentUser={currentUser}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          mobileNavLinks={mobileNavLinks}
          renderMobileMenu={renderMobileMenu}
          openAuthFromAnyPage={openAuthFromAnyPage}
          signOut={signOut}
        />

        <ProductsPage
          openBookDemo={openBookDemo}
        />

        <RequestDemoIntroSection />

        <RequestDemoSection
          form={form}
          status={status}
          updateField={updateField}
          submitContact={submitContact}
        />

        <SiteFooter />
      </div>
    )
  }

  if (isCaseStudiesPage) {
    return (
      <div className="page page-case-studies">
        <SiteHeader
          currentUser={currentUser}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          mobileNavLinks={mobileNavLinks}
          renderMobileMenu={renderMobileMenu}
          openAuthFromAnyPage={openAuthFromAnyPage}
          signOut={signOut}
        />

        <CaseStudiesPage
          showCaseDemo={showCaseDemo}
          openCaseDemoModal={openCaseDemoModal}
          closeCaseDemoModal={closeCaseDemoModal}
          form={form}
          status={status}
          updateField={updateField}
          submitContact={submitContact}
        />

        <RequestDemoIntroSection />

        <RequestDemoSection
          form={form}
          status={status}
          updateField={updateField}
          submitContact={submitContact}
        />

        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="page">
      <SiteHeader
        currentUser={currentUser}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileNavLinks={mobileNavLinks}
        renderMobileMenu={renderMobileMenu}
        openAuthFromAnyPage={openAuthFromAnyPage}
        signOut={signOut}
      />

      <HomePage
        authBypass={AUTH_BYPASS}
        onGetStarted={() =>
          AUTH_BYPASS
            ? enterBypassWorkspace()
            : openAuthModal('signup')
        }
      />

      {showSignup ? (
        <section
          className="signup-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby={authMode === 'signin' ? 'signin-title' : 'onboarding-title'}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeSignupModal()
          }}
        >
          <div className="signup-modal">
            <button
              type="button"
              className="signup-close"
              aria-label="Close"
              onClick={closeSignupModal}
            >
              ×
            </button>
            <div className={`signup-modal-grid${authMode === 'signin' ? ' signup-modal-grid--signin' : ''}`}>
              <div className={`signup-panel${authMode === 'signin' ? ' signup-panel--signin' : ''}`}>
                <div
                  className={`signup-glass${authMode === 'signin' ? ' signup-glass--signin' : ' signup-glass--signup'}`}
                >
                  <div className="signup-auth-switch">
                    <button
                      type="button"
                      className={authMode === 'signup' ? 'active' : ''}
                      onClick={() => {
                        setAuthMode('signup')
                        setSignupStatus('')
                        setSignupFromPlan(null)
                        setForgotPasswordHelpOpen(false)
                        setSignupStep(0)
                        setSignupForm({
                          name: '',
                          phoneCountryCode: '+1',
                          phone: '',
                          companyName: '',
                          website: '',
                          country: '',
                          email: '',
                          password: '',
                          confirmPassword: '',
                          industry: '',
                          locationCount: '',
                          facilityType: '',
                          monitorAreas: [],
                          setupStructure: '',
                          operationSize: '',
                          primaryGoal: '',
                          insightFrequency: '',
                          sampleUploadNames: [],
                        })
                      }}
                    >
                      Sign Up
                    </button>
                    <button
                      type="button"
                      className={authMode === 'signin' ? 'active' : ''}
                      onClick={() => {
                        setAuthMode('signin')
                        setSignupStatus('')
                        setSignupFromPlan(null)
                        setForgotPasswordHelpOpen(false)
                      }}
                    >
                      Sign In
                    </button>
                  </div>
                  {authMode === 'signup' ? (
                    <>
                      {tenantLabel ? (
                        <p className="signup-tenant-context">Tenant workspace: {tenantLabel}</p>
                      ) : null}
                      {signupFromPlan ? (
                        <p className="signup-pricing-context">
                          <span className="signup-pricing-context-label">Pricing</span>
                          <strong>{PLAN_DISPLAY[signupFromPlan].label}</strong>
                          <span className="signup-pricing-context-price">{PLAN_DISPLAY[signupFromPlan].price}</span>
                        </p>
                      ) : null}
                      <div className="onboarding-stepper onboarding-stepper--3" aria-label="Signup steps">
                        <span
                          className={`onboarding-step-node ${signupStep > 0 ? 'done' : ''} ${signupStep === 0 ? 'active' : ''
                            }`}
                        >
                          <span className="onboarding-step-dot">{signupStep > 0 ? '✓' : '1'}</span>
                          <span className="onboarding-step-caption">Personal Information</span>
                        </span>
                        <span className="onboarding-stepper-line" aria-hidden="true" />
                        <span
                          className={`onboarding-step-node ${signupStep > 1 ? 'done' : ''} ${signupStep === 1 ? 'active' : ''
                            }`}
                        >
                          <span className="onboarding-step-dot">{signupStep > 1 ? '✓' : '2'}</span>
                          <span className="onboarding-step-caption">Operational Questions</span>
                        </span>
                        <span className="onboarding-stepper-line" aria-hidden="true" />
                        <span
                          className={`onboarding-step-node ${signupStep === 2 ? 'active' : ''}`}
                        >
                          <span className="onboarding-step-dot">3</span>
                          <span className="onboarding-step-caption">Outcome-Oriented Questions</span>
                        </span>
                      </div>
                      <h3 id="onboarding-title">
                        {signupStep === 0
                          ? 'Create Your Account'
                          : signupStep === 1
                            ? 'Operational Questions'
                            : 'Outcome-Oriented Questions'}
                      </h3>
                      <p className="signup-glass-hint">
                        {signupStep === 0
                          ? 'Step 1 of 3 — enter your personal and company details.'
                          : signupStep === 1
                            ? 'Step 2 of 3 — help us understand how you operate.'
                            : 'This is where we personalise value.'}
                      </p>
                      <form className="signup-form-new" onSubmit={submitSignup}>
                        {signupStep === 0 ? (
                          <>
                            <label className="signup-field signup-field--stack">
                              <span className="signup-field-label">Full Name</span>
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <input
                                name="name"
                                type="text"
                                autoComplete="name"
                                value={signupForm.name}
                                onChange={updateSignupField}
                                placeholder="Enter your full name"
                              />
                            </label>
                            <label className="signup-field signup-field--stack">
                              <span className="signup-field-label">Phone Number</span>
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <div className="signup-phone-row">
                                <select
                                  className="signup-phone-code"
                                  name="phoneCountryCode"
                                  aria-label="Phone country code"
                                  value={signupForm.phoneCountryCode}
                                  onChange={updateSignupField}
                                >
                                  {PHONE_COUNTRY_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  name="phone"
                                  type="tel"
                                  autoComplete="tel"
                                  value={signupForm.phone}
                                  onChange={updateSignupField}
                                  placeholder="98765 43210"
                                />
                              </div>
                            </label>
                            <label className="signup-field signup-field--stack">
                              <span className="signup-field-label">Company Email</span>
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <input
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={signupForm.email}
                                onChange={updateSignupField}
                                placeholder="name@company.com"
                              />
                            </label>
                            <label className="signup-field signup-field--stack">
                              <span className="signup-field-label">Company Name</span>
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <input
                                name="companyName"
                                type="text"
                                autoComplete="organization"
                                value={signupForm.companyName}
                                onChange={updateSignupField}
                                placeholder="Enter your company name"
                              />
                            </label>
                            <label className="signup-field signup-field--stack">
                              <span className="signup-field-label">Website (Optional)</span>
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <input
                                name="website"
                                type="url"
                                autoComplete="url"
                                value={signupForm.website}
                                onChange={updateSignupField}
                                placeholder="Website (optional)"
                              />
                            </label>
                            <label className="signup-field signup-field--stack">
                              <span className="signup-field-label">Country</span>
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <select
                                name="country"
                                autoComplete="country-name"
                                value={signupForm.country}
                                onChange={updateSignupField}
                              >
                                <option value="">Select country</option>
                                {COUNTRY_OPTIONS.map((country) => (
                                  <option key={country.code} value={country.name}>
                                    {country.name}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="signup-field signup-field--stack">
                              <span className="signup-field-label">Password</span>
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <input
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                value={signupForm.password}
                                onChange={updateSignupField}
                                placeholder="Password"
                              />
                            </label>
                            <label className="signup-field signup-field--stack">
                              <span className="signup-field-label">Confirm Password</span>
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <input
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={signupForm.confirmPassword}
                                onChange={updateSignupField}
                                placeholder="Confirm password"
                              />
                            </label>
                          </>
                        ) : null}
                        {signupStep === 1 ? (
                          <>
                            <label className="signup-field">
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <select name="industry" value={signupForm.industry} onChange={updateSignupField}>
                                {INDUSTRY_OPTIONS.map((opt) => (
                                  <option key={opt.value || 'none'} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="signup-field">
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <input
                                name="locationCount"
                                type="number"
                                min="1"
                                value={signupForm.locationCount}
                                onChange={updateSignupField}
                                placeholder="Number of locations"
                              />
                            </label>
                            <label className="signup-field">
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <select name="facilityType" value={signupForm.facilityType} onChange={updateSignupField}>
                                <option value="">Facility type</option>
                                {FACILITY_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="signup-field">
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <select name="setupStructure" value={signupForm.setupStructure} onChange={updateSignupField}>
                                <option value="">Setup structure</option>
                                {SETUP_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="signup-field">
                              <span className="signup-field-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                  <path
                                    d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                    fill="currentColor"
                                    opacity=".85"
                                  />
                                </svg>
                              </span>
                              <select name="operationSize" value={signupForm.operationSize} onChange={updateSignupField}>
                                <option value="">Operation size</option>
                                {OPERATION_SIZE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <fieldset className="signup-field">
                              <legend>What do you want to monitor?</legend>
                              <div>
                                {MONITOR_OPTIONS.map((o) => (
                                  <label key={o.id} style={{ display: 'block', marginBottom: '0.25rem' }}>
                                    <input
                                      type="checkbox"
                                      checked={signupForm.monitorAreas.includes(o.id)}
                                      onChange={() => toggleSignupMonitorArea(o.id)}
                                    />{' '}
                                    {o.label}
                                  </label>
                                ))}
                              </div>
                            </fieldset>
                          </>
                        ) : null}
                        {signupStep === 2 ? (
                          <div className="signup-step3">
                            <div className="signup-outcome-block">
                              <p className="signup-outcome-q">1. What is your primary goal?</p>
                              <div className="signup-outcome-goal-list" role="radiogroup" aria-label="Primary goal">
                                {PRIMARY_GOAL_OPTIONS.map((opt) => (
                                  <label
                                    key={opt.value}
                                    className={`signup-outcome-goal-card ${signupForm.primaryGoal === opt.value ? 'is-selected' : ''
                                      }`}
                                  >
                                    <input
                                      type="radio"
                                      name="primaryGoal"
                                      value={opt.value}
                                      checked={signupForm.primaryGoal === opt.value}
                                      onChange={updateSignupField}
                                    />
                                    <span className="signup-outcome-goal-icon" aria-hidden="true">
                                      <SignupOutcomeGoalIcon value={opt.value} />
                                    </span>
                                    <span className="signup-outcome-goal-text">{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="signup-outcome-block">
                              <p className="signup-outcome-q">2. How often do you want insights?</p>
                              <div
                                className="signup-outcome-frequency"
                                role="radiogroup"
                                aria-label="Insight frequency"
                              >
                                {INSIGHT_FREQUENCY_OPTIONS.map((opt) => (
                                  <label
                                    key={opt.value}
                                    className={`signup-outcome-frequency-card ${signupForm.insightFrequency === opt.value ? 'is-selected' : ''
                                      }`}
                                  >
                                    <input
                                      type="radio"
                                      name="insightFrequency"
                                      value={opt.value}
                                      checked={signupForm.insightFrequency === opt.value}
                                      onChange={updateSignupField}
                                    />
                                    <span className="signup-outcome-frequency-ic" aria-hidden="true">
                                      <SignupFrequencyGlyph value={opt.value} />
                                    </span>
                                    <span className="signup-outcome-frequency-text">{opt.label}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="signup-outcome-block">
                              <p className="signup-outcome-q">
                                3. <span className="signup-outcome-optional-label">Optional</span>
                                <span className="signup-outcome-optional-rest"> (You can skip this)</span>
                              </p>
                              <p className="signup-outcome-upload-hint">Upload sample data / images</p>
                              <div
                                className={`signup-dropzone ${signupDropActive ? 'is-active' : ''}`}
                                onDragEnter={(e) => {
                                  e.preventDefault()
                                  setSignupDropActive(true)
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault()
                                  setSignupDropActive(true)
                                }}
                                onDragLeave={() => setSignupDropActive(false)}
                                onDrop={onSignupSampleDrop}
                              >
                                <input
                                  ref={sampleFileInputRef}
                                  type="file"
                                  multiple
                                  className="signup-sample-file-input"
                                  accept=".csv,.xlsx,.xls,.jpg,.jpeg,.png"
                                  onChange={onSignupSampleFilesChange}
                                />
                                <span className="signup-dropzone-cloud" aria-hidden="true">
                                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path
                                      d="M7 18a4 4 0 004 4h7a4 4 0 00.57-7.97A5 5 0 0012 4a5 5 0 00-5 5v1"
                                      stroke="#2563eb"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M12 11v8m0 0l-2.5-2.5M12 19l2.5-2.5"
                                      stroke="#2563eb"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                                <p className="signup-dropzone-text">Drag and drop files here or</p>
                                <button
                                  type="button"
                                  className="signup-choose-files-btn"
                                  onClick={() => sampleFileInputRef.current?.click()}
                                >
                                  Choose Files
                                </button>
                                <p className="signup-dropzone-foot">
                                  Supports .csv, .xlsx, .jpg, .png (Max 25MB)
                                </p>
                                {signupForm.sampleUploadNames?.length ? (
                                  <p className="signup-dropzone-names">
                                    {signupForm.sampleUploadNames.join(', ')}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {signupStep < 2 ? (
                          <div className="onboarding-actions-row">
                            {signupStep > 0 ? (
                              <button
                                type="button"
                                className="btn-onboarding-back"
                                onClick={() => {
                                  setSignupStep((s) => Math.max(0, s - 1))
                                  setSignupStatus('')
                                }}
                              >
                                Back
                              </button>
                            ) : (
                              <span />
                            )}
                            <button type="submit" className="btn-start-monitoring onboarding-next">
                              Continue
                            </button>
                          </div>
                        ) : (
                          <div className="onboarding-actions-stack signup-step3-submit-stack">
                            <button type="submit" className="btn-start-monitoring onboarding-next btn-complete-setup-arrow">
                              Complete Setup <span aria-hidden="true">→</span>
                            </button>
                            <button
                              type="button"
                              className="signup-step3-back-link"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setSignupStep(1)
                                setSignupStatus('')
                              }}
                            >
                              ← Back
                            </button>
                          </div>
                        )}
                        {signupStep === 0 ? (
                          <>
                            <p className="signup-login-inline">
                              Already have an account?{' '}
                              <button
                                type="button"
                                className="signup-login-inline-link"
                                onClick={() => {
                                  setAuthMode('signin')
                                  setSignupStatus('')
                                  setSignupFromPlan(null)
                                }}
                              >
                                Log In
                              </button>
                            </p>
                            <div className="signup-trust-row signup-trust-row--icons">
                              <span>SSL Secured</span>
                              <span>Enterprise Ready</span>
                              <span>Your data remains private</span>
                            </div>
                          </>
                        ) : signupStep === 1 ? (
                          <button type="button" className="signup-bailout" onClick={backToHomeFromSignup}>
                            Maybe later — Back to Home
                          </button>
                        ) : (
                          <div className="signup-trust-row signup-trust-row--icons">
                            <span>SSL Secured</span>
                            <span>Enterprise Ready</span>
                            <span>Your data remains private</span>
                          </div>
                        )}
                        {signupStatus ? (
                          <p className={`signup-status-new ${signupStatusTone(signupStatus)}`}>{signupStatus}</p>
                        ) : null}
                        {signupStep === 1 ? dashboardDemoShortcuts : null}
                      </form>
                    </>
                  ) : (
                    <>
                      {tenantLabel ? (
                        <p className="signup-tenant-context">Tenant workspace: {tenantLabel}</p>
                      ) : null}
                      <div className="signup-signin-badge">Secure sign in</div>
                      <h3 id="signin-title">Welcome Back</h3>
                      <p className="signup-glass-hint">
                        Enter the same email and password you used when you created your HENRY account.
                      </p>
                      <form className="signup-form-new" onSubmit={submitSignIn}>
                        <label className="signup-field">
                          <span className="signup-field-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M4 6h16v12H4V6zm2 2v8h12V8H6zm4 2h4v1h-4v-1z"
                                fill="currentColor"
                                opacity=".85"
                              />
                            </svg>
                          </span>
                          <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={signupForm.email}
                            onChange={updateSignupField}
                            placeholder="Email"
                          />
                        </label>
                        <label className="signup-field">
                          <span className="signup-field-icon" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z"
                                fill="currentColor"
                                opacity=".85"
                              />
                            </svg>
                          </span>
                          <input
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            value={signupForm.password}
                            onChange={updateSignupField}
                            placeholder="Password"
                          />
                        </label>
                        <div className="signup-forgot-row">
                          <button
                            type="button"
                            className="signup-forgot-password"
                            onClick={() => {
                              setForgotPasswordHelpOpen(true)
                              setSignupStatus('')
                            }}
                          >
                            Forgot Password?
                          </button>
                        </div>
                        {forgotPasswordHelpOpen ? (
                          <p className="signup-forgot-help" role="status">
                            Self-service password reset is not enabled yet. Email{' '}
                            <a href="mailto:info@goaskhenry.com?subject=HENRY%20password%20help">
                              info@goaskhenry.com
                            </a>{' '}
                            from your work address and we will help you regain access.
                          </p>
                        ) : null}
                        <button type="submit" className="btn-start-monitoring">
                          Sign In
                        </button>
                        <div className="signup-or">
                          <span>or</span>
                        </div>
                        <button type="button" className="btn-google" onClick={continueWithGoogle}>
                          <svg className="google-g" width="18" height="18" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </button>
                        <button type="button" className="signup-bailout" onClick={backToHomeFromSignup}>
                          Maybe later — Back to Home
                        </button>
                        {signupStatus ? (
                          <p className={`signup-status-new ${signupStatusTone(signupStatus)}`}>{signupStatus}</p>
                        ) : null}
                        {dashboardDemoShortcuts}
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}


      <RequestDemoIntroSection />

      <RequestDemoSection
        form={form}
        status={status}
        updateField={updateField}
        submitContact={submitContact}
      />

      <SiteFooter />
    </div>
  )
}

export default App
