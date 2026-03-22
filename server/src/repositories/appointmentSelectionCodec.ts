/**
 * Map appointment_selection_lines <-> legacy flat API fields (arrays + quantity maps).
 */
import type { AppointmentSelectionLine, AppointmentSelectionLineKind } from '../db/models/booking/appointment_selection_line.js'

/** Keys persisted on child rows but exposed on appointment JSON for backward compatibility. */
export const APPOINTMENT_SELECTION_ATTRIBUTE_KEYS = [
  'selectedServiceIds',
  'serviceQuantities',
  'selectedPropertyIds',
  'propertyQuantities',
  'selectedOptionIds',
  'optionQuantities',
  'serviceSnapshotIds',
  'propertySnapshotIds',
  'optionSnapshotIds',
] as const

export type LegacyAppointmentSelectionFields = {
  selectedServiceIds: string[] | null
  serviceQuantities: Record<string, number> | null
  selectedPropertyIds: string[] | null
  propertyQuantities: Record<string, number> | null
  selectedOptionIds: string[] | null
  optionQuantities: Record<string, number> | null
  serviceSnapshotIds: string[] | null
  propertySnapshotIds: string[] | null
  optionSnapshotIds: string[] | null
}

export function emptyLegacySelectionFields(): LegacyAppointmentSelectionFields {
  return {
    selectedServiceIds: null,
    serviceQuantities: null,
    selectedPropertyIds: null,
    propertyQuantities: null,
    selectedOptionIds: null,
    optionQuantities: null,
    serviceSnapshotIds: null,
    propertySnapshotIds: null,
    optionSnapshotIds: null,
  }
}

function kindRank(k: AppointmentSelectionLineKind): number {
  if (k === 'service') return 0
  if (k === 'property') return 1
  return 2
}

function compareLines(a: AppointmentSelectionLine, b: AppointmentSelectionLine): number {
  const ra = kindRank(a.lineKind as AppointmentSelectionLineKind)
  const rb = kindRank(b.lineKind as AppointmentSelectionLineKind)
  if (ra !== rb) return ra - rb
  return a.sortOrder - b.sortOrder
}

export function linesToLegacyFields(lines: AppointmentSelectionLine[]): LegacyAppointmentSelectionFields {
  const sorted = [...lines].sort(compareLines)
  const byKind: Record<AppointmentSelectionLineKind, AppointmentSelectionLine[]> = {
    service: [],
    property: [],
    option: [],
  }
  for (const row of sorted) {
    const k = row.lineKind as AppointmentSelectionLineKind
    if (k === 'service' || k === 'property' || k === 'option') {
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
  const prop = pack('property')
  const opt = pack('option')

  return {
    selectedServiceIds: svc.ids,
    serviceQuantities: svc.quantities,
    serviceSnapshotIds: svc.snapshots,
    selectedPropertyIds: prop.ids,
    propertyQuantities: prop.quantities,
    propertySnapshotIds: prop.snapshots,
    selectedOptionIds: opt.ids,
    optionQuantities: opt.quantities,
    optionSnapshotIds: opt.snapshots,
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

/** Build line rows for bulkCreate from request-style body (create/patch). */
export function legacyBodyToLineCreates(
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
  pushKind('property', 'selectedPropertyIds', 'propertyQuantities')
  pushKind('option', 'selectedOptionIds', 'optionQuantities')

  return rows
}

export function mergeLegacySelectionPatch(
  existing: LegacyAppointmentSelectionFields,
  patch: Record<string, unknown>
): LegacyAppointmentSelectionFields {
  const next = { ...existing }
  if ('selectedServiceIds' in patch) {
    next.selectedServiceIds = coerceIdArray(patch.selectedServiceIds).length > 0 ? coerceIdArray(patch.selectedServiceIds) : null
  }
  if ('serviceQuantities' in patch) {
    next.serviceQuantities = coerceQuantityMap(patch.serviceQuantities)
  }
  if ('selectedPropertyIds' in patch) {
    next.selectedPropertyIds = coerceIdArray(patch.selectedPropertyIds).length > 0 ? coerceIdArray(patch.selectedPropertyIds) : null
  }
  if ('propertyQuantities' in patch) {
    next.propertyQuantities = coerceQuantityMap(patch.propertyQuantities)
  }
  if ('selectedOptionIds' in patch) {
    next.selectedOptionIds = coerceIdArray(patch.selectedOptionIds).length > 0 ? coerceIdArray(patch.selectedOptionIds) : null
  }
  if ('optionQuantities' in patch) {
    next.optionQuantities = coerceQuantityMap(patch.optionQuantities)
  }
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

export function legacyFieldsToBody(legacy: LegacyAppointmentSelectionFields): Record<string, unknown> {
  return {
    selectedServiceIds: legacy.selectedServiceIds,
    serviceQuantities: legacy.serviceQuantities,
    selectedPropertyIds: legacy.selectedPropertyIds,
    propertyQuantities: legacy.propertyQuantities,
    selectedOptionIds: legacy.selectedOptionIds,
    optionQuantities: legacy.optionQuantities,
  }
}
