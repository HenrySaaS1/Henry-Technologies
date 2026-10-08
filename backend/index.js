import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { Prisma } from '@prisma/client'
import { prisma } from './lib/prisma.js'
import { signUserToken, readBearerAuth, readBearerUserId } from './lib/authTokens.js'
import { assertProductionEnv } from './lib/productionEnv.js'
import { tenantSlugFromHost } from './lib/tenantSlugFromHost.js'
import {
  inferDashboardPreset,
  normalizeDashboardPreset,
  resolveDashboardPresetForCreate,
  VALID_DASHBOARD_PRESETS,
} from './lib/dashboardPreset.js'
import { isOdooConfigured, listHenryEvents, syncEventsToOdoo } from './lib/odooClient.js'

dotenv.config()
assertProductionEnv()

const app = express()
const PORT = Number(process.env.PORT) || 5000

// Azure App Service sits behind a reverse proxy
app.set('trust proxy', 1)

function parseCorsOrigins(value) {
  return String(value || '')
    .split(',')
    .map((v) => v.trim().replace(/\/+$/, ''))
    .filter(Boolean)
}

function isTrustedAzureFrontend(origin) {
  return (
    origin.endsWith('.azurestaticapps.net') ||
    origin.endsWith('.azurewebsites.net') ||
    origin.endsWith('.centralus-01.azurewebsites.net')
  )
}

/** Custom production domain(s) for the marketing site (not *.azurestaticapps.net). */
function isGoAskHenryOrigin(origin) {
  try {
    const u = new URL(origin)
    if (u.protocol !== 'https:') return false
    return u.hostname === 'goaskhenry.com' || u.hostname.endsWith('.goaskhenry.com')
  } catch {
    return false
  }
}

/** Any http:// localhost / 127.0.0.1 / ::1 port — Vite may use 5173, 5174, 4173, etc. */
function isLocalHttpDevOrigin(origin) {
  if (process.env.NODE_ENV === 'production') return false
  try {
    const u = new URL(origin)
    if (u.protocol !== 'http:') return false
    return u.hostname === 'localhost' || u.hostname === '127.0.0.1' || u.hostname === '[::1]'
  } catch {
    return false
  }
}

function tenantSlugFromRequest(req) {
  const fromHeader = String(req.get('x-tenant-slug') || '')
    .trim()
    .toLowerCase()
  if (fromHeader) return fromHeader

  const fromQuery = String(req.query?.tenant || '')
    .trim()
    .toLowerCase()
  if (fromQuery) return fromQuery

  const host = String(req.get('x-forwarded-host') || req.get('host') || '')
    .split(',')[0]
    .trim()
  return tenantSlugFromHost(host)
}

const corsOrigins =
  process.env.NODE_ENV === 'production'
    ? parseCorsOrigins(process.env.CORS_ORIGIN)
    : parseCorsOrigins(process.env.CORS_ORIGIN || 'http://localhost:5173')

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients and same-origin requests with no Origin header.
      if (!origin) return callback(null, true)
      if (corsOrigins.includes(origin)) return callback(null, true)
      if (isLocalHttpDevOrigin(origin)) return callback(null, true)
      if (isGoAskHenryOrigin(origin)) return callback(null, true)
      if (isTrustedAzureFrontend(origin)) return callback(null, true)
      // Reject safely without throwing 500 on preflight.
      return callback(null, false)
    },
    credentials: true,
    // Browsers preflight when the client sends `X-Tenant-Slug` (Harland and other white-label hosts).
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug'],
  }),
)
app.use(express.json())
app.use((req, _res, next) => {
  req.tenantSlug = tenantSlugFromRequest(req)
  next()
})

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

/** Avoid RangeError from Invalid Date (would surface as HTTP 500 after successful login). */
function safeIsoDate(value) {
  if (value == null) return null
  if (value instanceof Date) {
    const t = value.getTime()
    return Number.isNaN(t) ? null : value.toISOString()
  }
  return typeof value === 'string' ? value : null
}

/** Map Prisma/network failures so login returns 503 + actionable codes instead of opaque 500s. */
function classifyLoginPrismaFailure(e) {
  const errMsg = e instanceof Error ? e.message : String(e)
  const prismaCode =
    e instanceof Prisma.PrismaClientKnownRequestError ? e.code : ''
  const Init = Prisma.PrismaClientInitializationError
  const initErr =
    (typeof Init === 'function' && e instanceof Init) ||
    String(e?.name) === 'PrismaClientInitializationError'

  if (initErr) return { bucket: 'db', prismaCode: prismaCode || 'INIT' }

  if (
    prismaCode === 'P1000' ||
    prismaCode === 'P1001' ||
    prismaCode === 'P1002' ||
    prismaCode === 'P1003' ||
    prismaCode === 'P1008' ||
    prismaCode === 'P1011' ||
    prismaCode === 'P1012' ||
    prismaCode === 'P1013' ||
    prismaCode === 'P1017'
  ) {
    return { bucket: 'db', prismaCode }
  }

  if (
    prismaCode === 'P2021' ||
    prismaCode === 'P2010' ||
    prismaCode === 'P2022' ||
    prismaCode === 'P2025'
  ) {
    return { bucket: 'schema', prismaCode }
  }

  if (
    /Can't reach database server|Server has closed the connection|Timed out fetching|Connection refused|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|Opening a TLS connection|database SSL connection/i.test(
      errMsg,
    )
  ) {
    return { bucket: 'db', prismaCode: prismaCode || 'CONN' }
  }

  return { bucket: 'server', prismaCode }
}

function userToClient(u) {
  let products = []
  try {
    products = JSON.parse(u.productIds)
    if (!Array.isArray(products)) products = []
  } catch {
    products = []
  }
  let onboarding = null
  if (u.onboardingData && typeof u.onboardingData === 'object' && !Array.isArray(u.onboardingData)) {
    onboarding = u.onboardingData
  }
  const createdRaw = u.createdAt instanceof Date ? safeIsoDate(u.createdAt) : u.createdAt
  const lastRaw =
    u.lastLoginAt == null
      ? null
      : u.lastLoginAt instanceof Date
        ? safeIsoDate(u.lastLoginAt)
        : u.lastLoginAt
  const dashboardPreset = inferDashboardPreset({
    email: u.email,
    slug: u.slug,
    company: u.company,
    dashboardPreset: u.dashboardPreset,
  })

  return {
    email: u.email,
    company: u.company,
    slug: u.slug,
    dashboardPreset,
    products,
    planId: u.planId,
    createdAt: createdRaw ?? undefined,
    lastLoginAt: lastRaw,
    onboardingComplete: Boolean(u.onboardingCompletedAt),
    onboarding,
  }
}

function getRequestIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim()
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return String(forwarded[0]).trim()
  }
  return req.ip || null
}

function parseEmailList(value, fallback = []) {
  const fromEnv = String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (fromEnv.length > 0) return fromEnv
  return fallback
}

const contactNotificationRecipients = parseEmailList(process.env.CONTACT_NOTIFICATION_TO, [
  'info@goaskhenry.com',
])

const fallbackAuth = {
  email: String(process.env.FALLBACK_AUTH_EMAIL || 'landerson@harlandmedical.com').trim().toLowerCase(),
  password: String(process.env.FALLBACK_AUTH_PASSWORD || 'Harland@123'),
  user: {
    id: 'fallback:harland',
    email: String(process.env.FALLBACK_AUTH_EMAIL || 'landerson@harlandmedical.com').trim().toLowerCase(),
    company: 'Harland Medical Systems',
    slug: 'harland',
    planId: 'premium',
    productIds: JSON.stringify(['core', 'factory-analytics', 'automation', 'myhenry']),
    createdAt: new Date(0),
    lastLoginAt: new Date(),
    onboardingData: null,
    onboardingCompletedAt: new Date(),
    dashboardPreset: 'harland',
  },
}

const smtpConfigured =
  Boolean(process.env.SMTP_HOST) &&
  Boolean(process.env.SMTP_PORT) &&
  Boolean(process.env.SMTP_USER) &&
  Boolean(process.env.SMTP_PASS)

const mailTransport = smtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null

async function sendContactNotification(payload) {
  if (!mailTransport || contactNotificationRecipients.length === 0) {
    return false
  }

  const submittedAt = new Date().toISOString()
  const {
    name,
    email,
    companyName = null,
    interest = null,
    notes = null,
    requestIp = null,
    userAgent = null,
  } = payload

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER
  const subject = `New demo/contact request from ${name}`
  const text = [
    'A new contact request was submitted on goaskhenry.com.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Company: ${companyName || '-'}`,
    `Interest: ${interest || '-'}`,
    `Notes: ${notes || '-'}`,
    '',
    `Submitted at (UTC): ${submittedAt}`,
    `IP: ${requestIp || '-'}`,
    `User Agent: ${userAgent || '-'}`,
  ].join('\n')

  await mailTransport.sendMail({
    from: fromAddress,
    to: contactNotificationRecipients.join(','),
    replyTo: email,
    subject,
    text,
  })

  return true
}

async function logAuthEvent(req, { eventType, email, success, userId = null, message = null }) {
  try {
    await prisma.authEvent.create({
      data: {
        eventType,
        email: String(email || '').trim().toLowerCase(),
        success: Boolean(success),
        userId: userId || null,
        message: message || null,
        ip: getRequestIp(req),
        userAgent: req.get('user-agent') || null,
      },
    })
  } catch (err) {
    console.error('[auth-event]', err)
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'henry-api',
    message: 'HENRY backend is running',
    time: new Date().toISOString(),
    odooConfigured: isOdooConfigured(),
  })
})

app.get('/api/integrations/odoo/status', (_req, res) => {
  const base = String(process.env.ODOO_URL || 'https://henrytechnologies.odoo.com').replace(/\/+$/, '')
  res.json({
    ok: true,
    configured: isOdooConfigured(),
    url: base,
    model: process.env.ODOO_EVENTS_MODEL || 'x_henry_events',
    eventsAppUrl: process.env.ODOO_EVENTS_APP_URL || `${base}/odoo/action-361`,
    snapshotUrl: process.env.ODOO_SNAPSHOT_URL || 'https://www.goaskhenry.com',
  })
})

function allowOdooIntegration(req) {
  if (readBearerAuth(req)?.userId) return true
  // Local preview (auth bypass) has no JWT. Production still requires sign-in.
  return process.env.NODE_ENV !== 'production'
}

app.get('/api/integrations/odoo/events', async (req, res) => {
  if (!allowOdooIntegration(req)) {
    return res.status(401).json({ ok: false, message: 'Not signed in.' })
  }
  if (!isOdooConfigured()) {
    return res.status(503).json({ ok: false, code: 'ODOO_NOT_CONFIGURED', message: 'Set ODOO_API_KEY on the API.' })
  }
  try {
    const events = await listHenryEvents({ limit: 50 })
    res.json({ ok: true, events })
  } catch (e) {
    console.error('[odoo] list failed', e)
    res.status(502).json({ ok: false, message: 'Could not read HENRY Events from Odoo.' })
  }
})

app.post('/api/integrations/odoo/sync', async (req, res) => {
  if (!allowOdooIntegration(req)) {
    return res.status(401).json({ ok: false, message: 'Not signed in.' })
  }
  if (!isOdooConfigured()) {
    return res.status(503).json({ ok: false, code: 'ODOO_NOT_CONFIGURED', message: 'Set ODOO_API_KEY on the API.' })
  }
  try {
    const results = await syncEventsToOdoo(req.body?.events)
    res.json({ ok: true, results })
  } catch (e) {
    console.error('[odoo] sync failed', e)
    res.status(502).json({ ok: false, message: 'Could not sync events to Odoo.' })
  }
})

/** Returns 503 if Postgres is down or Henry tables are missing (migrations not applied). */
app.get('/api/health/ready', async (_req, res) => {
  const time = new Date().toISOString()
  let connected = false
  try {
    await prisma.$queryRaw`SELECT 1`
    connected = true
    await prisma.user.findFirst({ select: { id: true } })
    return res.json({ ok: true, db: true, schema: true, time })
  } catch (err) {
    console.error('[health/ready] check failed:', err)
    const prismaCode = err instanceof Prisma.PrismaClientKnownRequestError ? err.code : ''
    const schemaCodes = new Set(['P2021', 'P2010', 'P2022', 'P2025'])
    const schemaMissing = connected && schemaCodes.has(prismaCode)
    return res.status(503).json({
      ok: false,
      code: schemaMissing ? 'SCHEMA_INCOMPLETE' : 'DB_UNAVAILABLE',
      db: connected,
      schema: false,
      message: schemaMissing
        ? 'Database is reachable but required tables are missing. Run: cd backend && npx prisma migrate deploy (use DIRECT_URL on Supabase pooler).'
        : 'Database check failed.',
      time,
    })
  }
})

app.get('/api/auth/check-email', async (req, res) => {
  const email = String(req.query.email || '')
    .trim()
    .toLowerCase()
  if (!email || !email.includes('@')) {
    return res.json({ available: true })
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    res.json({ available: !existing })
  } catch (err) {
    // DB unreachable (e.g. local Postgres not running): don't block signup; register will surface errors.
    console.error('[check-email]', err)
    res.json({ available: true })
  }
})

app.post('/api/auth/register', async (req, res) => {
  const {
    email,
    password,
    company,
    productIds,
    planId,
    dashboardPreset: requestedPreset,
    onboardingData,
    completeOnboarding,
  } = req.body || {}
  const emailNorm = String(email || '')
    .trim()
    .toLowerCase()
  const companyName = String(company || '').trim()
  const ids = Array.isArray(productIds) ? productIds.filter((x) => typeof x === 'string') : []
  const tenantSlug = req.tenantSlug || null

  if (!emailNorm || !emailNorm.includes('@')) {
    await logAuthEvent(req, {
      eventType: 'register',
      email: emailNorm,
      success: false,
      message: 'invalid_email',
    })
    return res.status(400).json({ ok: false, message: 'Valid email is required.' })
  }
  if (!password || String(password).length < 8) {
    await logAuthEvent(req, {
      eventType: 'register',
      email: emailNorm,
      success: false,
      message: 'weak_password',
    })
    return res.status(400).json({ ok: false, message: 'Password must be at least 8 characters.' })
  }
  if (!companyName) {
    await logAuthEvent(req, {
      eventType: 'register',
      email: emailNorm,
      success: false,
      message: 'missing_company',
    })
    return res.status(400).json({ ok: false, message: 'Organization name is required.' })
  }
  if (ids.length === 0) {
    await logAuthEvent(req, {
      eventType: 'register',
      email: emailNorm,
      success: false,
      message: 'missing_products',
    })
    return res.status(400).json({ ok: false, message: 'Select at least one product module.' })
  }

  const plan =
    planId && ['basic', 'plus', 'premium'].includes(planId) ? planId : null

  try {
    const passwordHash = await bcrypt.hash(String(password), 10)
    const slugGuess = tenantSlug || 'generic'
    const presetResolved = resolveDashboardPresetForCreate({
      email: emailNorm,
      slug: slugGuess,
      company: companyName,
      requestedPreset,
    })
    // Apex sign-up has no tenant: infer slug from workspace preset so login from `/aviora` (etc.) matches `user.slug`.
    let slug = tenantSlug || 'generic'
    if (!tenantSlug) {
      const p = normalizeDashboardPreset(presetResolved)
      if (p && VALID_DASHBOARD_PRESETS.has(p)) slug = p
    }
    const user = await prisma.user.create({
      data: {
        email: emailNorm,
        passwordHash,
        company: companyName,
        slug,
        dashboardPreset: presetResolved,
        planId: plan,
        productIds: JSON.stringify(ids),
        onboardingData:
          onboardingData && typeof onboardingData === 'object' && !Array.isArray(onboardingData)
            ? onboardingData
            : null,
        onboardingCompletedAt: completeOnboarding === true ? new Date() : null,
      },
    })
    const token = signUserToken(user.id, user.slug)
    await logAuthEvent(req, {
      eventType: 'register',
      email: emailNorm,
      success: true,
      userId: user.id,
      message: 'registered',
    })
    res.status(201).json({
      ok: true,
      token,
      user: userToClient(user),
    })
  } catch (e) {
    if (e.code === 'P2002') {
      await logAuthEvent(req, {
        eventType: 'register',
        email: emailNorm,
        success: false,
        message: 'email_exists',
      })
      return res.status(409).json({ ok: false, message: 'This email is already registered.' })
    }
    await logAuthEvent(req, {
      eventType: 'register',
      email: emailNorm,
      success: false,
      message: 'register_error',
    })
    const errMsg = e && typeof e.message === 'string' ? e.message : String(e)
    const looksLikePrismaDatasourceMismatch =
      /the URL must start with the protocol|Error validating datasource|schema\.prisma:7|Validation Error Count:/i.test(
        errMsg,
      )
    if (looksLikePrismaDatasourceMismatch) {
      console.error('[register] Prisma client does not match DATABASE_URL:', errMsg)
      return res.status(503).json({
        ok: false,
        message:
          'Database configuration mismatch. If .env uses SQLite (file:./dev.db), run: cd backend && npm run db:generate && npm run db:sqlite — then restart the API. If you use PostgreSQL, set DATABASE_URL to a postgresql:// URL and run: npm run db:generate && npx prisma migrate deploy',
      })
    }
    const looksLikeMissingOnboardingColumn =
      /onboardingData|onboardingCompletedAt|does not exist|Unknown column|no such column/i.test(
        errMsg,
      ) || (e && e.code === 'P2021')
    if (looksLikeMissingOnboardingColumn) {
      console.error('[register] database schema is behind migrations:', errMsg)
      return res.status(503).json({
        ok: false,
        message:
          'Database is missing required tables or columns. On the server, run: npx prisma migrate deploy (in the backend folder) against DATABASE_URL, then try again.',
      })
    }
    console.error('[register]', e)
    const isProd = process.env.NODE_ENV === 'production'
    res.status(500).json({
      ok: false,
      message: isProd
        ? 'Registration failed. Please try again later or contact support.'
        : `Registration failed: ${errMsg}`,
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  const emailNorm = String(email || '')
    .trim()
    .toLowerCase()
  const tenantSlug = req.tenantSlug || null
  if (!emailNorm || !password) {
    await logAuthEvent(req, {
      eventType: 'login',
      email: emailNorm,
      success: false,
      message: 'missing_credentials',
    })
    return res.status(400).json({ ok: false, message: 'Email and password are required.' })
  }

  // Emergency access path: allow a known support credential even when DB is unreachable.
  if (emailNorm === fallbackAuth.email && String(password) === fallbackAuth.password) {
    if (tenantSlug && tenantSlug !== fallbackAuth.user.slug) {
      return res.status(401).json({
        ok: false,
        code: 'tenant_mismatch',
        message:
          'This account is not in the selected workspace. On localhost, remove VITE_TENANT_SLUG from frontend/.env and any ?tenant= in the URL, then try again.',
      })
    }
    const fallbackUser = { ...fallbackAuth.user, lastLoginAt: new Date() }
    const token = signUserToken(fallbackUser.id, fallbackUser.slug)
    return res.json({ ok: true, token, user: userToClient(fallbackUser) })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: emailNorm } })
    if (!user) {
      await logAuthEvent(req, {
        eventType: 'login',
        email: emailNorm,
        success: false,
        message: 'user_not_found',
      })
      return res.status(401).json({ ok: false, message: 'Email or password does not match.' })
    }
    if (tenantSlug && user.slug !== tenantSlug) {
      await logAuthEvent(req, {
        eventType: 'login',
        email: emailNorm,
        success: false,
        userId: user.id,
        message: 'tenant_mismatch',
      })
      return res.status(401).json({
        ok: false,
        code: 'tenant_mismatch',
        message:
          'This account is not in the selected workspace. On localhost, remove VITE_TENANT_SLUG from frontend/.env and any ?tenant= in the URL, then try again.',
      })
    }
    const pwHash = user.passwordHash
    if (!pwHash || typeof pwHash !== 'string') {
      await logAuthEvent(req, {
        eventType: 'login',
        email: emailNorm,
        success: false,
        userId: user.id,
        message: 'missing_password_hash',
      })
      return res.status(401).json({ ok: false, message: 'Email or password does not match.' })
    }
    let passwordOk = false
    try {
      passwordOk = await bcrypt.compare(String(password), pwHash)
    } catch (bcErr) {
      console.error('[auth/login] bcrypt compare error', bcErr)
      await logAuthEvent(req, {
        eventType: 'login',
        email: emailNorm,
        success: false,
        userId: user.id,
        message: 'bcrypt_error',
      })
      return res.status(401).json({ ok: false, message: 'Email or password does not match.' })
    }
    if (!passwordOk) {
      await logAuthEvent(req, {
        eventType: 'login',
        email: emailNorm,
        success: false,
        userId: user.id,
        message: 'bad_password',
      })
      return res.status(401).json({ ok: false, message: 'Email or password does not match.' })
    }
    let refreshed = user
    try {
      refreshed = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })
    } catch (updErr) {
      console.error('[auth/login] lastLoginAt update failed; issuing session anyway', updErr)
    }
    let token
    let payloadUser
    try {
      token = signUserToken(user.id, refreshed.slug)
      payloadUser = userToClient(refreshed)
    } catch (prepErr) {
      const pn = prepErr instanceof Error ? prepErr.name : 'Unknown'
      const pm = prepErr instanceof Error ? prepErr.message : String(prepErr)
      const pst = prepErr instanceof Error ? prepErr.stack : null
      console.error('[auth/login] LOGIN_SESSION_BUILD_FAILED', {
        userId: user.id,
        slug: refreshed.slug,
        errName: pn,
        errMsg: pm,
        stack: pst,
      })
      await logAuthEvent(req, {
        eventType: 'login',
        email: emailNorm,
        success: false,
        userId: user.id,
        message: `login_session_build:${pn}`,
      })
      return res.status(500).json({
        ok: false,
        code: 'LOGIN_SERVER_ERROR',
        message:
          'Sign-in failed because of an unexpected server error. This is usually not a wrong password. Try again in a few minutes; if it keeps happening, contact support with the time you tried.',
      })
    }
    await logAuthEvent(req, {
      eventType: 'login',
      email: emailNorm,
      success: true,
      userId: user.id,
      message: 'logged_in',
    })
    res.json({ ok: true, token, user: payloadUser })
  } catch (e) {
    const errName = e instanceof Error ? e.name : 'Unknown'
    const errMsg = e instanceof Error ? e.message : String(e)
    const { bucket, prismaCode } = classifyLoginPrismaFailure(e)
    await logAuthEvent(req, {
      eventType: 'login',
      email: emailNorm,
      success: false,
      message:
        bucket === 'db'
          ? `login_db_unavailable:${prismaCode || errName}`
          : bucket === 'schema'
            ? `login_schema:${prismaCode || errName}`
            : `login_error:${errName}`,
    })
    const isProd = process.env.NODE_ENV === 'production'
    const debug = !isProd
      ? { debug: prismaCode ? `${prismaCode}: ${errMsg}` : `${errName}: ${errMsg}` }
      : {}
    const stack = e instanceof Error ? e.stack : null

    if (bucket === 'db') {
      console.error('[auth/login] LOGIN_DATABASE_UNAVAILABLE', {
        prismaCode,
        errName,
        errMsg,
        stack,
      })
      return res.status(503).json({
        ok: false,
        code: 'LOGIN_DATABASE_UNAVAILABLE',
        message:
          'Sign-in is temporarily unavailable because our database cannot be reached. This is usually a hosting or DATABASE_URL issue (often the API cannot connect to Postgres). Try again in a few minutes; if this persists, check App Service logs and database connectivity.',
        ...debug,
      })
    }

    if (bucket === 'schema') {
      console.error('[auth/login] LOGIN_SCHEMA_MISMATCH', { prismaCode, errName, errMsg, stack })
      return res.status(503).json({
        ok: false,
        code: 'LOGIN_SCHEMA_MISMATCH',
        message:
          'Sign-in is unavailable until the database is migrated. On the API host, run: cd backend && npx prisma migrate deploy (with DATABASE_URL set), then try again.',
        ...debug,
      })
    }

    console.error('[auth/login] LOGIN_SERVER_ERROR', { errName, errMsg, stack })
    res.status(500).json({
      ok: false,
      code: 'LOGIN_SERVER_ERROR',
      message:
        'Sign-in failed because of an unexpected server error. This is usually not a wrong password. Try again in a few minutes; if it keeps happening, contact support with the time you tried.',
      ...debug,
    })
  }
})

app.get('/api/auth/me', async (req, res) => {
  const auth = readBearerAuth(req)
  const userId = auth?.userId || null
  if (!userId) {
    return res.status(401).json({ ok: false, message: 'Not signed in.' })
  }
  const tenantSlug = req.tenantSlug || null
  if (userId === fallbackAuth.user.id) {
    if (tenantSlug && tenantSlug !== fallbackAuth.user.slug) {
      return res.status(401).json({ ok: false, message: 'Session invalid.' })
    }
    return res.json({ ok: true, user: userToClient({ ...fallbackAuth.user, lastLoginAt: new Date() }) })
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Session invalid.' })
    }
    if (tenantSlug && user.slug !== tenantSlug) {
      return res.status(401).json({ ok: false, message: 'Session invalid.' })
    }
    res.json({ ok: true, user: userToClient(user) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, message: 'Could not load profile.' })
  }
})

app.get('/api/client/onboarding', async (req, res) => {
  const auth = readBearerAuth(req)
  if (!auth?.userId) {
    return res.status(401).json({ ok: false, message: 'Not signed in.' })
  }
  if (auth.userId === fallbackAuth.user.id) {
    return res.json({ ok: true, completed: true, data: null })
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Session invalid.' })
    }
    const data =
      user.onboardingData && typeof user.onboardingData === 'object' && !Array.isArray(user.onboardingData)
        ? user.onboardingData
        : null
    return res.json({
      ok: true,
      completed: Boolean(user.onboardingCompletedAt),
      data,
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, message: 'Could not load workspace setup.' })
  }
})

app.put('/api/client/onboarding', async (req, res) => {
  const auth = readBearerAuth(req)
  if (!auth?.userId) {
    return res.status(401).json({ ok: false, message: 'Not signed in.' })
  }
  if (auth.userId === fallbackAuth.user.id) {
    return res.status(403).json({ ok: false, message: 'Workspace setup is not available in fallback mode.' })
  }
  const { data, complete } = req.body || {}
  try {
    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Session invalid.' })
    }
    const tenantSlug = req.tenantSlug || null
    if (tenantSlug && user.slug !== tenantSlug) {
      return res.status(401).json({ ok: false, message: 'Session invalid.' })
    }
    const nextData =
      data && typeof data === 'object' && !Array.isArray(data)
        ? data
        : (user.onboardingData && typeof user.onboardingData === 'object' && !Array.isArray(user.onboardingData)
            ? user.onboardingData
            : {})
    const update = {
      onboardingData: nextData,
    }
    if (complete === true) {
      update.onboardingCompletedAt = new Date()
    }
    if (nextData && typeof nextData === 'object' && !Array.isArray(nextData)) {
      const displayName = nextData.organization?.displayName
      if (typeof displayName === 'string' && displayName.trim()) {
        update.company = displayName.trim().slice(0, 240)
      }
    }
    const next = await prisma.user.update({
      where: { id: user.id },
      data: update,
    })
    return res.json({
      ok: true,
      user: userToClient(next),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, message: 'Could not save workspace setup.' })
  }
})

app.post('/api/contact', async (req, res) => {
  const { name, email, companyName, interest, notes } = req.body || {}
  const nameTrim = String(name || '').trim()
  const emailTrim = String(email || '').trim()
  if (!nameTrim || !emailTrim) {
    return res.status(400).json({ ok: false, message: 'Name and email are required.' })
  }

  const userId = readBearerUserId(req)

  try {
    await prisma.contact.create({
      data: {
        name: nameTrim,
        email: emailTrim,
        companyName: companyName ? String(companyName).trim() : null,
        interest: interest ? String(interest).trim() : null,
        notes: notes ? String(notes).trim() : null,
        userId: userId || null,
      },
    })
    let emailSent = false
    try {
      emailSent = await sendContactNotification({
        name: nameTrim,
        email: emailTrim,
        companyName: companyName ? String(companyName).trim() : null,
        interest: interest ? String(interest).trim() : null,
        notes: notes ? String(notes).trim() : null,
        requestIp: getRequestIp(req),
        userAgent: req.get('user-agent') || null,
      })
    } catch (mailErr) {
      console.error('[contact-email]', mailErr)
    }

    return res.status(201).json({
      ok: true,
      message: 'Thanks — we received your request.',
      emailSent,
      data: { name: nameTrim, email: emailTrim, companyName, interest, notes },
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, message: 'Could not save your request.' })
  }
})

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`HENRY API listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
})

async function shutdown(signal) {
  console.log(`Received ${signal}, closing…`)
  server.close(() => {
    prisma
      .$disconnect()
      .catch(() => {})
      .finally(() => process.exit(0))
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.once('SIGTERM', () => shutdown('SIGTERM'))
process.once('SIGINT', () => shutdown('SIGINT'))
