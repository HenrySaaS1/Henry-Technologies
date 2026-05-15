import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SiteGate from './SiteGate.jsx'

/**
 * Full-screen preview password gate (`SiteGate.jsx`). Off by default.
 * Set `true` to restore — still requires `VITE_SITE_GATE_PASSWORD` at build time (see `.env.example`).
 */
const ENABLE_SITE_GATE = false

/** PWA assets must follow Vite base path (e.g. /hms1/) so manifest resolves on mobile installs. */
const base = import.meta.env.BASE_URL || '/'
const logoHref = `${base}henry-logo.png`.replace(/\/{2,}/g, '/')
document.querySelector('link[rel="manifest"]')?.setAttribute('href', `${base}manifest.webmanifest`.replace(/\/{2,}/g, '/'))
document.getElementById('henry-favicon')?.setAttribute('href', logoHref)
document.getElementById('henry-pwa-icon')?.setAttribute('href', logoHref)

const appTree = ENABLE_SITE_GATE ? (
  <SiteGate>
    <App />
  </SiteGate>
) : (
  <App />
)

createRoot(document.getElementById('root')).render(<StrictMode>{appTree}</StrictMode>)
