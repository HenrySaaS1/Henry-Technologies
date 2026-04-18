import { useMemo, useState } from 'react'

const STORAGE_KEY = 'henry_site_gate_ok_v1'

function gatePasswordFromEnv() {
  const v = import.meta.env.VITE_SITE_GATE_PASSWORD
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * Optional full-screen password prompt before the SPA loads.
 * Enabled only when VITE_SITE_GATE_PASSWORD is set at **build** time.
 *
 * Limitations: the password is bundled in client JS; anyone can extract it or
 * bypass the UI. Use for casual preview only, not for real secrets or compliance.
 */
export default function SiteGate({ children }) {
  const expected = useMemo(() => gatePasswordFromEnv(), [])
  const [unlocked, setUnlocked] = useState(() => {
    if (!expected) return true
    try {
      return sessionStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  if (!expected || unlocked) {
    return children
  }

  const submit = (event) => {
    event.preventDefault()
    setError('')
    if (input.trim() === expected) {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1')
      } catch {
        /* private / blocked storage — still show app this session */
      }
      setUnlocked(true)
    } else {
      setError('That password does not match.')
      setInput('')
    }
  }

  return (
    <div className="site-gate-overlay" role="dialog" aria-modal="true" aria-labelledby="site-gate-title">
      <form className="site-gate-card" onSubmit={submit}>
        <h1 id="site-gate-title">Site preview</h1>
        <p className="site-gate-note">
          This page is password-protected for a temporary preview. This is not a substitute for server-side access
          control.
        </p>
        <label className="site-gate-label">
          Password
          <input
            type="password"
            name="site-gate-password"
            autoComplete="current-password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </label>
        {error ? <p className="site-gate-error">{error}</p> : null}
        <button type="submit" className="site-gate-submit">
          Continue
        </button>
      </form>
    </div>
  )
}
