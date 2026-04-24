import { spawn } from 'node:child_process'

function run(command, args, { timeoutMs = 0 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' })
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
  const isProd = process.env.NODE_ENV === 'production'
  // Azure Postgres on first deploy can be slow; allow enough time for migrate deploy to finish.
  const migrateExit = await run('npx', ['prisma', 'migrate', 'deploy'], { timeoutMs: 90_000 })
  if (migrateExit !== 0) {
    if (migrateExit === 124) {
      console.error('[startup] prisma migrate deploy timed out after 90s.')
    } else {
      console.error('[startup] prisma migrate deploy failed (exit ' + migrateExit + ').')
    }
    if (isProd) {
      console.error(
        '[startup] Refusing to start the API: database schema is not up to date. Fix DATABASE_URL / firewall, then run: cd backend && npx prisma migrate deploy. See docs/azure-new-account-fresh-setup.md (database migrations / troubleshooting).',
      )
      process.exit(1)
    }
  }

  const apiExit = await run('node', ['index.js'])
  process.exit(apiExit)
}

start()
