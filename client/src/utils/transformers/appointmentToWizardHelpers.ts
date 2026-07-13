/**
 * WHY: Appointment to Wizard Transformer Helpers

WHY: Reduces duplication and ...
 */
import type { BookingBlockInstance, BookingPartInstance } from './globalToBookingTransformer'
import type { BookingData } from './globalToBookingTransformer'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import { DEFAULT_WIZARD_PLACEMENT } from '@shared/constants/wizardPlacement'
import { findById, findByIds } from './transformerCollections'
import { getBlockShapeIdByType } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { Logger } from '@/utils/logger'
import { asEmptyArray } from '@/utils/safeDefaults'
import { safeString, safeNumber, extractOptionalString } from './transformerPrimitives'
import type { AppointmentVersionsResponse, VersionBlockInstance } from '@/types/transformers/appointmentToWizardHelpers'

export type { AppointmentVersionsResponse } from '@/types/transformers/appointmentToWizardHelpers'

function findBlockInstanceByIdCore(
  bookingData: BookingData,
  id: string | null | undefined
): BookingBlockInstance | null {
  if (!id || !bookingData) return null
  return findById(bookingData.blockInstances, id)
}

export function findBlockInstanceById(
  bookingData: BookingData,
  id: string | null | undefined
): BookingBlockInstance | null {
  return findBlockInstanceByIdCore(bookingData, id)
}

function findBlockInstancesByIds(
  bookingData: BookingData,
  ids: string[] | null | undefined
): BookingBlockInstance[] {
  if (!ids || !bookingData || ids.length === 0) return []
  return findByIds(bookingData.blockInstances, ids)
}

function transformVersionToBookingInstance(
  version: VersionBlockInstance,
  currentInstance: BookingBlockInstance | null,
  bookingData: BookingData
): BookingBlockInstance {
  // FIX: bookingData parameter is kept for API consistency but not currently used in this function
  void bookingData
  const base: Partial<BookingBlockInstance> = currentInstance ?? {
    id: version.id,
    entityKey: 'blockInstance' as const,
    active: true,
    orchestrator: DEFAULT_VALUES.ORCHESTRATOR,
    wizardPlacement: DEFAULT_WIZARD_PLACEMENT,
    preClosing: false,
    orderIndex: 0,
    blockShape: '',
    blockShapeRef: '',
    activeBlockIds: [],
    partInstances: [],
    requiresUnitNumber: null,
    icon: '',
    allowMultiple: false,
    isMultiFamily: false,
    requiresAgent: false,
  }

  const partInstances: BookingPartInstance[] = version.partInstances.map(pi => {
    const currentPart = currentInstance?.partInstances.find(p => p.id === pi.id)
    const part = {
      id: pi.id,
      entityKey: 'partInstance' as const,
      name: safeString(pi.name, 'VersionBlockInstance.partInstances.name'),
      baseFee: pi.baseFee,
      baseTime: pi.baseTime,
      feePerUnit: pi.feePerUnit,
      timePerUnit: pi.timePerUnit,
      active: currentPart?.active ?? true,
      orderIndex: safeNumber(currentPart?.orderIndex, 'VersionBlockInstance.partInstances.orderIndex'),
      partShape: safeString(currentPart?.partShape, 'VersionBlockInstance.partInstances.partShape'),
      zeroOutPart: currentPart?.zeroOutPart ?? false,
      activePartIds: asEmptyArray(currentPart?.activePartIds),
    }
    const percentageOff = (pi as BookingPartInstance).percentageOff ?? currentPart?.percentageOff
    return { ...part, ...(percentageOff !== undefined && percentageOff !== null && { percentageOff }) } as BookingPartInstance
  })

  return {
    ...base,
    id: version.id,
    name: version.name,
    icon: safeString(version.icon, 'VersionBlockInstance.icon'),
    orchestrator: currentInstance?.orchestrator ?? DEFAULT_VALUES.ORCHESTRATOR,
    wizardPlacement: currentInstance?.wizardPlacement ?? DEFAULT_WIZARD_PLACEMENT,
    partInstances,
  } as BookingBlockInstance
}

function getCategoryDisplayName(categoryKey: 'services' | 'properties' | 'options' | 'lineItems'): string {
  if (categoryKey === 'services') return 'service'
  if (categoryKey === 'properties') return 'property type block'
  if (categoryKey === 'options') return 'availability option'
  return 'line item'
}

function logMissingAndWrongShapeIds(
  params: {
    ids: string[]
    found: BookingBlockInstance[]
    bookingData: BookingData
    blockShapeId: string | null
    categoryKey: 'services' | 'properties' | 'options' | 'lineItems'
    logger: Logger
  }
): void {
  const { ids, found, bookingData, blockShapeId, categoryKey, logger } = params
  if (ids.length === 0 || found.length === ids.length) return

  const foundIds = new Set(found.map(instance => instance.id))
  const missingIds = ids.filter(id => !foundIds.has(id))
  const categoryName = categoryKey === 'lineItems' ? 'line item' : getCategoryDisplayName(categoryKey)
  if (missingIds.length > 0) {
    logger.warn(`[AppointmentTransformer] Some ${categoryName} IDs not found: ${missingIds.join(', ')}`)
  }

  if (!blockShapeId || (categoryKey !== 'services' && categoryKey !== 'properties') || found.length >= ids.length) {
    return
  }
  const wrongShapeIds = ids.filter(id => {
    const instance = findBlockInstanceByIdCore(bookingData, id)
    return instance !== null && instance.blockShapeRef !== blockShapeId
  })
  if (wrongShapeIds.length > 0) {
    const shapeName = categoryKey === 'services' ? 'service' : 'property type block'
    logger.warn(`[AppointmentTransformer] Some ${shapeName} IDs have wrong block shape: ${wrongShapeIds.join(', ')}`)
  }
}

export function resolveBlockCategory(params: {
  ids: string[]
  bookingData: BookingData
  blockShapeType?: keyof typeof BLOCK_SHAPE_TYPES // Optional - not used for lineItems
  versionsData: AppointmentVersionsResponse | null
  categoryKey: 'services' | 'properties' | 'options' | 'lineItems'
  logger: Logger
  lineItemBlocks?: BookingBlockInstance[] // Only for lineItems category
}): BookingBlockInstance[] {
  const { ids, bookingData, blockShapeType, versionsData, categoryKey, logger, lineItemBlocks } = params

  if (categoryKey === 'lineItems' && lineItemBlocks) {
    const found = ids.length > 0 ? lineItemBlocks.filter(block => ids.includes(block.id)) : []
    logMissingAndWrongShapeIds({
      ids,
      found,
      bookingData,
      blockShapeId: null,
      categoryKey,
      logger,
    })
    const lineVersions = versionsData?.lineItems
    if (lineVersions && lineVersions.length > 0) {
      return lineVersions.map(version => {
        const currentInstance = found.find(li => li.id === version.id) ?? null
        return transformVersionToBookingInstance(version, currentInstance, bookingData)
      })
    }
    return found
  }

  const blockShapeId = blockShapeType ? getBlockShapeIdByType(bookingData, BLOCK_SHAPE_TYPES[blockShapeType]) : null
  const allFound = findBlockInstancesByIds(bookingData, ids)
  const found = blockShapeId
    ? allFound.filter(instance => instance.blockShapeRef === blockShapeId)
    : allFound

  logMissingAndWrongShapeIds({
    ids,
    found,
    bookingData,
    blockShapeId,
    categoryKey,
    logger,
  })

  const versions = versionsData?.[categoryKey]
  if (versions && versions.length > 0) {
    return versions.map(version => {
      const currentInstance = found.find(instance => instance.id === version.id) ?? null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  }

  return found
}


const PROPERTY_DETAILS_CONTEXT = 'propertyDetails'

function extractFoundationAccess(value: unknown): 'basement' | 'crawlspace' | 'slab' | null {
  if (typeof value === 'string' && (value === 'basement' || value === 'crawlspace' || value === 'slab')) {
    return value
  }
  return null
}

export function extractAddressFields(address: unknown): {
  address: string
  unit: string
  city: string
  state: string
  zipCode: string
} {
  const addr = address != null && typeof address === 'object' ? address as Record<string, unknown> : undefined
  return {
    address: extractOptionalString(addr?.address, `${PROPERTY_DETAILS_CONTEXT}.address`),
    // WHY: unit is a known-optional DB field (allowNull: true) — null is the expected "no value" state, not a data quality issue
    unit: typeof addr?.unit === 'string' ? addr.unit : '',
    city: extractOptionalString(addr?.city, `${PROPERTY_DETAILS_CONTEXT}.city`),
    state: extractOptionalString(addr?.state, `${PROPERTY_DETAILS_CONTEXT}.state`),
    zipCode: extractOptionalString(addr?.zipCode, `${PROPERTY_DETAILS_CONTEXT}.zipCode`),
  }
}

interface AddressWithGeo {
  placeId?: string
  latitude?: number
  longitude?: number
}

function isAddressWithGeo(v: unknown): v is AddressWithGeo {
  return v != null && typeof v === 'object'
}

export function extractLocationData(address: unknown): {
  candidatePlaceId: string | undefined
  candidateCoordinates: { lat: number; lng: number } | undefined
} {
  const addressWithGeo = address != null && isAddressWithGeo(address) ? address : undefined
  const candidatePlaceId =
    typeof addressWithGeo?.placeId === 'string' ? addressWithGeo.placeId : undefined
  const candidateCoordinates =
    addressWithGeo?.latitude != null && addressWithGeo?.longitude != null
      ? { lat: Number(addressWithGeo.latitude), lng: Number(addressWithGeo.longitude) }
      : undefined
  return { candidatePlaceId, candidateCoordinates }
}

export function extractPropertyDetailsFields(propertyDetailsRecord: unknown): {
  propertySize: number | null
  numberOfUnits: number | null
  mlsNumber: string
  squareFootage: number | null
  bedrooms: number | null
  bathrooms: number | null
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null
  additionalUnits: number | null
} {
  const rec = propertyDetailsRecord != null && typeof propertyDetailsRecord === 'object'
    ? propertyDetailsRecord as Record<string, unknown>
    : undefined
  return {
    propertySize: rec?.squareFootage != null ? Number(rec.squareFootage) : null,
    numberOfUnits: rec?.additionalUnits != null ? Number(rec.additionalUnits) : null,
    mlsNumber: typeof rec?.mlsNumber === 'string' ? rec.mlsNumber : '',
    squareFootage: rec?.squareFootage != null ? Number(rec.squareFootage) : null,
    bedrooms: rec?.bedrooms != null ? Number(rec.bedrooms) : null,
    bathrooms: rec?.bathrooms != null ? Number(rec.bathrooms) : null,
    foundationAccess: extractFoundationAccess(rec?.foundationAccess),
    additionalUnits: rec?.additionalUnits != null ? Number(rec.additionalUnits) : null,
  }
}
