/**
 * Run `prisma migrate deploy` from CI or a shell, using the same URL rules as App Service startup
 * (DIRECT_URL for Supabase pooler). Exits 0 if DATABASE_URL is unset (optional CI step).
 */
import { spawn } from 'node:child_process'
import { prismaMigrateDatabaseUrl } from './lib/prismaPostgresEnv.mjs'

const db = String(process.env.DATABASE_URL || '').trim()
if (!db) {
  console.log(
    '[migrate-ci] DATABASE_URL unset — skipping. Set PRODUCTION_DATABASE_URL (and PRODUCTION_DIRECT_URL if using a pooler) in GitHub Actions to apply migrations from CI.',
  )
  process.exit(0)
}

const { migrateUrl, warnMissingDirectForPooler } = prismaMigrateDatabaseUrl(process.env)
if (warnMissingDirectForPooler) {
  console.error(
    '[migrate-ci] DATABASE_URL looks like a pooler but DIRECT_URL is missing. Add GitHub secret PRODUCTION_DIRECT_URL (Supabase direct connection, port 5432).',
  )
  process.exit(1)
}

const proc = spawn('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, DATABASE_URL: migrateUrl },
})

proc.on('close', (code) => process.exit(code === null ? 1 : code))
