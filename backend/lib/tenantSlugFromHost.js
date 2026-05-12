/**
 * Maps marketing / white-label hostnames to workspace tenant slugs.
 * Keep in sync with `tenantSlugFromHost` in `frontend/src/apiClient.js`.
 * Path-based `/harland` on the apex site is resolved in the browser only (see `getTenantSlug` there).
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
  return null
}
