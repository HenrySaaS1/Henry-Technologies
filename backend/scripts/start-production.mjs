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
  const migrateExit = await run('npx', ['prisma', 'migrate', 'deploy'], { timeoutMs: 20_000 })
  if (migrateExit !== 0) {
    if (migrateExit === 124) {
      console.error('[startup] prisma migrate deploy timed out; continuing API startup.')
    } else {
      console.error('[startup] prisma migrate deploy failed; continuing API startup.')
    }
  }

  const apiExit = await run('node', ['index.js'])
  process.exit(apiExit)
}

start()
