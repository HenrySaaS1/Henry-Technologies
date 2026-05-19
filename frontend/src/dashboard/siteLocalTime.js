/**
 * Live clock in the site’s IANA zone (e.g. "Tue, May 19, 12:02 PM CDT").
 * @param {Date} date
 * @param {string | undefined} timeZone
 */
export function formatSiteLocalTime(date, timeZone) {
  if (!timeZone) {
    return date.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date)
  } catch {
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }
}
