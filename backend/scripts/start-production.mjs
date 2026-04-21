import { spawn } from 'node:child_process'

function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: process.platform === 'win32' })
    child.on('close', (code) => resolve(Number(code ?? 1)))
    child.on('error', () => resolve(1))
  })
}

async function start() {
  const migrateExit = await run('npx', ['prisma', 'migrate', 'deploy'])
  if (migrateExit !== 0) {
    console.error('[startup] prisma migrate deploy failed; continuing API startup.')
  }

  const apiExit = await run('node', ['index.js'])
  process.exit(apiExit)
}

start()
