import type { RFC3339DateTime } from '@shared/types/primitiveBrands'
import { localCalendarDateKeyFromDate } from '@/utils/time/localCalendarDisplay'

/**
 * Parse contingency deadline: `endDate` + `endTime` are **browser-local** wall clock (native date/time inputs).
 * Returns UTC epoch ms for that instant, or null if time not set (no implicit default).
 */
export function parseContingencyDeadlineLocalWallToUtcMs(
  endDate: string,
  endTime: string | null
): number | null {
  if (!endTime?.trim()) return null
  const [year, month, day] = endDate.split('-').map(Number)
  const [hStr, mStr] = endTime.trim().split(':')
  const hours = Number(hStr)
  const minutes = Number(mStr)
  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null
  }
  const ms = new Date(year, month - 1, day, hours, minutes, 0, 0).getTime()
  return Number.isNaN(ms) ? null : ms
}

/** @deprecated Use parseContingencyDeadlineLocalWallToUtcMs — name kept for call-site churn; same behavior. */
export function parseContingencyDeadlineUtcMs(endDate: string, endTime: string | null): number {
  const ms = parseContingencyDeadlineLocalWallToUtcMs(endDate, endTime)
  return ms ?? Number.NaN
}

/** Convert an instant to local YYYY-MM-DD + HH:mm for native date/time inputs. */
export function deadlineUtcMsToLocalContingencyFields(ms: number): { endDate: string; endTime: string } {
  const d = new Date(ms)
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return { endDate: `${y}-${mo}-${day}`, endTime: `${h}:${min}` }
}

/** @deprecated Use deadlineUtcMsToLocalContingencyFields */
export function deadlineUtcMsToContingencyFields(ms: number): { endDate: string; endTime: string } {
  return deadlineUtcMsToLocalContingencyFields(ms)
}

/**
 * If deadline (local wall) is before earliest moveable start instant, snap deadline to earliest (shown as local fields).
 * Does not invent a time when `endTime` is null — returns input unchanged.
 */
export function clampContingencyDeadlineToEarliest(
  endDate: string,
  endTime: string | null,
  earliestStart: RFC3339DateTime
): { endDate: string; endTime: string | null } {
  const earliestMs = new Date(earliestStart).getTime()
  if (Number.isNaN(earliestMs)) {
    return { endDate, endTime }
  }
  const deadlineMs = parseContingencyDeadlineLocalWallToUtcMs(endDate, endTime)
  if (deadlineMs === null || Number.isNaN(deadlineMs) || deadlineMs >= earliestMs) {
    return { endDate, endTime }
  }
  return deadlineUtcMsToLocalContingencyFields(earliestMs)
}

/** Local calendar YYYY-MM-DD of `earliestStart` (for native date min / comparisons with `endDate`). */
export function minContingencyLocalDateKeyFromEarliest(earliestStart: RFC3339DateTime): string {
  return localCalendarDateKeyFromDate(new Date(earliestStart))
}

/** @deprecated Prefer minContingencyLocalDateKeyFromEarliest — was UTC slice; wrong vs local date input. */
export function minContingencyDateKeyFromEarliest(earliestStart: RFC3339DateTime): string {
  return minContingencyLocalDateKeyFromEarliest(earliestStart)
}

/**
 * Minimum `type="time"` when deadline date equals the local calendar day of earliest start; else full local day.
 */
export function minContingencyTimeForDate(endDate: string, earliestStart: RFC3339DateTime): string {
  const minDate = minContingencyLocalDateKeyFromEarliest(earliestStart)
  if (endDate !== minDate) return '00:00'
  const d = new Date(earliestStart)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}
