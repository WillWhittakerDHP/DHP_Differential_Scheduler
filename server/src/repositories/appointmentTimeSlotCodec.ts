/**
 * Map appointment_time_slots rows ↔ legacy API `selectedTimeSlots` array.
 */
import type { AppointmentTimeSlot } from '../db/models/booking/appointment_time_slot.js'

export function bodyTouchesTimeSlots(body: Record<string, unknown>): boolean {
  return Object.prototype.hasOwnProperty.call(body, 'selectedTimeSlots')
}

export function stripSelectedTimeSlotsFromPlainObject(obj: Record<string, unknown>): void {
  delete obj.selectedTimeSlots
}

function str(v: unknown): string | null {
  if (typeof v !== 'string' || v.trim().length === 0) return null
  return v.trim()
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? Math.floor(n) : null
}

export interface ParsedAppointmentTimeSlotRow {
  sortOrder: number
  startAt: Date
  endAt: Date
  durationMinutes: number | null
  slotMetadata: Record<string, unknown> | null
}

/** Parse request body array into row payloads; throws if invalid. */
export function parseSelectedTimeSlotsBody(raw: unknown): ParsedAppointmentTimeSlotRow[] | null {
  if (raw === undefined) return null
  if (raw === null) return []
  if (!Array.isArray(raw)) {
    throw new Error('selectedTimeSlots must be an array or null')
  }
  const out: ParsedAppointmentTimeSlotRow[] = []
  let i = 0
  for (const el of raw) {
    if (el === null || typeof el !== 'object') {
      throw new Error(`selectedTimeSlots[${i}] must be an object`)
    }
    const o = el as Record<string, unknown>
    const startRaw = str(o.startTime) ?? str(o.time)
    const endRaw = str(o.endTime) ?? str(o.time)
    if (!startRaw || !endRaw) {
      throw new Error(`selectedTimeSlots[${i}] requires startTime and endTime (or time) as non-empty ISO strings`)
    }
    const startAt = new Date(startRaw)
    const endAt = new Date(endRaw)
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new Error(`selectedTimeSlots[${i}] has invalid date values`)
    }
    const durationMinutes = num(o.duration)
    const { startTime: _st, endTime: _et, time: _tm, duration: _du, ...rest } = o
    const keys = Object.keys(rest)
    out.push({
      sortOrder: i,
      startAt,
      endAt,
      durationMinutes,
      slotMetadata: keys.length > 0 ? (rest as Record<string, unknown>) : null,
    })
    i += 1
  }
  return out
}

export function rowsToLegacySelectedTimeSlots(
  rows: Array<Pick<AppointmentTimeSlot, 'startAt' | 'endAt' | 'durationMinutes' | 'slotMetadata'>>
): Array<Record<string, unknown>> {
  return rows.map((r) => {
    const meta =
      r.slotMetadata !== null &&
      typeof r.slotMetadata === 'object' &&
      !Array.isArray(r.slotMetadata)
        ? { ...(r.slotMetadata as Record<string, unknown>) }
        : {}
    return {
      ...meta,
      startTime: r.startAt instanceof Date ? r.startAt.toISOString() : String(r.startAt),
      endTime: r.endAt instanceof Date ? r.endAt.toISOString() : String(r.endAt),
      ...(r.durationMinutes !== null && r.durationMinutes !== undefined ? { duration: r.durationMinutes } : {}),
    }
  })
}
