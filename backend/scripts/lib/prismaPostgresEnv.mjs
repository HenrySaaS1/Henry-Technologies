/**
 * Supabase (and similar) pooled URLs (:6543 / pooler.supabase.com) often fail or hang on
 * `prisma migrate deploy`. When DIRECT_URL is set to the Postgres "direct" URI (typically :5432),
 * migrations must use it; queries at runtime continue using pooled DATABASE_URL.
 */

export function looksLikePooledPostgres(databaseUrl) {
  const lower = String(databaseUrl || '').toLowerCase()
  return (
    lower.includes('pooler.supabase.com') ||
    lower.includes(':6543/') ||
    lower.includes('pgbouncer=true')
  )
}

/** Normalize postgres:// → postgresql:// for consistency with Prisma. */
export function postgresToPostgresqlUrl(url) {
  const s = String(url || '').trim()
  if (!s) return s
  if (/^postgres:\/\//i.test(s)) return s.replace(/^postgres:\/\//i, 'postgresql://')
  return s
}

/**
 * Resolve which URL `prisma migrate deploy` must use without mutating DATABASE_URL used at runtime.
 */
export function prismaMigrateDatabaseUrl(envars) {
  const dbRaw = String(envars?.DATABASE_URL || '').trim().replace(/^['"]|['"]$/g, '')
  const dirRaw = String(envars?.DIRECT_URL || '').trim().replace(/^['"]|['"]$/g, '')

  let db = postgresToPostgresqlUrl(dbRaw)
  const explicitDirect = postgresToPostgresqlUrl(dirRaw)

  if (!/^postgres(ql)?:\/\//i.test(db)) {
    return { migrateUrl: db, warnMissingDirectForPooler: false }
  }

  if (explicitDirect && /^postgres(ql)?:\/\//i.test(explicitDirect)) {
    return { migrateUrl: explicitDirect, warnMissingDirectForPooler: false }
  }

  if (looksLikePooledPostgres(db)) {
    console.error(
      '[prisma-migrate-env] DATABASE_URL points at a connection pooler. Add DIRECT_URL with your Supabase "Direct connection" URI (host db.*.supabase.co, port 5432, sslmode=require) in Azure Configuration (or backend/.env.postgres) so migrations can finish; pooled URLs often leave migrations unapplied.',
    )
    return { migrateUrl: db, warnMissingDirectForPooler: true }
  }

  return { migrateUrl: db, warnMissingDirectForPooler: false }
}
