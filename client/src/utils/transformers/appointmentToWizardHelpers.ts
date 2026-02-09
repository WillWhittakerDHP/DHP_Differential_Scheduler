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
import { findById } from '@/utils/collections/findById'
import { getBlockShapeIdByType } from '@/utils/blockInstanceUtils'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import type { Logger } from '@/utils/logger'

/**
 * Version data structure from API
 * LEARNING: Matches server-side version format
 */
export interface VersionBlockInstance {
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
  
  const blockInstance = findById(bookingData.blockInstances, id) ?? null
  return blockInstance
}

/**
 * Find multiple block instances by IDs
 * LEARNING: Helper to find multiple block instances
 * WHY: Maps array of IDs to array of BookingBlockInstance objects
 * PATTERN: Filter blockInstances array by IDs
 */
export function findBlockInstancesByIds(
  bookingData: BookingData,
  ids: string[] | null | undefined
): BookingBlockInstance[] {
  if (!ids || !bookingData || ids.length === 0) return []
  
  const requestedIds = new Set(ids.map((id) => String(id)))
  const found = bookingData.blockInstances.filter((bi) => requestedIds.has(String(bi.id)))

  return found
}

/**
 * Convert boolean or TernaryBoolean to TernaryBoolean
 * LEARNING: Backward compatibility converter for legacy boolean values
 * WHY: Versions may contain boolean (legacy) or TernaryBoolean (current)
 * PATTERN: Convert boolean to TernaryBoolean, default to 'false'
 * @audit-allow:deprecation:legacy-keyword - Intentional backward compatibility converter
 */
export function convertToTernary(
  value: TernaryBoolean | boolean | undefined,
  defaultValue: TernaryBoolean = 'false'
): TernaryBoolean {
  if (value === true) return 'true'
  if (value === false) return 'false'
  if (value === 'true' || value === 'false' || value === 'override') return value
  return defaultValue
}

/**
 * Transform version data to BookingBlockInstance format
 * LEARNING: Versions are complete immutable records, but need metadata from current instance
 * WHY: Versions contain versioned fields, but BookingBlockInstance needs additional metadata
 * PATTERN: Merge version data with current instance metadata
 */
export function transformVersionToBookingInstance(
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
    bookingMode: 'standalone',
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
      name: pi.name ?? '',
      baseFee: pi.baseFee,
      baseTime: pi.baseTime,
      rateOverBaseFee: pi.rateOverBaseFee,
      rateOverBaseTime: pi.rateOverBaseTime,
      // PATTERN: Events should be accessed via EventAssignment relationships instead
      active: currentPart?.active ?? true,
      orderIndex: currentPart?.orderIndex ?? 0,
      partShape: currentPart?.partShape ?? '',
      disabled: false, // BookingPartInstance requires disabled field
      zeroOutPart: currentPart?.zeroOutPart ?? false, // BookingPartInstance requires zeroOutPart field
    }
  })

  return {
    ...base,
    id: version.id,
    name: version.name,
    icon: version.icon ?? '',
    baseSqFt: version.baseSqFt ?? 0,
    allowMultiple: version.allowMultiple,
    // LEARNING: Convert boolean to TernaryBoolean for differential
    differential: convertToTernary(version.differential, 'false'),
    partInstances,
  } as BookingBlockInstance
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
    const found = ids.length > 0
      ? lineItemBlocks.filter(block => ids.includes(block.id))
      : []

    if (ids.length > 0 && found.length !== ids.length) {
      const foundIds = new Set(found.map(li => li.id))
      const missingIds = ids.filter(id => !foundIds.has(id))
      if (missingIds.length > 0) {
        logger.warn(`[AppointmentTransformer] Some line item IDs not found: ${missingIds.join(', ')}`)
      }
    }

    const versions = versionsData?.lineItems
    if (versions && versions.length > 0) {
      return versions.map(version => {
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
    : allFound // Use all found instances if block shape ID is null

  // Log missing IDs
  if (ids.length > 0 && found.length !== ids.length) {
    const foundIds = new Set(found.map(instance => instance.id))
    const missingIds = ids.filter(id => !foundIds.has(id))
    if (missingIds.length > 0) {
      const categoryName = categoryKey === 'services' ? 'service' : categoryKey === 'properties' ? 'property type block' : 'availability option'
      logger.warn(`[AppointmentTransformer] Some ${categoryName} IDs not found: ${missingIds.join(', ')}`)
    }

    // Log wrong shape IDs (only for services and properties)
    if (blockShapeId && (categoryKey === 'services' || categoryKey === 'properties') && found.length < ids.length) {
      const wrongShapeIds = ids.filter(id => {
        const instance = findBlockInstanceById(bookingData, id)
        return instance && instance.blockShapeRef !== blockShapeId
      })
      if (wrongShapeIds.length > 0) {
        const categoryName = categoryKey === 'services' ? 'service' : 'property type block'
        logger.warn(`[AppointmentTransformer] Some ${categoryName} IDs have wrong block shape: ${wrongShapeIds.join(', ')}`)
      }
    }
  }

  // Apply versions if available
  const versions = versionsData?.[categoryKey]
  if (versions && versions.length > 0) {
    return versions.map(version => {
      const currentInstance = found.find(instance => instance.id === version.id) ?? null
      return transformVersionToBookingInstance(version, currentInstance, bookingData)
    })
  }

  return found
}
