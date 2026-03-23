/**
 * Pure JSON shaping for appointment `propertyDetails` (no Sequelize / config/app).
 * WHY: Keeps db model imports out of the config/models cycle.
 */

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

function strOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s.length > 0 ? s : null
}

function asRecordOrNull(raw: unknown): Record<string, unknown> | null {
  return raw !== null && typeof raw === 'object' ? (raw as Record<string, unknown>) : null
}

function emptyAddressOutputShape(): Record<string, unknown> {
  return {
    address: null,
    unit: null,
    city: null,
    state: null,
    zipCode: null,
    placeId: null,
    latitude: null,
    longitude: null,
  }
}

function fillAddressOutputFromRecord(addr: Record<string, unknown>, out: Record<string, unknown>): void {
  out.address = strOrNull(addr.address ?? addr.streetAddress)
  out.unit = strOrNull(addr.unit)
  out.city = strOrNull(addr.city)
  out.state = strOrNull(addr.state)
  out.zipCode = strOrNull(addr.zipCode ?? addr.zip_code)
  out.placeId = strOrNull(addr.placeId ?? addr.place_id)
  out.latitude = numOrNull(addr.latitude)
  out.longitude = numOrNull(addr.longitude)
}

function applyPropertyDetailSlice(out: Record<string, unknown>, det: Record<string, unknown>): void {
  out.mlsNumber = det.mlsNumber ?? null
  out.squareFootage = det.squareFootage ?? null
  out.bedrooms = det.bedrooms ?? null
  out.bathrooms = det.bathrooms ?? null
  out.foundationAccess = det.foundationAccess ?? null
  out.additionalUnits = det.additionalUnits ?? null
  out.propertySize = det.squareFootage ?? null
  out.numberOfUnits = det.additionalUnits ?? null
}

function outputHasAnyMeaningfulField(out: Record<string, unknown>): boolean {
  return Object.values(out).some((v) => v !== null && v !== undefined && v !== '')
}

/** Build legacy `propertyDetails` object for appointment JSON from nested propertyVersion (with address + propertyDetails). */
export function propertyDetailsApiShapeFromPropertyVersionJson(propertyVersion: unknown): Record<string, unknown> | null {
  if (propertyVersion === null || propertyVersion === undefined) return null
  if (typeof propertyVersion !== 'object') return null
  const pv = propertyVersion as Record<string, unknown>
  const addr = asRecordOrNull(pv.address)
  const detRaw = pv.propertyDetails
  const detSingle = Array.isArray(detRaw) ? detRaw[0] : detRaw
  const det = asRecordOrNull(detSingle)

  if (!addr && !det) return null

  const out = emptyAddressOutputShape()
  if (addr) {
    fillAddressOutputFromRecord(addr, out)
  }
  if (det) {
    applyPropertyDetailSlice(out, det)
  }

  return outputHasAnyMeaningfulField(out) ? out : null
}

export function stripPropertyDetailsFromPlainObject(obj: Record<string, unknown>): void {
  delete obj.propertyDetails
}
