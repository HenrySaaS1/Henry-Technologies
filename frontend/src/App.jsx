import { useState, useEffect } from 'react'
import ClientDashboard from './ClientDashboard.jsx'
import { DEFAULT_PRODUCT_IDS } from './productCatalog.js'
import { mapUserFromApi } from './mapUserFromApi.js'
import { AUTH_BYPASS, bypassDemoUser } from './authBypass.js'
import { apiJson, getToken, setToken, clearAuth } from './apiClient.js'
import heroMainImage from './assets/hero-main.png'
import aiIconImage from './assets/uploads/img-1.png'
import securityIconImage from './assets/uploads/img-3.png'
import analyticsIconImage from './assets/uploads/img-4.png'
import healthcareImage from './assets/uploads/img-6.png'
import pharmaImage from './assets/uploads/img-8.png'
import medicalDevicesImage from './assets/uploads/img-10.png'
import snapshotProductImage from './assets/uploads/product-snapshot-new.png'
import systemsProductImage from './assets/uploads/product-systems-new.png'
import safetyProductImage from './assets/uploads/product-safety-new.png'
import securityProductImage from './assets/uploads/product-security-new.png'
import myhenryProductImage from './assets/uploads/product-myhenry-new.png'
import aboutHenryImage from './assets/about-henry.png'
import henryLogo from './assets/henry-logo.png'
import HeroLiveChartsHud from './HeroLiveCharts.jsx'

const PRODUCT_IMAGES = {
  snapshot: snapshotProductImage,
  systems: systemsProductImage,
  safety: safetyProductImage,
  security: securityProductImage,
  myhenry: myhenryProductImage,
}

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
    message.includes('Select at least')
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

/** Demo tiles for the landing-page mobile snapshot carousel (marketing). */
const snapshotMobileCards = [
  {
    id: 'oee',
    title: 'Plant pulse',
    value: '94.2%',
    unit: 'OEE',
    hint: 'vs target 90%',
    freshness: 'Updated 2 min ago',
    accent: 'blue',
  },
  {
    id: 'units',
    title: 'Throughput',
    value: '512',
    unit: 'units / hr',
    hint: '+3.8% vs morning shift',
    freshness: 'Live shift',
    accent: 'cyan',
  },
  {
    id: 'alerts',
    title: 'Open alerts',
    value: '3',
    unit: 'need attention',
    hint: '2 high · 1 medium',
    freshness: 'Just now',
    accent: 'amber',
  },
  {
    id: 'lines',
    title: 'Lines running',
    value: '12 / 14',
    unit: 'assets',
    hint: 'Press Cell 2 idle',
    freshness: 'Refreshed every 5 min',
    accent: 'violet',
  },
  {
    id: 'snapshot',
    title: 'HENRY Snapshot',
    value: 'Live',
    unit: 'multi-site',
    hint: 'BU 125 · 120 · 140',
    freshness: 'What teams see on mobile',
    accent: 'navy',
  },
]

const solutions = [
  {
    title: 'Real-Time Data Monitoring',
    text: 'Track your production performance and key metrics in real-time to ensure everything runs smoothly and efficiently.',
    image: securityIconImage,
  },
  {
    title: 'AI-Powered Insights',
    text: 'Leverage advanced AI to identify patterns, optimize processes, and predict issues before they happen.',
    image: aiIconImage,
  },
  {
    title: 'Smart Dashboard Reporting',
    text: 'Visualize critical data with easy-to-understand dashboards designed for faster and better decision-making.',
    image: analyticsIconImage,
  },
]

const products = [
  {
    slug: 'snapshot',
    title: 'Snapshot',
    text: 'Get a real-time pulse of your operations in seconds. Track key updates across business units with insights refreshed every few minutes, so you are always in the loop.',
    image: PRODUCT_IMAGES.snapshot,
  },
  {
    slug: 'systems',
    title: 'Systems',
    text: 'A unified view of your entire plant, powered by IIoT. Monitor machines, equipment, and workflows in real time to optimize performance and reduce downtime.',
    image: PRODUCT_IMAGES.systems,
  },
  {
    slug: 'safety',
    title: 'Safety',
    text: 'Proactively detect and prevent safety risks on the factory floor. From boundary violations to unsafe behaviors, stay compliant and protect your workforce at all times.',
    image: PRODUCT_IMAGES.safety,
  },
  {
    slug: 'security',
    title: 'Security',
    text: 'Keep your facility secure with intelligent monitoring. Detect anomalies like unauthorized access, unlocked doors, or suspicious activity, before they become problems.',
    image: PRODUCT_IMAGES.security,
  },
  {
    slug: 'myhenry-agent',
    title: 'MyHenry Agent',
    text: 'Your personalised AI agent trained on your business. Get instant answers, insights, and recommendations across operations, HR, finance, and more, tailored to your workflows.',
    image: PRODUCT_IMAGES.myhenry,
  },
]

const productDetails = [
  {
    slug: 'snapshot',
    title: 'Snapshot',
    intro:
      'HENRY Snapshot gives you a quick, real-time overview of your operations. Stay updated with key metrics across business units within minutes, enabling faster and smarter decision-making.',
    body:
      'Whether you’re monitoring production or tracking performance, Snapshot ensures you always have the latest insights at a glance.',
    bullets: [
      'Live Operational Updates: Get real-time data refreshed at defined intervals',
      'Quick KPI Overview: Track critical metrics without deep dives',
      'Multi-Unit Visibility: Monitor multiple business units from one place',
      'Trend Indicators: Spot patterns and anomalies instantly',
      'Action-Ready Insights: Make faster decisions with concise data',
    ],
    benefits: [
      'Improve operational efficiency',
      'Reduce downtime and errors',
      'Make faster, smarter decisions',
      'Gain full control over business performance',
    ],
    image: PRODUCT_IMAGES.snapshot,
  },
  {
    slug: 'systems',
    title: 'Systems',
    intro:
      'HENRY Systems connects your entire plant through IIoT, providing a unified operational view. From machines to workflows, monitor everything in real time to optimise efficiency and reduce downtime.',
    body:
      'Designed for modern manufacturing, Systems brings clarity and control to complex operations.',
    bullets: [
      'Machine Monitoring: Track equipment performance in real time',
      'IIoT Integration: Seamlessly connect sensors, PLCs, and devices',
      'Downtime Analysis: Identify and reduce operational inefficiencies',
      'Centralised Dashboard: View all systems in one unified interface',
      'Performance Optimisation: Improve output with data-driven insights',
    ],
    benefits: [
      'Increase production efficiency',
      'Identify bottlenecks quickly',
      'Reduce operational costs',
      'Improve decision-making with accurate data',
    ],
    image: PRODUCT_IMAGES.systems,
  },
  {
    slug: 'safety',
    title: 'Safety',
    intro:
      'HENRY Safety ensures a safer workplace through intelligent monitoring and alerts. Detects risks proactively and enforce safety protocols across your factory floor.',
    body:
      'From compliance to prevention, safety helps protect both people and operations.',
    bullets: [
      'Boundary Violation Detection: Identify safety line breaches instantly',
      'Unsafe Behaviour Alerts: Monitor and flag risky actions',
      'Real-time Notifications: Get immediate alerts for safety issues',
      'Compliance Monitoring: Ensure adherence to safety standards',
      'Incident Prevention: Reduce risks before they escalate',
    ],
    benefits: [
      'Save time and resources',
      'Reduce human errors',
      'Increase productivity',
      'Scale operations effortlessly',
    ],
    image: PRODUCT_IMAGES.safety,
  },
  {
    slug: 'security',
    title: 'Security',
    intro:
      'HENRY Security provides advanced monitoring to safeguard your facility. Detects threats, prevents unauthorised access, and maintains full control over your premises.',
    body:
      'Built for modern industrial environments, Security keeps your operations protected 24/7.',
    bullets: [
      'Access Monitoring: Detect unauthorised entry in real time',
      'Anomaly Detection: Identify unusual activities instantly',
      'Smart Surveillance Integration: Connect cameras and sensors seamlessly',
      'Alert System: Get notified of security breaches immediately',
      '24/7 Protection: Continuous monitoring for complete peace of mind',
    ],
    benefits: [
      'Improve operational efficiency',
      'Reduce downtime and errors',
      'Make faster, smarter decisions',
      'Gain full control over business performance',
    ],
    image: PRODUCT_IMAGES.security,
  },
  {
    slug: 'myhenry-agent',
    title: 'MyHenry Agent',
    intro:
      'MyHenry is your personalised AI agent trained specifically on your business. It delivers instant answers, insights, and recommendations across all functions, helping teams work smarter and faster.',
    body:
      'From operations to strategy, MyHenry becomes your intelligent decision-making partner.',
    bullets: [
      'AI-Powered Assistance: Get instant answers to business queries',
      'Custom Knowledge Base: Trained on your workflows, data, and processes',
      'Cross-Functional Support: Covers HR, finance, operations, and more',
      'Smart Recommendations: Receive actionable insights in real time',
      'Continuous Learning: Improves over time with usage and data',
    ],
    benefits: [
      'Improve operational efficiency',
      'Reduce downtime and errors',
      'Make faster, smarter decisions',
      'Gain full control over business performance',
    ],
    image: PRODUCT_IMAGES.myhenry,
  },
]

const caseStudies = [
  {
    title: 'Medical Equipment & Devices',
    text: 'Enhancing precision manufacturing, quality control, and traceability in high-stakes production environments.',
    image: medicalDevicesImage,
    details: {
      heading: 'Medical Equipment & Devices',
      intro:
        'Precision, compliance, and zero-defect manufacturing are critical in medical device production. A leading manufacturer partnered with HENRY to gain real-time visibility across assembly lines and ensure consistent product quality.',
      body:
        'With HENRY Core and Factory Analytics, they monitored every stage of production, detected defects instantly, and maintained strict regulatory standards without slowing down operations.',
      highlights: [
        '25% faster inspection cycles',
        '32% reduction in production defects',
        'Full compliance with ISO standards',
      ],
    },
  },
  {
    title: 'Healthcare',
    text: 'Improving patient care and operational efficiency through data-driven monitoring and automation.',
    image: healthcareImage,
    details: {
      heading: 'Healthcare',
      intro:
        'A fast-growing healthcare provider faced challenges in managing patient flow, optimizing equipment usage, and maintaining operational efficiency across multiple locations.',
      body:
        'By implementing HENRY intelligent analytics and automation tools, they gained real-time insights into hospital operations, streamlined workflows, and improved decision-making across departments.',
      highlights: [
        '40% increase in operational efficiency',
        '30% reduction in patient wait times',
        'Centralized monitoring across all facilities',
      ],
    },
  },
  {
    title: 'Pharmaceuticals',
    text: 'Ensuring compliance, batch traceability, and contamination-free production with real-time monitoring.',
    image: pharmaImage,
    details: {
      heading: 'Pharmaceuticals',
      intro:
        'Maintaining compliance, ensuring batch traceability, and preventing contamination are top priorities in pharmaceutical manufacturing. One company leveraged HENRY to digitize their monitoring systems and automate compliance reporting.',
      body:
        'With real-time tracking and intelligent alerts, they improved production safety while significantly reducing manual workload.',
      highlights: [
        '50% faster compliance reporting',
        'Zero contamination incidents',
        'Improved batch traceability and audit readiness',
      ],
    },
  },
]

/** Pricing tiers — swap for live billing when ready. */
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
          { ok: true, text: 'Machine integration — connect machines to the dashboard (PLC / IoT).' },
          { ok: true, text: 'Basic machine metrics: uptime / downtime, cycle count, core performance data.' },
          { ok: true, text: 'Camera access (security only): live feeds; no AI analysis or alerts.' },
          { ok: true, text: 'Single dashboard and workspace access.' },
          { ok: true, text: 'Limited users (e.g. 2–3 seats).' },
        ],
      },
      {
        kind: 'list',
        items: [
          { ok: false, text: 'No AI insights.' },
          { ok: false, text: 'No anomaly detection.' },
          { ok: false, text: 'No safety / compliance monitoring.' },
          { ok: false, text: 'No multi-location support.' },
        ],
      },
    ],
  },
  {
    planId: 'plus',
    name: 'Plus',
    price: '$200 / month',
    bestFor: 'Growing factories needing automation & safety intelligence.',
    inherit: 'Everything in Basic, plus:',
    highlighted: true,
    blocks: [
      { kind: 'subheading', text: 'AI-powered factory monitoring' },
      {
        kind: 'list',
        items: [
          {
            ok: true,
            text: 'Drone / mobile camera scanning: automated floor coverage and machine activity tracking.',
          },
        ],
      },
      { kind: 'subheading', text: 'Computer vision insights (detects)' },
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
            text: 'Advanced analytics: real-time alerts and visual insights from camera + machine data.',
          },
          { ok: true, text: 'Event-based alerts for safety and operational anomalies.' },
          {
            ok: true,
            text: 'Expanded user access with role-based dashboards (Admin, Manager, Operator).',
          },
          { ok: false, text: 'Single factory location only.' },
        ],
      },
    ],
  },
  {
    planId: 'premium',
    name: 'Premium',
    price: '$300 / month',
    bestFor: 'Enterprises managing multiple plants with AI-driven intelligence.',
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
      { kind: 'subheading', text: 'Personal AI agent — AskHenry' },
      {
        kind: 'nested',
        items: [
          'Natural language queries (e.g. “Which machine had the highest downtime today?”)',
          'Real-time insights & recommendations trained on your factory data',
          'Expandable modules: HR, Maintenance, Production, Compliance',
        ],
      },
      { kind: 'subheading', text: 'Advanced intelligence layer' },
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
  { feature: 'Machine Integration', basic: 'check', plus: 'check', premium: 'check' },
  { feature: 'Machine Metrics Dashboard', basic: 'check', plus: 'check', premium: 'check' },
  { feature: 'Camera Feed (Security)', basic: 'check', plus: 'check', premium: 'check' },
  { feature: 'AI Vision Monitoring', basic: 'cross', plus: 'check', premium: 'check' },
  { feature: 'Safety Alerts', basic: 'cross', plus: 'check', premium: 'check' },
  { feature: 'Drone / Mobile Scanning', basic: 'cross', plus: 'check', premium: 'check' },
  { feature: 'Locations Included', basic: '1', plus: '1', premium: '5' },
  { feature: 'Additional Locations', basic: 'cross', plus: 'cross', premium: 'Paid On' },
  { feature: 'AskHenry AI Agent', basic: 'cross', plus: 'cross', premium: 'check' },
  { feature: 'Multi-Location Dashboard', basic: 'cross', plus: 'cross', premium: 'check' },
]

function renderPricingBlock(block) {
  if (block.kind === 'subheading') {
    return (
      <p className="pricing-subhead">{block.text}</p>
    )
  }
  if (block.kind === 'nested') {
    return (
      <ul className="pricing-nested">
        {block.items.map((line) => (
          <li key={line}>{line}</li>
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
            <li key={item.text} className={isOut ? 'is-out' : isAddon ? 'is-addon' : 'is-in'}>
              <span className="pricing-item-icon" aria-hidden="true">
                {isOut ? '✕' : isAddon ? '+' : '✓'}
              </span>
              <span className="pricing-item-text">{item.text}</span>
            </li>
          )
        })}
      </ul>
    )
  }
  return null
}

function renderComparisonValue(value) {
  if (value === 'check') return <span className="pricing-compare-icon is-check">✓</span>
  if (value === 'cross') return <span className="pricing-compare-icon is-cross">✕</span>
  return <span className="pricing-compare-text">{value}</span>
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
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [signupStatus, setSignupStatus] = useState('')
  const [activeCaseStudy, setActiveCaseStudy] = useState(null)
  const [authMode, setAuthMode] = useState('signup')
  const [forgotPasswordHelpOpen, setForgotPasswordHelpOpen] = useState(false)
  const [signupFromPlan, setSignupFromPlan] = useState(null)
  const [currentUser, setCurrentUser] = useState(() => (AUTH_BYPASS ? bypassDemoUser() : null))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isProductsPage || typeof window === 'undefined') return
    const hash = String(window.location.hash || '').replace(/^#/, '')
    if (!hash) return
    const el = document.getElementById(hash)
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 40)
    }
  }, [isProductsPage])

  useEffect(() => {
    if (AUTH_BYPASS) return

    const ac = new AbortController()

    ;(async () => {
      const tokenSnapshot = getToken()
      if (!tokenSnapshot) return

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

  const signOut = () => {
    clearAuth()
    setCurrentUser(null)
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

  const closeSignupModal = () => {
    setShowSignup(false)
    setSignupStatus('')
    setSignupFromPlan(null)
    setForgotPasswordHelpOpen(false)
    setSignupForm({ email: '', password: '', confirmPassword: '' })
  }

  const backToHomeFromSignup = () => {
    closeSignupModal()
    if (typeof window !== 'undefined') {
      window.location.assign('/')
    }
  }

  const closeCaseStudyModal = () => {
    setActiveCaseStudy(null)
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
    setForgotPasswordHelpOpen(false)
    const planKey = options.planId
    const validPlan = planKey && PLAN_REGISTRATION_DEFAULTS[planKey] ? planKey : null
    if (mode === 'signup') {
      setSignupFromPlan(validPlan)
      setSignupForm({ email: '', password: '', confirmPassword: '' })
    } else {
      setSignupFromPlan(null)
      setSignupForm({ email: '', password: '', confirmPassword: '' })
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
    if (!signupForm.email?.trim() || !signupForm.password || !signupForm.confirmPassword) {
      setSignupStatus('Please fill in email, password, and confirm password.')
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
    const emailKey = signupForm.email.trim().toLowerCase()
    const productIds =
      signupFromPlan && PLAN_REGISTRATION_DEFAULTS[signupFromPlan]
        ? [...PLAN_REGISTRATION_DEFAULTS[signupFromPlan].productIds]
        : [...DEFAULT_PRODUCT_IDS]
    try {
      const body = {
        email: emailKey,
        password: signupForm.password,
        company: defaultOrganizationFromEmail(emailKey),
        productIds,
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
      closeSignupModal()
      if (typeof window !== 'undefined') {
        window.location.assign('/products')
      }
    } catch (e) {
      const msg = e.message || ''
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
      setSignupStatus(
        e?.message?.trim() ||
          'Email or password does not match. Try again or create an account.',
      )
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
    { href: '/#products', label: 'PRODUCTS' },
    { href: '/case-studies', label: 'CASE STUDIES' },
    { href: '/pricing', label: 'PRICING' },
    { href: '/#about', label: 'ABOUT' },
    { href: '/#contact', label: 'CONTACT' },
  ]

  const pricingSection = (
    <section id="pricing" className="pricing-section">
      <h2 className="pricing-title">Pricing</h2>
      <p className="pricing-lead">
        Choose a plan that fits your operations. Scale seamlessly as your business grows with flexible features and
        transparent pricing.
      </p>
      <div className="pricing-grid">
        {pricingTiers.map((tier) => (
          <article
            key={tier.name}
            className={`pricing-card${tier.highlighted ? ' pricing-card--featured' : ''}`}
          >
            {tier.highlighted ? <span className="pricing-ribbon">Popular</span> : null}
            <h3 className="pricing-tier-name">{tier.name}</h3>
            <p className="pricing-price">{tier.price}</p>
            <p className="pricing-best-for">
              <span className="pricing-best-label">Best for</span> {tier.bestFor}
            </p>
            {tier.inherit ? <p className="pricing-inherit">{tier.inherit}</p> : null}
            <div className="pricing-body">
              {tier.blocks.map((block, i) => (
                <div key={`${tier.name}-${i}`}>{renderPricingBlock(block)}</div>
              ))}
            </div>
            <button
              type="button"
              className="btn-pricing-cta"
              onClick={() =>
                AUTH_BYPASS ? enterBypassWorkspace() : openAuthModal('signup', { planId: tier.planId })
              }
            >
              {AUTH_BYPASS ? 'Open workspace' : 'Get started'}
            </button>
          </article>
        ))}
      </div>
      <p className="pricing-footnote">
        Volume pricing and annual billing available. <a href="#request-demo">Request a demo</a> or{' '}
        <a href="#contact">contact sales</a> for a tailored quote.
      </p>
      <section className="pricing-compare" aria-label="Pricing feature comparison">
        <h3 className="pricing-compare-title">PRICING</h3>
        <div className="pricing-compare-wrap">
          <table className="pricing-compare-table">
            <thead>
              <tr>
                <th scope="col">Features</th>
                <th scope="col">Basic</th>
                <th scope="col">Plus</th>
                <th scope="col">Premium</th>
              </tr>
            </thead>
            <tbody>
              {pricingComparisonRows.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  <td>{renderComparisonValue(row.basic)}</td>
                  <td>{renderComparisonValue(row.plus)}</td>
                  <td>{renderComparisonValue(row.premium)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )

  const snapshotMobileSection = (
    <section
      id="snapshot-preview"
      className="snapshot-mobile-section"
      aria-labelledby="snapshot-mobile-heading"
    >
      <div className="snapshot-mobile-inner">
        <div className="snapshot-mobile-head">
          <h2 id="snapshot-mobile-heading">Snapshot on mobile</h2>
          <p>
            Swipe through live-style tiles — the same at-a-glance view teams check between line walks and meetings.
            HENRY Snapshot keeps metrics readable on a phone.
          </p>
        </div>
        <div
          className="snapshot-mobile-scroll"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Example operations snapshot cards. Scroll horizontally."
        >
          <div className="snapshot-mobile-track">
            {snapshotMobileCards.map((card) => (
              <article
                key={card.id}
                className={`snapshot-mobile-card snapshot-mobile-card--${card.accent}`}
                aria-label={`${card.title}: ${card.value} ${card.unit}`}
              >
                <div className="snapshot-mobile-chrome" aria-hidden="true">
                  <span className="snapshot-mobile-time">9:41</span>
                  <span className="snapshot-mobile-signal">
                    <span />
                    <span />
                    <span />
                  </span>
                </div>
                <div className="snapshot-mobile-body">
                  <p className="snapshot-mobile-title">{card.title}</p>
                  <p className="snapshot-mobile-value">
                    {card.value} <span className="snapshot-mobile-unit">{card.unit}</span>
                  </p>
                  <p className="snapshot-mobile-hint">{card.hint}</p>
                </div>
                <p className="snapshot-mobile-fresh">{card.freshness}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="snapshot-mobile-actions">
          <a className="btn-primary snapshot-mobile-cta" href="/products#snapshot">
            Learn about Snapshot
          </a>
          <span className="snapshot-mobile-hint-scroll" aria-hidden="true">
            ← Swipe for more →
          </span>
        </div>
      </div>
    </section>
  )

  const productsSection = (
    <section id="products" className="products">
      <h2 className="products-title">PRODUCTS</h2>
      <p className="products-subtitle">
        Streamline your operations with smart automation. From monitoring to predictive maintenance, automate
        processes and save valuable time.
      </p>
      <div className="card-grid five">
        {products.map((item) => (
          <article key={item.title} className="card product">
            <img className="product-image" src={item.image} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <button
              type="button"
              className="btn-dark small btn-product-learn"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.open(`/products#${item.slug}`, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              Learn More
            </button>
          </article>
        ))}
      </div>
    </section>
  )

  const productsDetailsSection = (
    <section className="products-detailed-page" aria-label="Detailed products">
      {productDetails.map((item, idx) => (
        <article
          id={item.slug}
          key={item.title}
          className={`product-detail-row${idx % 2 === 1 ? ' reverse' : ''}`}
        >
          <div className="product-detail-media">
            <div className="product-detail-visual">
              <img src={item.image} alt={item.title} />
              <div className="product-benefits-overlay">
                <h4>Benefits</h4>
                <ul>
                  {(item.benefits || []).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            </div>
            <button type="button" className="btn-dark small" onClick={openBookDemo}>
              Book a Demo
            </button>
          </div>
          <div className="product-detail-content">
            <h3>{item.title}</h3>
            <p>{item.intro}</p>
            <p>{item.body}</p>
            <ul>
              {item.bullets.map((line) => (
                <li key={line}>
                  <span aria-hidden="true">☑</span> {line}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </section>
  )

  const caseStudiesDetailsSection = (
    <section className="case-studies-detailed-page" aria-label="Detailed case studies">
      {caseStudies.map((item, idx) => (
        <article
          id={`case-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          key={item.title}
          className={`case-study-detail-row${idx % 2 === 1 ? ' reverse' : ''}`}
        >
          <div className="case-study-detail-media">
            <img src={item.image} alt={item.title} />
            <button type="button" className="btn-dark small" onClick={() => openCaseDemoModal(item.title)}>
              Learn More
            </button>
          </div>
          <div className="case-study-detail-content">
            <h3>{item.details.heading}</h3>
            <p>{item.details.intro}</p>
            <p>{item.details.body}</p>
            <ul>
              {item.details.highlights.map((line) => (
                <li key={line}>
                  <span aria-hidden="true">☑</span> {line}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </section>
  )

  const requestDemoSection = (
    <section id="request-demo" className="request-demo">
      <h2>Ready to Transform Your Business?</h2>
      <p className="request-demo-intro">
        We&apos;d love to hear from you. Fill out the form below and our team will get back to you shortly.
      </p>
      <form className="contact-form demo-request-form" onSubmit={submitContact}>
        <input name="name" value={form.name} onChange={updateField} placeholder="Name *" />
        <input name="email" value={form.email} onChange={updateField} placeholder="Email *" />
        <input name="companyName" value={form.companyName} onChange={updateField} placeholder="Company Name" />
        <select name="interest" value={form.interest} onChange={updateField}>
          <option>Smart Monitoring Setup</option>
          <option>Real-time Data &amp; Dashboard</option>
          <option>System Integration (Machines, Devices, APIs)</option>
          <option>Data Processing &amp; Cloud Setup</option>
          <option>Performance Optimization</option>
          <option>Custom SaaS Development</option>
          <option>AI &amp; Predictive Insights</option>
          <option>Consultation &amp; Strategy</option>
        </select>
        <textarea
          name="notes"
          rows="4"
          value={form.notes}
          onChange={updateField}
          placeholder="TELL US BRIEFLY ABOUT YOUR REQUIREMENT..."
        />
        <button type="submit" className="btn-primary">Get Free Consultation</button>
        {status ? <p className="form-status">{status}</p> : null}
      </form>
    </section>
  )

  const requestDemoIntroSection = (
    <section className="request-demo-intro-block">
      <h2>Request a Demo</h2>
      <p>
        See Henry in action. Book a personalized demo to explore how Henry can help you monitor operations, improve
        visibility, and make faster decisions across your business.
      </p>
      <button
        type="button"
        className="btn-primary"
        onClick={() => {
          if (typeof window !== 'undefined') {
            const el = document.getElementById('request-demo')
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            } else {
              window.location.assign('/#request-demo')
            }
          }
        }}
      >
        Request a demo
      </button>
    </section>
  )

  const contactSection = (
    <section id="contact" className="contact">
      <h2>Contact us</h2>
      <p className="contact-intro">
        Talk to the HENRY team. From onboarding to optimization, we&apos;re here to help.
        Whether you&apos;re exploring HENRY, need a custom setup, or require support, our team will get you the answers you need.
      </p>
      <div className="contact-info-wrap">
        <aside className="contact-info-panel" aria-labelledby="contact-info-heading">
          <h3 id="contact-info-heading">HENRY SaaS</h3>
          <p className="contact-info-lead">
            Cloud manufacturing intelligence — onboarding, billing questions, and technical evaluations all start
            here.
          </p>
          <dl className="contact-info-list">
            <div className="contact-info-row">
              <dt>Email</dt>
              <dd>
                <a href="mailto:info@goaskhenry.com">info@goaskhenry.com</a>
                {' \u00b7 '}
                <a href="mailto:larrya@goaskhenry.com">larrya@goaskhenry.com</a>
              </dd>
            </div>
            <div className="contact-info-row">
              <dt>Hours</dt>
              <dd>Monday–Friday, 9:00 a.m.–6:00 p.m. US Eastern</dd>
            </div>
            <div className="contact-info-row">
              <dt>Response time</dt>
              <dd>We aim to reply within one business day. Include your company and time zone for faster scheduling.</dd>
            </div>
            <div className="contact-info-row">
              <dt>Existing customers</dt>
              <dd>
                Sign in to your workspace for in-app alerts and reports. For account changes, email us from your
                registered address and mention your organization name.
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  )

  if (currentUser && !isPricingPage && !isProductsPage && !isCaseStudiesPage) {
    return (
      <div className="page page--client">
        <ClientDashboard user={currentUser} onSignOut={signOut} />
      </div>
    )
  }

  if (isPricingPage) {
    return (
      <div className="page">
        <header className="topbar">
          <div className="topbar-start">
            <button
              type="button"
              className="logo"
              aria-label="HENRY — Home"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.assign('/')
                }
              }}
            >
              <span className="logo-lockup">
                <img src={henryLogo} alt="" className="logo-mark" width={220} height={220} decoding="async" />
                <span className="logo-word">HENRY</span>
              </span>
            </button>
          </div>
          <div className="topbar-left">
            <nav className="menu">
              <a href="/#products">PRODUCTS</a>
              <a href="/case-studies">CASE STUDIES</a>
              <a href="/pricing">PRICING</a>
              <a href="/#about">ABOUT</a>
              <a href="/#contact">CONTACT</a>
            </nav>
          </div>
          <div className="topbar-right">
            <div className="topbar-actions">
              <a className="btn-contact-nav" href="/#request-demo">
                Request a demo
              </a>
              {!AUTH_BYPASS ? (
                <>
                  <button type="button" className="btn-signin-nav" onClick={() => openAuthFromAnyPage('signup')}>
                    Sign Up
                  </button>
                  <button type="button" className="btn-dark" onClick={() => openAuthFromAnyPage('signin')}>
                    Sign In
                  </button>
                </>
              ) : null}
            </div>
            <button
              type="button"
              className="mobile-menu-toggle mobile-menu-toggle--standalone"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              ☰
            </button>
          </div>
        </header>
        {renderMobileMenu(mobileNavLinks)}
        {pricingSection}
        {requestDemoIntroSection}
        {requestDemoSection}
        {contactSection}
        <footer className="site-footer" aria-label="Site footer">
          <p>@2026 Henry , Inc. All rights reserved</p>
        </footer>
      </div>
    )
  }

  if (isProductsPage) {
    return (
      <div className="page">
        <header className="topbar">
          <div className="topbar-start">
            <button
              type="button"
              className="logo"
              aria-label="HENRY — Home"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.assign('/')
                }
              }}
            >
              <span className="logo-lockup">
                <img src={henryLogo} alt="" className="logo-mark" width={220} height={220} decoding="async" />
                <span className="logo-word">HENRY</span>
              </span>
            </button>
          </div>
          <div className="topbar-left">
            <nav className="menu">
              <a href="/products">PRODUCTS</a>
              <a href="/case-studies">CASE STUDIES</a>
              <a href="/pricing">PRICING</a>
              <a href="/#about">ABOUT</a>
              <a href="/#contact">CONTACT</a>
            </nav>
          </div>
          <div className="topbar-right">
            <div className="topbar-actions">
              <a className="btn-contact-nav" href="/#request-demo">
                Request a demo
              </a>
              {!AUTH_BYPASS ? (
                <>
                  <button type="button" className="btn-signin-nav" onClick={() => openAuthFromAnyPage('signup')}>
                    Sign Up
                  </button>
                  <button type="button" className="btn-dark" onClick={() => openAuthFromAnyPage('signin')}>
                    Sign In
                  </button>
                </>
              ) : null}
            </div>
            <button
              type="button"
              className="mobile-menu-toggle mobile-menu-toggle--standalone"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              ☰
            </button>
          </div>
        </header>
        {renderMobileMenu(mobileNavLinks)}
        {productsDetailsSection}
        {requestDemoIntroSection}
        {requestDemoSection}
        {contactSection}
        <footer className="site-footer" aria-label="Site footer">
          <p>@2026 Henry , Inc. All rights reserved</p>
        </footer>
      </div>
    )
  }

  if (isCaseStudiesPage) {
    return (
      <div className="page page-case-studies">
        <header className="topbar">
          <div className="topbar-start">
            <button
              type="button"
              className="logo"
              aria-label="HENRY — Home"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.assign('/')
                }
              }}
            >
              <span className="logo-lockup">
                <img src={henryLogo} alt="" className="logo-mark" width={220} height={220} decoding="async" />
                <span className="logo-word">HENRY</span>
              </span>
            </button>
          </div>
          <div className="topbar-left">
            <nav className="menu">
              <a href="/products">PRODUCTS</a>
              <a href="/case-studies">CASE STUDIES</a>
              <a href="/pricing">PRICING</a>
              <a href="/#about">ABOUT</a>
              <a href="/#contact">CONTACT</a>
            </nav>
          </div>
          <div className="topbar-right">
            <div className="topbar-actions">
              <a className="btn-contact-nav" href="/#request-demo">
                Request a demo
              </a>
              {!AUTH_BYPASS ? (
                <>
                  <button type="button" className="btn-signin-nav" onClick={() => openAuthFromAnyPage('signup')}>
                    Sign Up
                  </button>
                  <button type="button" className="btn-dark" onClick={() => openAuthFromAnyPage('signin')}>
                    Sign In
                  </button>
                </>
              ) : null}
            </div>
            <button
              type="button"
              className="mobile-menu-toggle mobile-menu-toggle--standalone"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((current) => !current)}
            >
              ☰
            </button>
          </div>
        </header>
        {renderMobileMenu(mobileNavLinks)}
        <section className="case-studies-page-top-strip" aria-label="Case Studies page title">
          <h1>CASE STUDIES</h1>
        </section>
        {caseStudiesDetailsSection}
        {requestDemoIntroSection}
        {requestDemoSection}
        {contactSection}
        <footer className="site-footer" aria-label="Site footer">
          <p>@2026 Henry , Inc. All rights reserved</p>
        </footer>
        {showCaseDemo ? (
          <section
            className="case-demo-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-demo-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeCaseDemoModal()
            }}
          >
            <div className="case-demo-modal">
              <button
                type="button"
                className="case-demo-close"
                aria-label="Close"
                onClick={closeCaseDemoModal}
              >
                ×
              </button>
              <h3 id="case-demo-title">Let&apos;s Talk!</h3>
              <form className="case-demo-form" onSubmit={submitContact}>
                <label>
                  Name <span aria-hidden="true">*</span>
                  <input name="name" value={form.name} onChange={updateField} required />
                </label>
                <label>
                  Email <span aria-hidden="true">*</span>
                  <input name="email" type="email" value={form.email} onChange={updateField} required />
                </label>
                <label>
                  Company Name
                  <input name="companyName" value={form.companyName} onChange={updateField} />
                </label>
                <label>
                  Area of Interest <span aria-hidden="true">*</span>
                  <select name="interest" value={form.interest} onChange={updateField}>
                    <option>Smart Monitoring Setup</option>
                    <option>Real-time Data &amp; Dashboard</option>
                    <option>System Integration (Machines, Devices, APIs)</option>
                    <option>Data Processing &amp; Cloud Setup</option>
                    <option>Performance Optimization</option>
                    <option>Custom SaaS Development</option>
                    <option>AI &amp; Predictive Insights</option>
                    <option>Consultation &amp; Strategy</option>
                  </select>
                </label>
                <label className="case-demo-notes">
                  Notes
                  <textarea
                    name="notes"
                    rows="4"
                    value={form.notes}
                    onChange={updateField}
                    placeholder="TELL US BRIEFLY ABOUT YOUR REQUIREMENT..."
                  />
                </label>
                <button type="submit" className="case-demo-submit">Get Free Consultation</button>
                {status ? <p className="case-demo-status">{status}</p> : null}
              </form>
            </div>
          </section>
        ) : null}
      </div>
    )
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-start">
          <button
            type="button"
            className="logo"
            aria-label="HENRY — Home"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.assign('/')
              }
            }}
          >
            <span className="logo-lockup">
              <img src={henryLogo} alt="" className="logo-mark" width={220} height={220} decoding="async" />
              <span className="logo-word">HENRY</span>
            </span>
          </button>
        </div>
        <div className="topbar-left">
          <nav className="menu">
            <a href="/products">PRODUCTS</a>
            <a href="/case-studies">CASE STUDIES</a>
            <a href="/pricing">PRICING</a>
            <a href="#about">ABOUT</a>
            <a href="#contact">CONTACT</a>
          </nav>
        </div>
        <div className="topbar-right">
          <div className="topbar-actions">
            {AUTH_BYPASS ? (
              <button type="button" className="btn-dark" onClick={enterBypassWorkspace}>
                Open workspace
              </button>
            ) : null}
            <a className="btn-contact-nav" href="#request-demo">
              Request a demo
            </a>
            {!AUTH_BYPASS ? (
              <>
                <button type="button" className="btn-signin-nav" onClick={() => openAuthModal('signup')}>
                  Sign Up
                </button>
                <button type="button" className="btn-dark" onClick={() => openAuthModal('signin')}>
                  Sign In
                </button>
              </>
            ) : null}
          </div>
          <button
            type="button"
            className="mobile-menu-toggle mobile-menu-toggle--standalone"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            ☰
          </button>
        </div>
      </header>
      {renderMobileMenu(mobileNavLinks)}

      <section className="hero" style={{ '--hero-url': `url(${heroMainImage})` }}>
        <div className="hero-inner">
          <HeroLiveChartsHud />
          <div className="overlay">
            <h1>When You Need Answers Now</h1>
            <p>
              With HENRY, you can have real-time insights, reduce downtime, and make smarter business decisions.
            </p>
            <button
              className="btn-primary"
              onClick={() => (AUTH_BYPASS ? enterBypassWorkspace() : openAuthModal('signup'))}
            >
              {AUTH_BYPASS ? 'Open workspace' : 'Get Started'}
            </button>
          </div>
        </div>
      </section>

      {snapshotMobileSection}

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
                <div className={`signup-glass${authMode === 'signin' ? ' signup-glass--signin' : ''}`}>
                  <div className="signup-auth-switch">
                    <button
                      type="button"
                      className={authMode === 'signup' ? 'active' : ''}
                      onClick={() => {
                        setAuthMode('signup')
                        setSignupStatus('')
                        setSignupFromPlan(null)
                        setForgotPasswordHelpOpen(false)
                        setSignupForm({ email: '', password: '', confirmPassword: '' })
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
                      {signupFromPlan ? (
                        <p className="signup-pricing-context">
                          <span className="signup-pricing-context-label">Pricing</span>
                          <strong>{PLAN_DISPLAY[signupFromPlan].label}</strong>
                          <span className="signup-pricing-context-price">{PLAN_DISPLAY[signupFromPlan].price}</span>
                        </p>
                      ) : null}
                      <h3 id="onboarding-title">Create An Account</h3>
                      <p className="signup-glass-hint">
                        Use your work email — it becomes your login. Enter your password twice to confirm, then create
                        your workspace.
                      </p>
                      <form className="signup-form-new" onSubmit={submitSignup}>
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
                            placeholder="Work email"
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
                            autoComplete="new-password"
                            value={signupForm.password}
                            onChange={updateSignupField}
                            placeholder="Password"
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
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            value={signupForm.confirmPassword}
                            onChange={updateSignupField}
                            placeholder="Confirm password"
                          />
                        </label>
                        <button type="submit" className="btn-start-monitoring">
                          Create An Account
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
                      </form>
                    </>
                  ) : (
                    <>
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
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="solutions">
        <h2>Smart Business Solutions with Real-Time Data & Insights</h2>
        <div className="card-grid three">
          {solutions.map((item) => (
            <article key={item.title} className="card">
              <img className="solution-image" src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {productsSection}

      <section id="case-studies" className="case-studies">
        <h2>CASE STUDIES</h2>
        <div className="card-grid three">
          {caseStudies.map((item) => {
            const slug = `case-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
            return (
              <article key={item.title} className="card">
                <img className="case-image" src={item.image} alt={item.title} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <button
                  type="button"
                  className="btn-dark small"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.open(`/case-studies#${slug}`, '_blank', 'noopener,noreferrer')
                    }
                  }}
                >
                  Learn More
                </button>
              </article>
            )
          })}
        </div>
      </section>

      {activeCaseStudy ? (
        <section
          className="case-study-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeCaseStudyModal()
          }}
        >
          <div className="case-study-modal">
            <button type="button" className="case-study-close" aria-label="Close" onClick={closeCaseStudyModal}>
              ×
            </button>
            <h3 id="case-study-title">{activeCaseStudy.heading}</h3>
            <p>{activeCaseStudy.intro}</p>
            <p>{activeCaseStudy.body}</p>
            <ul className="case-study-highlights">
              {activeCaseStudy.highlights.map((item) => (
                <li key={item}>✅ {item}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section id="about" className="about about-last">
        <div className="about-image">
          <img src={aboutHenryImage} alt="About Henry" />
        </div>
        <div className="about-content">
          <h2>ABOUT HENRY</h2>
          <h3>
            Smarter Business
            <br />
            Starts Here
          </h3>
          <p>
            HENRY helps your business make faster, smarter decisions using real-time data and AI-powered insights.
            From monitoring operations to optimizing performance, everything you need is in one powerful platform.
          </p>
          <ul>
            <li>Real-Time Factory Visibility</li>
            <li>AI-Driven Decision Making</li>
            <li>Improved Efficiency & Productivity</li>
          </ul>
        </div>
      </section>

      {requestDemoIntroSection}
      {requestDemoSection}
      {contactSection}

      <footer className="site-footer" aria-label="Site footer">
        <p>@2026 Henry , Inc. All rights reserved</p>
      </footer>
    </div>
  )
}

export default App
