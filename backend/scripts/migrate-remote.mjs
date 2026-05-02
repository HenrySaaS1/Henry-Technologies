import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { parse } from 'dotenv'
import { prismaMigrateDatabaseUrl } from './lib/prismaPostgresEnv.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const envPath = resolve(root, '.env.postgres')

if (!existsSync(envPath)) {
  console.error(`Missing ${envPath}`)
  console.error(
    'Create it from backend/.env.postgres.example, paste DATABASE_URL from Supabase (Project Settings → Database), then:',
  )
  console.error('  npm run db:deploy:remote')
  process.exit(1)
}

let entries
try {
  entries = parse(readFileSync(envPath, 'utf8'))
} catch (e) {
  console.error('Could not parse backend/.env.postgres:', e instanceof Error ? e.message : e)
  process.exit(1)
}

const url = String(entries.DATABASE_URL || '')
  .trim()
  .replace(/^['"]|['"]$/g, '')
if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
  console.error('backend/.env.postgres must set DATABASE_URL to a postgres:// or postgresql:// URI.')
  process.exit(1)
}

let directRaw = String(entries.DIRECT_URL || '')
  .trim()
  .replace(/^['"]|['"]$/g, '')

const { migrateUrl } = prismaMigrateDatabaseUrl({
  DATABASE_URL: url,
  DIRECT_URL: directRaw,
})

const proc = spawn('npx', ['prisma', 'migrate', 'deploy'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, DATABASE_URL: migrateUrl },
})

proc.on('close', (code) => process.exit(code === null ? 1 : code))
