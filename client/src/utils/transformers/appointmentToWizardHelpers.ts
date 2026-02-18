/**
 * Appointment to Wizard Transformer Helpers
 * 
 * LEARNING: Reusable helper functions extracted from appointmentToWizardTransformer
 * WHY: Reduces duplication and complexity in the main transformer
 * PATTERN: Pure functions for block resolution and version transformation
 */

import type { BookingBlockInstance, BookingPartInstance } from './globalToBookingTransformer'
import type { BookingData } from './globalToBookingTransformer'
import type { TernaryBoolean } from '@/types/ternary'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import { findById, findByIds } from './transformerCollections'
import { getBlockShapeIdByType } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { Logger } from '@/utils/logger'
import { safeString, safeNumber, convertToTernaryBoolean } from './transformerPrimitives'

/**
 * Version data structure from API
 * LEARNING: Matches server-side version format
 */
interface VersionBlockInstance {
  id: string // blockInstanceId
  name: string
  icon: string
  baseSqFt: number
  allowMultiple: boolean
  // @audit-allow:deprecation:legacy-keyword - Intentional backward compatibility for boolean | TernaryBoolean
  differential: boolean | TernaryBoolean // LEARNING: May be boolean (legacy) or TernaryBoolean
  partInstances: Array<{
    id: string // partInstanceId
    name: string
    baseFee: number
    baseTime: number
    rateOverBaseFee: number
    rateOverBaseTime: number
    // @audit-allow:deprecation:legacy-keyword - Intentional backward compatibility for boolean | TernaryBoolean
    onSite?: boolean | TernaryBoolean // LEARNING: May be boolean (legacy) or TernaryBoolean
    // @audit-allow:deprecation:legacy-keyword - Intentional backward compatibility for boolean | TernaryBoolean
    clientPresent?: boolean | TernaryBoolean // LEARNING: May be boolean (legacy) or TernaryBoolean
  }>
}

export interface AppointmentVersionsResponse {
  services: VersionBlockInstance[]
  properties: VersionBlockInstance[]
  options: VersionBlockInstance[]
  lineItems?: VersionBlockInstance[]
}

/**
 * Find block instance by ID in scheduler data
 * LEARNING: Helper to find block instance from scheduler data
 * WHY: Maps appointment IDs to BookingBlockInstance objects
 * PATTERN: Search through blockInstances array
 */
export function findBlockInstanceById(
  bookingData: BookingData,
  id: string | null | undefined
): BookingBlockInstance | null {
  if (!id || !bookingData) return null
  return findById(bookingData.blockInstances, id)
}

/**
 * Find multiple block instances by IDs
 * LEARNING: Helper to find multiple block instances
 * WHY: Maps array of IDs to array of BookingBlockInstance objects
 * PATTERN: Filter blockInstances array by IDs
 */
function findBlockInstancesByIds(
  bookingData: BookingData,
  ids: string[] | null | undefined
): BookingBlockInstance[] {
  if (!ids || !bookingData || ids.length === 0) return []
  return findByIds(bookingData.blockInstances, ids)
}

/**
 * Transform version data to BookingBlockInstance format
 * LEARNING: Versions are complete immutable records, but need metadata from current instance
 * WHY: Versions contain versioned fields, but BookingBlockInstance needs additional metadata
 * PATTERN: Merge version data with current instance metadata
 */
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
    bookingMode: DEFAULT_VALUES.BOOKING_MODE,
    orderIndex: 0,
    blockShape: '',
    blockShapeRef: '',
    activeBlockIds: [],
    partInstances: [],
    requiresUnitNumber: null,
  }

  const partInstances: BookingPartInstance[] = version.partInstances.map(pi => {
    const currentPart = currentInstance?.partInstances.find(p => p.id === pi.id)
    return {
      id: pi.id,
      entityKey: 'partInstance' as const,
      name: safeString(pi.name, 'VersionBlockInstance.partInstances.name'),
      baseFee: pi.baseFee,
      baseTime: pi.baseTime,
      rateOverBaseFee: pi.rateOverBaseFee,
      rateOverBaseTime: pi.rateOverBaseTime,
      active: currentPart?.active ?? true,
      orderIndex: safeNumber(currentPart?.orderIndex, 'VersionBlockInstance.partInstances.orderIndex'),
      partShape: safeString(currentPart?.partShape, 'VersionBlockInstance.partInstances.partShape'),
      zeroOutPart: currentPart?.zeroOutPart ?? false,
      activePartIds: currentPart?.activePartIds ?? [],
    }
  })

  return {
    ...base,
    id: version.id,
    name: version.name,
    icon: safeString(version.icon, 'VersionBlockInstance.icon'),
    baseSqFt: safeNumber(version.baseSqFt, 'VersionBlockInstance.baseSqFt'),
    allowMultiple: version.allowMultiple,
    // LEARNING: Convert boolean to TernaryBoolean for differential
    differential: convertToTernaryBoolean(version.differential, 'false'),
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
    const instance = findBlockInstanceById(bookingData, id)
    return instance !== null && instance.blockShapeRef !== blockShapeId
  })
  if (wrongShapeIds.length > 0) {
    const shapeName = categoryKey === 'services' ? 'service' : 'property type block'
    logger.warn(`[AppointmentTransformer] Some ${shapeName} IDs have wrong block shape: ${wrongShapeIds.join(', ')}`)
  }
}

/**
 * Resolve block category (services, properties, options, or line items)
 * LEARNING: Generic function replacing 4 duplicated block-resolution sections
 * WHY: Eliminates duplication and reduces complexity in main transformer
 * PATTERN: Find instances by IDs, filter by shape, log missing/wrong shape, apply versions
 */
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

  // Special handling for line items (they come from bookingData.lineItemBlocks, not blockInstances)
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

  // Standard handling for services, properties, and options
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
