import { apiJson, getToken, isDemoDashboardToken } from '../apiClient.js'

export function lineFromAlertTitle(title) {
  const t = String(title || '')
  const m = t.match(/^(Line\s+\d+|Press Cell\s+\d+|Robot\s+\S+|Chiller[^—\-]{0,40}|Compressor[^—\-]{0,20})/i)
  return m ? m[1].trim() : ''
}

export function dashboardAlertsToOdooEvents(alerts, { tenant = '', ackedIds, site = 'US HQ' } = {}) {
  const rows = (Array.isArray(alerts) ? alerts : []).map((a) => ({
    id: a.id,
    title: a.title,
    eventType: 'alert',
    severity: a.severity || 'med',
    status: ackedIds instanceof Set && ackedIds.has(a.id) ? 'acknowledged' : 'open',
    site,
    line: lineFromAlertTitle(a.title),
    tenant,
    detail: a.detail || '',
  }))
  if (tenant) {
    rows.unshift({
      id: `snapshot-${tenant}`,
      title: 'HENRY SnapShot',
      eventType: 'snapshot',
      severity: 'low',
      status: 'open',
      site,
      tenant,
      detail: 'Live SnapShot / Dashboard feed from HENRY.',
    })
  }
  return rows
}

/** Pushes current dashboard alerts to Odoo. No-op for local demo-token sessions. */
export async function pushDashboardAlertsToOdoo(alerts, opts) {
  if (isDemoDashboardToken(getToken())) return null
  const events = dashboardAlertsToOdooEvents(alerts, opts)
  return apiJson('/api/integrations/odoo/sync', { method: 'POST', body: { events } })
}

export async function fetchOdooIntegrationStatus() {
  return apiJson('/api/integrations/odoo/status')
}

export const DEFAULT_ODOO_EVENTS_APP_URL = 'https://henrytechnologies.odoo.com/odoo/action-361'
export const DEFAULT_ODOO_SNAPSHOT_URL = 'https://www.goaskhenry.com'
