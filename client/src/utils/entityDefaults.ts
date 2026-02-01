/**
 * Entity Defaults Utility
 * 
 * LEARNING: Provides default values for required NOT NULL fields when creating entities
 * WHY: Database schemas require certain fields to be NOT NULL, but test functions may not include them
 * PATTERN: Centralized default values based on database schema requirements
 * 
 * This ensures all required fields are included with proper defaults when creating test entities
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { ValidAdminValue } from '@/constants/primitives'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'

const logger = createLogger('entityDefaults')

const ENTITY_DISPLAY_NAMES: Record<GlobalEntityKey, string> = {
  blockInstance: 'Block Profile',
  blockShape: 'Block Shape',
  partInstance: 'Part Profile',
  partShape: 'Part Shape',
  eventShape: 'Event Shape',
  eventInstance: 'Event Profile',
  annotationShape: 'Annotation Shape',
  annotationInstance: 'Annotation Profile',
}

export function getEntityDisplayName(entityKey: GlobalEntityKey): string {
  return ENTITY_DISPLAY_NAMES[entityKey] ?? entityKey
}

/**
 * LEARNING: Dynamic entity defaults from metadata
 * WHY: No hardcoded field lists - automatically includes all fields from metadata
 * PATTERN: Uses metadata cache to determine field types and required status
 * 
 * Get default values for an entity type based on admin metadata
 * Returns defaults for all fields based on their dataType and isRequired status
 * 
 * @param entityKey - The entity type key
 * @returns Record of default values based on metadata
 */
function getDynamicEntityDefaults(entityKey: GlobalEntityKey): Record<string, ValidAdminValue> {
  const entityType = getEntityTypeForMetadata(entityKey)
  if (!entityType) {
    logger.warn(`No metadata entity type for entityKey: ${entityKey}`)
    return {}
  }

  let metadataCache
  try {
    metadataCache = useMetadataCache()
  } catch (error) {
    logger.error('Error calling useMetadataCache:', error)
    return { orderIndex: 0 }
  }

  let metadata
  try {
    metadata = metadataCache.getMetadata(entityType)
  } catch (error) {
    logger.error('Error calling getMetadata:', error)
    return { orderIndex: 0 }
  }

  if (!metadata || Object.keys(metadata).length === 0) {
    logger.warn(`Metadata not loaded for entityType: ${entityType}. Defaults may be incomplete.`)
  }

  // PATTERN: Start with orderIndex, then reduce metadata entries to build defaults object
  const baseDefaults: Record<string, ValidAdminValue> = { orderIndex: 0 }

  // PATTERN: Use metadata dataType and isRequired to determine appropriate defaults
  // PATTERN: Reduce metadata entries to defaults object
  let defaults: Record<string, ValidAdminValue>
  try {
    defaults = Object.entries(metadata || {}).reduce((acc, [fieldKey, fieldMetadata]) => {
      const { dataType, isRequired } = fieldMetadata

      if (fieldKey in acc) return acc

      // PATTERN: Boolean fields default to false (required) or undefined (nullable), ternary fields default to 'false', numbers to 0, strings to ''
      if (dataType === 'boolean' || dataType === 'ternary') {
        if (dataType === 'ternary') {
          return { ...acc, [fieldKey]: 'false' }
        } else {
          // PATTERN: Check field name and entity type to determine if active should default to true
          if (fieldKey === 'active' && (
            entityType === 'blockInstance' || 
            entityType === 'partInstance' || 
            entityType === 'eventInstance' || 
            entityType === 'annotationInstance'
          )) {
            return { ...acc, [fieldKey]: true }
          } else {
            return { ...acc, [fieldKey]: isRequired ? false : undefined }
          }
        }
      } else if (dataType === 'number') {
        if (isRequired) {
          return { ...acc, [fieldKey]: 0 }
        }
        return acc
      } else if (dataType === 'string') {
        return { ...acc, [fieldKey]: '' }
      } else if (dataType === 'array') {
        return { ...acc, [fieldKey]: [] }
      }
      return acc
    }, baseDefaults)
  } catch (error) {
    logger.error('Error iterating metadata:', error)
    return baseDefaults
  }

  return defaults
}


/**
 * Merge provided entity data with required defaults
 * 
 * LEARNING: Ensures all required NOT NULL fields are included with defaults
 * WHY: Prevents database constraint violations when creating entities
 * PATTERN: Merge user-provided values with schema-required defaults
 * 
 * @param entityKey - The entity type key
 * @param providedData - Partial entity data provided by caller
 * @returns Entity data with all required fields included
 */
export function mergeEntityDefaults<GE extends GlobalEntityKey>(
  entityKey: GE,
  providedData: Partial<GlobalEntity<GE>>
): Partial<GlobalEntity<GE>> {
  // PATTERN: getDynamicEntityDefaults() provides complete defaults based on metadata
  const defaults = getDynamicEntityDefaults(entityKey)
  
  const merged = {
    ...defaults,
    ...providedData,
  } as Partial<GlobalEntity<GE>>
  
  // PATTERN: Explicit validation for critical required fields using object spread
  // PATTERN: Build final object with spread operator
  const finalMerged = (merged.orderIndex === null || merged.orderIndex === undefined)
    ? {
        ...merged,
        orderIndex: typeof defaults.orderIndex === 'number' ? defaults.orderIndex : 0
      }
    : merged
  
  return finalMerged
}

export function getDefaultEntityValues(entityKey: GlobalEntityKey): Record<string, ValidAdminValue> {
  // PATTERN: Metadata is single source of truth for field types and required status
  const defaults = getDynamicEntityDefaults(entityKey)
  
  const result: Record<string, ValidAdminValue> = {
    ...defaults,
  } as Record<string, ValidAdminValue>
  
  // PATTERN: Use empty string so placeholder from display config is visible
  if (result.name === undefined) {
    result.name = ''
  }
  
  // PATTERN: Explicit check with fallback to 0 (defensive check even though metadata should include it)
  if (result.orderIndex === null || result.orderIndex === undefined) {
    result.orderIndex = 0
  }
  
  return result
}

