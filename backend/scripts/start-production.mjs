import { spawn } from 'node:child_process'
import { prismaMigrateDatabaseUrl } from './lib/prismaPostgresEnv.mjs'

function run(command, args, { timeoutMs = 0, env = undefined } = {}) {
  const childEnv = env ? { ...process.env, ...env } : { ...process.env }
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: childEnv,
    })
    let timedOut = false
    let timeout
    if (timeoutMs > 0) {
      timeout = setTimeout(() => {
        timedOut = true
        try {
          child.kill('SIGTERM')
        } catch {}
      }, timeoutMs)
    }
    child.on('error', () => resolve(1))
    child.on('close', (code) => {
      if (timeout) clearTimeout(timeout)
      if (timedOut) return resolve(124)
      return resolve(Number(code ?? 1))
    })
  })
}

async function start() {
  const { migrateUrl } = prismaMigrateDatabaseUrl(process.env)

  // Run migrations before the API. If this fails, we still start the process so the site does not
  // go completely offline; fix the DB in Azure, then restart the Web App. (Exiting the whole
  // process on migrate failure can leave the Static Web App showing “Cannot reach API” with no
  // running container.)
  const migrateExit = await run(
    'npx',
    ['prisma', 'migrate', 'deploy'],
    { timeoutMs: 120_000, env: { DATABASE_URL: migrateUrl } },
  )
  if (migrateExit !== 0) {
    if (migrateExit === 124) {
      console.error(
        '[startup] prisma migrate deploy timed out after 90s — starting API anyway. Check DATABASE_URL, firewall, and run migrations, then restart.',
      )
    } else {
      console.error(
        '[startup] prisma migrate deploy failed (exit ' +
          migrateExit +
          ') — starting API anyway. Some routes may error until the DB is migrated. See docs/azure-new-account-fresh-setup.md §7.1',
      )
    }
  }

  const apiExit = await run('node', ['index.js'])
  process.exit(apiExit)
}

start()
