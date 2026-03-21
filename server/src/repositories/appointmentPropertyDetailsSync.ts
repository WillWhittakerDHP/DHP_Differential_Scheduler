import type { Transaction } from 'sequelize'
import { PropertyDetails } from '../config/app.js'
import { findOrCreateAddress, getPropertyDetailsFromVersion, getPropertyWithAssociations } from '../routes/internal/properties/propertyHelpers.js'
import { DEFAULT_VALUES } from '../routes/internal/properties/propertyConstants.js'

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

function foundationOrNull(v: unknown): 'basement' | 'crawlspace' | 'slab' | null {
  if (v !== 'basement' && v !== 'crawlspace' && v !== 'slab') return null
  return v
}

/**
 * Policy A: wizard `propertyDetails` updates PropertyDetails + Address for the appointment's property version.
 */
export async function syncPropertyDetailsFromWizardBlob(
  propertyVersionId: string,
  raw: unknown,
  transaction?: Transaction
): Promise<void> {
  if (raw === null || raw === undefined) return
  if (typeof raw !== 'object') return
  const b = raw as Record<string, unknown>

  const propertyVersion = await getPropertyWithAssociations(propertyVersionId, transaction)
  if (!propertyVersion) return

  const street = strOrNull(b.address)
  const city = strOrNull(b.city)
  const state = strOrNull(b.state)
  const zipCode = strOrNull(b.zipCode)
  if (street && city && state && zipCode) {
    const addressRecord = await findOrCreateAddress({
      address: street,
      unit: strOrNull(b.unit),
      city,
      state,
      zipCode,
      placeId: strOrNull(b.placeId),
      latitude: numOrNull(b.latitude) ?? numOrNull((b.candidateCoordinates as { lat?: unknown } | undefined)?.lat),
      longitude: numOrNull(b.longitude) ?? numOrNull((b.candidateCoordinates as { lng?: unknown } | undefined)?.lng),
    })
    if (propertyVersion.addressId !== addressRecord.id) {
      await propertyVersion.update({ addressId: addressRecord.id }, { transaction })
    }
  }

  const details = getPropertyDetailsFromVersion(propertyVersion)
  const sq = numOrNull(b.squareFootage) ?? numOrNull(b.propertySize)
  const patch: {
    mlsNumber?: string | null
    squareFootage?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
    foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null
    additionalUnits?: number | null
  } = {}
  if ('mlsNumber' in b) patch.mlsNumber = strOrNull(b.mlsNumber)
  if ('squareFootage' in b || 'propertySize' in b) patch.squareFootage = sq
  if ('bedrooms' in b) patch.bedrooms = numOrNull(b.bedrooms)
  if ('bathrooms' in b) patch.bathrooms = numOrNull(b.bathrooms)
  if ('foundationAccess' in b) patch.foundationAccess = foundationOrNull(b.foundationAccess)
  if ('additionalUnits' in b) patch.additionalUnits = numOrNull(b.additionalUnits)
  if ('numberOfUnits' in b && !('additionalUnits' in b)) patch.additionalUnits = numOrNull(b.numberOfUnits)

  if (Object.keys(patch).length === 0) return

  if (details) {
    await details.update(patch, { transaction })
    return
  }

  await PropertyDetails.create(
    {
      propertyVersionId,
      source: DEFAULT_VALUES.SOURCE,
      mlsNumber: patch.mlsNumber ?? null,
      squareFootage: patch.squareFootage ?? null,
      bedrooms: patch.bedrooms ?? null,
      bathrooms: patch.bathrooms ?? null,
      foundationAccess: patch.foundationAccess ?? null,
      additionalUnits: patch.additionalUnits ?? null,
    },
    { transaction }
  )
}

/** Build legacy `propertyDetails` object for appointment JSON from nested propertyVersion (with address + propertyDetails). */
export function propertyDetailsApiShapeFromPropertyVersionJson(propertyVersion: unknown): Record<string, unknown> | null {
  if (propertyVersion === null || propertyVersion === undefined) return null
  if (typeof propertyVersion !== 'object') return null
  const pv = propertyVersion as Record<string, unknown>
  const addrRaw = pv.address
  const addr = addrRaw !== null && typeof addrRaw === 'object' ? (addrRaw as Record<string, unknown>) : null
  const detRaw = pv.propertyDetails
  const detSingle = Array.isArray(detRaw) ? detRaw[0] : detRaw
  const det = detSingle !== null && typeof detSingle === 'object' ? (detSingle as Record<string, unknown>) : null

  if (!addr && !det) return null

  const street = addr ? strOrNull(addr.address ?? addr.streetAddress) : null
  const out: Record<string, unknown> = {
    address: street,
    unit: addr ? strOrNull(addr.unit) : null,
    city: addr ? strOrNull(addr.city) : null,
    state: addr ? strOrNull(addr.state) : null,
    zipCode: addr ? strOrNull(addr.zipCode ?? addr.zip_code) : null,
    placeId: addr ? strOrNull(addr.placeId ?? addr.place_id) : null,
    latitude: addr ? numOrNull(addr.latitude) : null,
    longitude: addr ? numOrNull(addr.longitude) : null,
  }

  if (det) {
    out.mlsNumber = det.mlsNumber ?? null
    out.squareFootage = det.squareFootage ?? null
    out.bedrooms = det.bedrooms ?? null
    out.bathrooms = det.bathrooms ?? null
    out.foundationAccess = det.foundationAccess ?? null
    out.additionalUnits = det.additionalUnits ?? null
    out.propertySize = det.squareFootage ?? null
    out.numberOfUnits = det.additionalUnits ?? null
  }

  const hasAny = Object.values(out).some((v) => v !== null && v !== undefined && v !== '')
  return hasAny ? out : null
}

export function stripPropertyDetailsFromPlainObject(obj: Record<string, unknown>): void {
  delete obj.propertyDetails
}
