/**
 * Maps marketing / white-label hostnames to workspace tenant slugs.
 * Keep in sync with `tenantSlugFromHost` in `frontend/src/apiClient.js`.
 * Path-based `/harland` and `/aviora` on the apex site are resolved in the browser only (see `getTenantSlug` there).
 */
export function tenantSlugFromHost(hostname) {
  let host = String(hostname || '')
    .trim()
    .toLowerCase()
  if (!host) return null
  while (host.startsWith('www.')) host = host.slice(4)
  if (host === 'harland.goaskhenry.com' || host === 'harlandmedical.goaskhenry.com') return 'harland'
  if (
    (host.startsWith('harland.') || host.startsWith('harlandmedical.')) &&
    host.endsWith('.goaskhenry.com')
  ) {
    return 'harland'
  }
  if (host === 'aviora.goaskhenry.com') return 'aviora'
  if (host.startsWith('aviora.') && host.endsWith('.goaskhenry.com')) {
    return 'aviora'
  }
  return null
}
