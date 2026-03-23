/**
 * WHY: Single place for UTC calendar-day keys from slot start times (availability grouping).
 */

export function utcDateKeyFromSlotStartTime(startTime: string): string {
  const slotDateObj = new Date(startTime)
  const year = slotDateObj.getUTCFullYear()
  const month = String(slotDateObj.getUTCMonth() + 1).padStart(2, '0')
  const day = String(slotDateObj.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
