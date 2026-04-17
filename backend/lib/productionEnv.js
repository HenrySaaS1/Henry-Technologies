/**
 * Fail fast on Azure / production when required settings are missing or unsafe.
 */
export function assertProductionEnv() {
  if (process.env.NODE_ENV !== 'production') return

  const errors = []
  const db = process.env.DATABASE_URL || ''
  if (!db.startsWith('postgresql:')) {
    errors.push('DATABASE_URL must be a PostgreSQL URL (postgresql://...) with sslmode=require on Azure.')
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

  if (errors.length) {
    console.error('[henry] Refusing to start — fix Application settings:\n', errors.map((e) => `  • ${e}`).join('\n'))
    process.exit(1)
  }
}
