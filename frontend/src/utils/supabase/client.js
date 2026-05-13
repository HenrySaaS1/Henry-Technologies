import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-only Supabase client for this Vite + React app.
 *
 * Env (expose via Vite): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (publishable / anon key).
 * Copy `frontend/.env.example` → `frontend/.env.local` and set values from the Supabase dashboard.
 *
 * Next.js patterns (`utils/supabase/server.ts`, root `middleware.ts`, `cookies()` from `next/headers`)
 * do not apply here; session refresh in an SPA is usually `supabase.auth.onAuthStateChange` in `App.jsx`
 * or `main.jsx` if you wire Supabase Auth into the UI.
 */

let singleton = null

export function createClient() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  if (!singleton) {
    singleton = createBrowserClient(supabaseUrl, supabaseKey)
  }
  return singleton
}
