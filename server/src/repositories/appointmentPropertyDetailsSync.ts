import type { Transaction } from 'sequelize'
import { PropertyDetails } from '../config/app.js'
import { findOrCreateAddress, getPropertyDetailsFromVersion, getPropertyWithAssociations } from '../routes/internal/properties/propertyHelpers.js'
import { DEFAULT_VALUES, PATCH_PROPERTY_FIELD_KEY } from '../routes/internal/properties/propertyConstants.js'

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

async function syncAddressFromWizardBlobIfComplete(
  propertyVersion: Awaited<ReturnType<typeof getPropertyWithAssociations>>,
  b: Record<string, unknown>,
  transaction?: Transaction
): Promise<void> {
  if (!propertyVersion) return

  const street = strOrNull(b.address)
  const city = strOrNull(b.city)
  const state = strOrNull(b.state)
  const zipCode = strOrNull(b.zipCode)
  if (!street || !city || !state || !zipCode) {
    return
  }

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

function buildPropertyDetailsPatchFromWizardBlob(b: Record<string, unknown>): {
  mlsNumber?: string | null
  squareFootage?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits?: number | null
} {
  const sq = numOrNull(b.squareFootage) ?? numOrNull(b.propertySize)
  const patch: {
    mlsNumber?: string | null
    squareFootage?: number | null
    bedrooms?: number | null
    bathrooms?: number | null
    foundationAccess?: 'basement' | 'crawlspace' | 'slab' | null
    additionalUnits?: number | null
  } = {}
  const PK = PATCH_PROPERTY_FIELD_KEY
  if (PK.MLS_NUMBER in b) patch.mlsNumber = strOrNull(b.mlsNumber)
  if (PK.SQUARE_FOOTAGE in b || 'propertySize' in b) patch.squareFootage = sq
  if (PK.BEDROOMS in b) patch.bedrooms = numOrNull(b.bedrooms)
  if (PK.BATHROOMS in b) patch.bathrooms = numOrNull(b.bathrooms)
  if (PK.FOUNDATION_ACCESS in b) patch.foundationAccess = foundationOrNull(b.foundationAccess)
  if (PK.ADDITIONAL_UNITS in b) patch.additionalUnits = numOrNull(b.additionalUnits)
  if ('numberOfUnits' in b && !(PK.ADDITIONAL_UNITS in b)) patch.additionalUnits = numOrNull(b.numberOfUnits)
  return patch
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

  await syncAddressFromWizardBlobIfComplete(propertyVersion, b, transaction)

  const details = getPropertyDetailsFromVersion(propertyVersion)
  const patch = buildPropertyDetailsPatchFromWizardBlob(b)

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
