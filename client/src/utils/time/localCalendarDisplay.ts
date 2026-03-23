/**
 * WHY: Slot times use the browser's local timezone (useLocalTime / getHours). "Today" / "Tomorrow"
 * must use the same local calendar or the day chip disagrees with the times on the buttons.
 * UTC YYYY-MM-DD keys stay authoritative for API/range; this module is UI-relative labels only.
 */

function localCalendarDateKeyFromDateCore(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function localCalendarDateKeyFromDate(d: Date): string {
  return localCalendarDateKeyFromDateCore(d)
}

export function addLocalCalendarDays(ymd: string, deltaDays: number): string {
  const [y, mo, d] = ymd.split('-').map(Number)
  const dt = new Date(y, (mo ?? 1) - 1, d ?? 1)
  dt.setDate(dt.getDate() + deltaDays)
  return localCalendarDateKeyFromDateCore(dt)
}

/** Weekday + month + day for a local calendar YYYY-MM-DD (interpreted in browser local TZ). */
export function formatLocalCalendarKeyWithWeekday(localYmd: string): string {
  const [y, mo, d] = localYmd.split('-').map(Number)
  if (!y || !mo || !d) return localYmd
  const date = new Date(y, mo - 1, d, 12, 0, 0, 0)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
