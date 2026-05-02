/**
 * Fail fast on Azure / production when required settings are missing or unsafe.
 */
export function assertProductionEnv() {
  if (process.env.NODE_ENV !== 'production') return

  const errors = []
  const rawDb = String(process.env.DATABASE_URL || '').trim()
  const isPostgresUrl = /^postgres(ql)?:\/\//i.test(rawDb)
  if (!isPostgresUrl) {
    errors.push('DATABASE_URL must be a PostgreSQL URL (postgres://... or postgresql://...).')
  } else if (/^postgres:\/\//i.test(rawDb)) {
    // Normalize common provider URLs so Prisma gets the expected scheme.
    process.env.DATABASE_URL = rawDb.replace(/^postgres:\/\//i, 'postgresql://')
  }
  const rawDirect = String(process.env.DIRECT_URL || '').trim()
  if (rawDirect && /^postgres:\/\//i.test(rawDirect)) {
    process.env.DIRECT_URL = rawDirect.replace(/^postgres:\/\//i, 'postgresql://')
  }
  const secret = process.env.JWT_SECRET || ''
  if (!secret || secret === 'dev-only-change-me' || secret.length < 16) {
    errors.push('JWT_SECRET must be set to a strong secret (at least 16 characters) in production.')
  }
  const origins = String(process.env.CORS_ORIGIN || '')
    .split(',')
    .map((v) => v.trim().replace(/\/+$/, ''))
    .filter(Boolean)
  if (origins.length === 0 || origins.some((o) => !o.startsWith('https://'))) {
    errors.push(
      'CORS_ORIGIN must be one or more https origins (comma-separated, no trailing slash), e.g. https://app.azurestaticapps.net',
    )
  }

  if (errors.length > 0) {
    // Keep the API booting so /api/health and runtime logs are available during recovery.
    console.error('[henry] Invalid Application settings (startup continues in degraded mode):\n', errors.map((e) => `  • ${e}`).join('\n'))
  }
}
