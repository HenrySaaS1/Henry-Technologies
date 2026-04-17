import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/** PWA assets must follow Vite base path (e.g. /hms1/) so manifest resolves on mobile installs. */
const base = import.meta.env.BASE_URL || '/'
const iconHref = `${base}henry-pwa-icon.svg`.replace(/\/{2,}/g, '/')
document.querySelector('link[rel="manifest"]')?.setAttribute('href', `${base}manifest.webmanifest`.replace(/\/{2,}/g, '/'))
document.getElementById('henry-pwa-icon')?.setAttribute('href', iconHref)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
