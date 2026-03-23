
import type { PropertyDetailsBase } from '../../../shared/types/propertyTypes.js'
import type { BrightMlsPropertyResponse } from '../types/brightMls.js'
import type { PropertyFieldMapping } from '../db/models/mappings/property_field_mapping.js'
import { mapFoundationType } from '../config/brightMlsFoundationMapping.js'
import { PATCH_PROPERTY_FIELD_KEY } from '../routes/internal/properties/propertyConstants.js'
import { asEmptyString } from '../utils/safeDefaults.js'

/** TYPE_SIMILARITY: Extend shared PropertyDetailsBase as single source of truth. */
type PartialPropertyDetails = PropertyDetailsBase

function mapMlsNumberFromBright(response: BrightMlsPropertyResponse): string | null {
  let mls = response.ListingId ?? response.ListingKey ?? null
  if (mls && typeof mls !== 'string') {
    mls = String(mls)
  }
  return mls
}

function mapSquareFootageFromBright(response: BrightMlsPropertyResponse): number | null {
  const living = response.LivingArea ?? null
  const above = response.AboveGradeFinishedArea ?? null
  const below = response.BelowGradeFinishedArea ?? null
  if (living != null && typeof living === 'number') {
    return Math.round(living)
  }
  if (above != null || below != null) {
    const sum = (Number(above) || 0) + (Number(below) || 0)
    return sum > 0 ? Math.round(sum) : null
  }
  return null
}

function mapBathroomsFromBright(response: BrightMlsPropertyResponse): number | null {
  const full = response.BathroomsFull ?? 0
  const half = response.BathroomsHalf ?? 0
  const baths = Number(full) + Number(half) * 0.5
  return baths > 0 ? Math.round(baths * 100) / 100 : null
}

function mapAdditionalUnitsFromBright(response: BrightMlsPropertyResponse): number | null {
  const unitTypes = toArray(response.UnitTypes)
  const otherStructs = toArray(response.OtherStructures)
  const aduKeywords = ['adu', 'accessory', 'in-law', 'guest', 'unit']
  const hasAdu = [...unitTypes, ...otherStructs].some((s) =>
    aduKeywords.some((k) => s.toLowerCase().includes(k))
  )
  return hasAdu ? 1 : unitTypes.length > 0 ? unitTypes.length : null
}

function applyActiveFieldMappings(
  result: PartialPropertyDetails,
  response: BrightMlsPropertyResponse,
  mappings: PropertyFieldMapping[]
): void {
  for (const m of mappings) {
    if (!m.active) continue

    const raw = getSourceValue(response, m.sourceField)
    let mapped: string | number | null = null

    if (m.valueMapping && typeof m.valueMapping === 'object') {
      const key = String(asEmptyString(raw as string | null | undefined)).toLowerCase().trim()
      const vm = m.valueMapping as Record<string, string | number>
      mapped = key in vm ? vm[key] : (m.fallbackValue ?? null)
    } else {
      mapped = m.fallbackValue ?? raw
    }

    if (m.targetField === PATCH_PROPERTY_FIELD_KEY.FOUNDATION_ACCESS) {
      result.foundationAccess = mapped as 'basement' | 'crawlspace' | 'slab' | null
    } else if (m.targetField === PATCH_PROPERTY_FIELD_KEY.ADDITIONAL_UNITS) {
      result.additionalUnits = mapped != null ? Math.round(Number(mapped)) : null
    }
  }
}

export function mapFieldsToModel(
  response: BrightMlsPropertyResponse,
  mappings: PropertyFieldMapping[]
): PartialPropertyDetails {
  const result: PartialPropertyDetails = {}

  result.mlsNumber = mapMlsNumberFromBright(response)
  result.squareFootage = mapSquareFootageFromBright(response)
  result.bedrooms =
    response.BedroomsTotal != null ? Math.round(Number(response.BedroomsTotal)) : null
  result.bathrooms = mapBathroomsFromBright(response)
  result.foundationAccess = mapFoundationType(response.FoundationDetails)
  result.additionalUnits = mapAdditionalUnitsFromBright(response)

  applyActiveFieldMappings(result, response, mappings)

  return result
}

function getSourceValue(
  response: BrightMlsPropertyResponse,
  sourceField: string
): string | number | null {
  const val = (response as Record<string, unknown>)[sourceField]
  if (Array.isArray(val)) {
    const first = val.length > 0 ? val[0] : null
    return typeof first === 'string' || typeof first === 'number' ? first : null
  }
  return typeof val === 'string' || typeof val === 'number' ? val : null
}

function toArray(value: string[] | string | null | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}
