/**
 * Map appointment_selection_lines <-> denormalized flat API fields (arrays + quantity maps).
 */
import type { AppointmentSelectionLine, AppointmentSelectionLineKind } from '../db/models/booking/appointment_selection_line.js'

/** Keys persisted on child rows and mirrored on appointment JSON for API responses. */
const APPOINTMENT_SELECTION_ATTRIBUTE_KEYS = [
  'selectedServiceIds',
  'serviceQuantities',
  'selectedTimeIds',
  'timeQuantities',
  'selectedEventIds',
  'eventQuantities',
  'serviceSnapshotIds',
  'timeSnapshotIds',
  'eventSnapshotIds',
] as const

type AppointmentSelectionFlatFields = {
  selectedServiceIds: string[] | null
  serviceQuantities: Record<string, number> | null
  selectedTimeIds: string[] | null
  timeQuantities: Record<string, number> | null
  selectedEventIds: string[] | null
  eventQuantities: Record<string, number> | null
  serviceSnapshotIds: string[] | null
  timeSnapshotIds: string[] | null
  eventSnapshotIds: string[] | null
}

export function emptyFlatSelectionFields(): AppointmentSelectionFlatFields {
  return {
    selectedServiceIds: null,
    serviceQuantities: null,
    selectedTimeIds: null,
    timeQuantities: null,
    selectedEventIds: null,
    eventQuantities: null,
    serviceSnapshotIds: null,
    timeSnapshotIds: null,
    eventSnapshotIds: null,
  }
}

function kindRank(k: AppointmentSelectionLineKind): number {
  if (k === 'service') return 0
  if (k === 'time') return 1
  return 2
}

function compareLines(a: AppointmentSelectionLine, b: AppointmentSelectionLine): number {
  const ra = kindRank(a.lineKind as AppointmentSelectionLineKind)
  const rb = kindRank(b.lineKind as AppointmentSelectionLineKind)
  if (ra !== rb) return ra - rb
  return a.sortOrder - b.sortOrder
}

export function linesToFlatSelectionFields(lines: AppointmentSelectionLine[]): AppointmentSelectionFlatFields {
  const sorted = [...lines].sort(compareLines)
  const byKind: Record<AppointmentSelectionLineKind, AppointmentSelectionLine[]> = {
    service: [],
    time: [],
    event: [],
  }
  for (const row of sorted) {
    const k = row.lineKind as AppointmentSelectionLineKind
    if (k === 'service' || k === 'time' || k === 'event') {
      byKind[k].push(row)
    }
  }

  function pack(kind: AppointmentSelectionLineKind): {
    ids: string[] | null
    quantities: Record<string, number> | null
    snapshots: string[] | null
  } {
    const rows = byKind[kind]
    if (rows.length === 0) {
      return { ids: null, quantities: null, snapshots: null }
    }
    const ids = rows.map((r) => r.blockInstanceId)
    const quantities: Record<string, number> = {}
    let anyNonDefault = false
    for (const r of rows) {
      const q = r.quantity ?? 1
      quantities[r.blockInstanceId] = q
      if (q !== 1) anyNonDefault = true
    }
    const snapCandidates = rows.map((r) => r.snapshotVersionId)
    const allSnapshots =
      rows.length > 0 && snapCandidates.every((s): s is string => typeof s === 'string' && s.length > 0)
        ? snapCandidates
        : null
    return {
      ids,
      quantities: anyNonDefault ? quantities : null,
      snapshots: allSnapshots,
    }
  }

  const svc = pack('service')
  const prop = pack('time')
  const opt = pack('event')

  return {
    selectedServiceIds: svc.ids,
    serviceQuantities: svc.quantities,
    serviceSnapshotIds: svc.snapshots,
    selectedTimeIds: prop.ids,
    timeQuantities: prop.quantities,
    timeSnapshotIds: prop.snapshots,
    selectedEventIds: opt.ids,
    eventQuantities: opt.quantities,
    eventSnapshotIds: opt.snapshots,
  }
}

function coerceIdArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((x): x is string => typeof x === 'string' && x.length > 0)
}

function coerceQuantityMap(value: unknown): Record<string, number> | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'object') return null
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const n = typeof v === 'number' ? v : Number(v)
    if (!Number.isFinite(n)) continue
    out[k] = Math.max(1, Math.floor(n))
  }
  return Object.keys(out).length > 0 ? out : null
}

type FlatSelectionIdKey = 'selectedServiceIds' | 'selectedTimeIds' | 'selectedEventIds'
type FlatSelectionQtyKey = 'serviceQuantities' | 'timeQuantities' | 'eventQuantities'

function mergeFlatIdArrayFromPatch(
  next: AppointmentSelectionFlatFields,
  patch: Record<string, unknown>,
  key: FlatSelectionIdKey
): void {
  if (!(key in patch)) return
  const arr = coerceIdArray(patch[key])
  next[key] = arr.length > 0 ? arr : null
}

function mergeFlatQuantityMapFromPatch(
  next: AppointmentSelectionFlatFields,
  patch: Record<string, unknown>,
  key: FlatSelectionQtyKey
): void {
  if (!(key in patch)) return
  next[key] = coerceQuantityMap(patch[key])
}

/** Build line rows for bulkCreate from request-style body (create/patch). */
export function flatSelectionBodyToLineCreates(
  appointmentId: string,
  body: Record<string, unknown>
): Array<{
  appointmentId: string
  lineKind: AppointmentSelectionLineKind
  sortOrder: number
  blockInstanceId: string
  quantity: number
  snapshotVersionId: null
}> {
  const rows: Array<{
    appointmentId: string
    lineKind: AppointmentSelectionLineKind
    sortOrder: number
    blockInstanceId: string
    quantity: number
    snapshotVersionId: null
  }> = []

  const pushKind = (kind: AppointmentSelectionLineKind, idsKey: string, qtyKey: string): void => {
    const ids = coerceIdArray(body[idsKey])
    const qtyMap = coerceQuantityMap(body[qtyKey])
    ids.forEach((blockInstanceId, index) => {
      const fromMap = qtyMap?.[blockInstanceId]
      const quantity = fromMap !== undefined ? fromMap : 1
      rows.push({
        appointmentId,
        lineKind: kind,
        sortOrder: index,
        blockInstanceId,
        quantity,
        snapshotVersionId: null,
      })
    })
  }

  pushKind('service', 'selectedServiceIds', 'serviceQuantities')
  pushKind('time', 'selectedTimeIds', 'timeQuantities')
  pushKind('event', 'selectedEventIds', 'eventQuantities')

  return rows
}

export function mergeFlatSelectionPatch(
  existing: AppointmentSelectionFlatFields,
  patch: Record<string, unknown>
): AppointmentSelectionFlatFields {
  const next = { ...existing }
  mergeFlatIdArrayFromPatch(next, patch, 'selectedServiceIds')
  mergeFlatIdArrayFromPatch(next, patch, 'selectedTimeIds')
  mergeFlatIdArrayFromPatch(next, patch, 'selectedEventIds')
  mergeFlatQuantityMapFromPatch(next, patch, 'serviceQuantities')
  mergeFlatQuantityMapFromPatch(next, patch, 'timeQuantities')
  mergeFlatQuantityMapFromPatch(next, patch, 'eventQuantities')
  return next
}

export function bodyTouchesSelections(body: Record<string, unknown>): boolean {
  return APPOINTMENT_SELECTION_ATTRIBUTE_KEYS.some((k) => Object.prototype.hasOwnProperty.call(body, k))
}

export function stripSelectionFieldsFromPlainObject(obj: Record<string, unknown>): void {
  for (const k of APPOINTMENT_SELECTION_ATTRIBUTE_KEYS) {
    delete obj[k]
  }
}

export function flatSelectionFieldsToBody(fields: AppointmentSelectionFlatFields): Record<string, unknown> {
  return {
    selectedServiceIds: fields.selectedServiceIds,
    serviceQuantities: fields.serviceQuantities,
    selectedTimeIds: fields.selectedTimeIds,
    timeQuantities: fields.timeQuantities,
    selectedEventIds: fields.selectedEventIds,
    eventQuantities: fields.eventQuantities,
  }
}
