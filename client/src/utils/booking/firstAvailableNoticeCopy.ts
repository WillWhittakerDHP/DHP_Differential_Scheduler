/** User-facing sentence when auto-jumping from today to the earliest bookable day. */
export function buildFirstAvailableNoticeCopy(firstDate: string): string {
  const dateObj = new Date(`${firstDate}T00:00:00`)
  const formatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  return `Today is fully booked. Showing ${formatted} — the earliest date with available slots.`
}
