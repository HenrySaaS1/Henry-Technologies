/**
 * Odoo Online JSON-2 client for HENRY Events (x_henry_events).
 * Auth: ODOO_API_KEY as bearer token. Never log the key.
 */

const DEFAULT_URL = 'https://henrytechnologies.odoo.com'
const DEFAULT_MODEL = 'x_henry_events'

export function isOdooConfigured() {
  return Boolean(String(process.env.ODOO_API_KEY || '').trim())
}

function odooUrl() {
  return String(process.env.ODOO_URL || DEFAULT_URL).replace(/\/+$/, '')
}

function odooModel() {
  return String(process.env.ODOO_EVENTS_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL
}

async function odooCall(model, method, params = {}) {
  const key = String(process.env.ODOO_API_KEY || '').trim()
  if (!key) {
    const err = new Error('ODOO_API_KEY is not set')
    err.code = 'ODOO_NOT_CONFIGURED'
    throw err
  }

  const res = await fetch(`${odooUrl()}/json/2/${model}/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    const err = new Error(`Odoo returned non-JSON (${res.status})`)
    err.status = res.status
    throw err
  }

  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `Odoo ${res.status}`)
    err.status = res.status
    err.detail = data
    throw err
  }
  return data
}

function toOdooDatetime(value) {
  if (!value) return false
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return false
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

export function mapEventToOdooVals(event) {
  const src = event && typeof event === 'object' ? event : {}
  const henryId = String(src.henryId || src.id || '').trim()
  const vals = {
    x_name: String(src.title || src.x_name || 'HENRY event').slice(0, 128),
    x_studio_henry_id: henryId,
    x_studio_event_type: src.eventType || src.type || 'alert',
    x_studio_severity: src.severity || 'med',
    x_studio_status: src.status || 'open',
    x_studio_site: src.site || '',
    x_studio_line: src.line || '',
    x_studio_tenant: src.tenant || '',
    x_studio_detail: src.detail || src.notes || '',
  }
  const detected = src.detectedAt || src.detected_at
  if (detected) vals.x_studio_detected_at = toOdooDatetime(detected)
  return vals
}

export async function upsertHenryEvent(event) {
  const henryId = String(event?.henryId || event?.id || '').trim()
  const model = odooModel()

  if (henryId) {
    const found = await odooCall(model, 'search_read', {
      domain: [['x_studio_henry_id', '=', henryId]],
      fields: ['id'],
      limit: 1,
    })
    if (Array.isArray(found) && found[0]?.id) {
      const vals = mapEventToOdooVals(event)
      await odooCall(model, 'write', { ids: [found[0].id], vals })
      return { id: found[0].id, henryId, action: 'updated' }
    }
  }

  const created = await odooCall(model, 'create', {
    vals_list: [mapEventToOdooVals({ ...event, detectedAt: event?.detectedAt || event?.detected_at || new Date() })],
  })
  const id = Array.isArray(created) ? created[0] : created
  return { id, henryId, action: 'created' }
}

export async function listHenryEvents({ limit = 50 } = {}) {
  return odooCall(odooModel(), 'search_read', {
    domain: [],
    fields: [
      'id',
      'x_name',
      'x_studio_henry_id',
      'x_studio_severity',
      'x_studio_event_type',
      'x_studio_status',
      'x_studio_site',
      'x_studio_line',
      'x_studio_tenant',
      'x_studio_detected_at',
      'x_studio_detail',
    ],
    limit,
    order: 'id desc',
  })
}

/** Demo alerts matching the HENRY dashboard registry — used when body.events is omitted. */
export const DEFAULT_SNAPSHOT_EVENTS = [
  {
    id: 'snapshot-harland',
    title: 'HENRY SnapShot',
    eventType: 'snapshot',
    severity: 'low',
    status: 'open',
    site: 'US HQ',
    tenant: 'harland',
    detail: 'Live SnapShot / Dashboard feed from HENRY.',
  },
  {
    id: 'a1',
    title: 'Line 07 — spindle vibration',
    eventType: 'alert',
    severity: 'high',
    site: 'US HQ',
    line: 'L07',
    tenant: 'harland',
    detail: 'Exceeded baseline for 6 min. Operator notified; maintenance ticket opened.',
  },
  {
    id: 'a2',
    title: 'Press Cell 2 — tonnage drift',
    eventType: 'alert',
    severity: 'high',
    site: 'US HQ',
    line: 'Press Cell 2',
    tenant: 'harland',
    detail: 'Peak force 4% below recipe for 8 cycles. Engineering paged.',
  },
  {
    id: 'a3',
    title: 'Robot R-12 — cycle drift',
    eventType: 'alert',
    severity: 'med',
    site: 'US HQ',
    line: 'R-12',
    tenant: 'harland',
    detail: '+8% vs last week. Suggested torque recalibration after next break.',
  },
  {
    id: 'a4',
    title: 'Chiller loop B — supply temp',
    eventType: 'alert',
    severity: 'med',
    site: 'US HQ',
    line: 'Chiller B',
    tenant: 'harland',
    detail: 'Running 1.2C above setpoint for 25 min. No line stop.',
  },
  {
    id: 'a5',
    title: 'Compressor room — temperature',
    eventType: 'alert',
    severity: 'low',
    site: 'US HQ',
    line: 'Compressor',
    tenant: 'harland',
    detail: 'Trending up; no stoppage; facilities team on digest.',
  },
]

export async function syncEventsToOdoo(events) {
  const list = Array.isArray(events) && events.length ? events : DEFAULT_SNAPSHOT_EVENTS
  const results = []
  for (const event of list) {
    results.push(await upsertHenryEvent(event))
  }
  return results
}
