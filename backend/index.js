import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { prisma } from './lib/prisma.js'
import { signUserToken, readBearerAuth, readBearerUserId } from './lib/authTokens.js'
import { assertProductionEnv } from './lib/productionEnv.js'

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

function tenantSlugFromHost(hostname) {
  const host = String(hostname || '')
    .trim()
    .toLowerCase()
  if (!host) return null
  if (host === 'harlandmedical.goaskhenry.com' || host === 'harland.goaskhenry.com') return 'harland'
  return null
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
      if (isGoAskHenryOrigin(origin)) return callback(null, true)
      if (isTrustedAzureFrontend(origin)) return callback(null, true)
      // Reject safely without throwing 500 on preflight.
      return callback(null, false)
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
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

function userToClient(u) {
  let products = []
  try {
    products = JSON.parse(u.productIds)
    if (!Array.isArray(products)) products = []
  } catch {
    products = []
  }
  return {
    email: u.email,
    company: u.company,
    slug: u.slug,
    products,
    planId: u.planId,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    lastLoginAt:
      u.lastLoginAt instanceof Date ? u.lastLoginAt.toISOString() : u.lastLoginAt ?? null,
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
  res.json({ ok: true, message: 'HENRY backend is running' })
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
  const { email, password, company, productIds, planId } = req.body || {}
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
    const user = await prisma.user.create({
      data: {
        email: emailNorm,
        passwordHash,
        company: companyName,
        slug: tenantSlug || 'generic',
        planId: plan,
        productIds: JSON.stringify(ids),
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
    console.error(e)
    res.status(500).json({ ok: false, message: 'Registration failed.' })
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
      return res.status(401).json({ ok: false, message: 'Email or password does not match.' })
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
      return res.status(401).json({ ok: false, message: 'Email or password does not match.' })
    }
    const ok = await bcrypt.compare(String(password), user.passwordHash)
    if (!ok) {
      await logAuthEvent(req, {
        eventType: 'login',
        email: emailNorm,
        success: false,
        userId: user.id,
        message: 'bad_password',
      })
      return res.status(401).json({ ok: false, message: 'Email or password does not match.' })
    }
    const refreshed = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })
    const token = signUserToken(user.id, refreshed.slug)
    await logAuthEvent(req, {
      eventType: 'login',
      email: emailNorm,
      success: true,
      userId: user.id,
      message: 'logged_in',
    })
    res.json({ ok: true, token, user: userToClient(refreshed) })
  } catch (e) {
    await logAuthEvent(req, {
      eventType: 'login',
      email: emailNorm,
      success: false,
      message: 'login_error',
    })
    console.error(e)
    res.status(500).json({ ok: false, message: 'Sign in failed.' })
  }
})

app.get('/api/auth/me', async (req, res) => {
  const auth = readBearerAuth(req)
  const userId = auth?.userId || null
  if (!userId) {
    return res.status(401).json({ ok: false, message: 'Not signed in.' })
  }
  const tenantSlug = req.tenantSlug || null
  if (tenantSlug && auth?.tenantSlug && auth.tenantSlug !== tenantSlug) {
    return res.status(401).json({ ok: false, message: 'Session invalid.' })
  }
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
