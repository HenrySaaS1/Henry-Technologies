import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me'

export function signUserToken(userId, tenantSlug = null) {
  const payload = { sub: userId }
  if (tenantSlug && typeof tenantSlug === 'string') payload.tenant = tenantSlug
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyUserToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    if (typeof payload.sub !== 'string') return null
    return {
      userId: payload.sub,
      tenantSlug: typeof payload.tenant === 'string' ? payload.tenant : null,
    }
  } catch {
    return null
  }
}

export function readBearerUserId(req) {
  const raw = req.headers.authorization
  if (!raw || typeof raw !== 'string') return null
  const m = raw.match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  return verifyUserToken(m[1].trim())?.userId || null
}

export function readBearerAuth(req) {
  const raw = req.headers.authorization
  if (!raw || typeof raw !== 'string') return null
  const m = raw.match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  return verifyUserToken(m[1].trim())
}
