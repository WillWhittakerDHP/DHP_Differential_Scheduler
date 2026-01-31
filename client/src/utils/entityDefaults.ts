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
import type { BookingMode } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { ValidAdminValue } from '@/constants/primitives'
import { useMetadataCache } from '@/composables/admin/useMetadataCache'
import { getEntityTypeForMetadata } from '@/utils/entities/entityTypeMapping'
import { createLogger } from '@/utils/logger'

const logger = createLogger('entityDefaults')

/**
 * LEARNING: Get human-readable display name for entity type
 * WHY: Used in default name generation and user-facing messages
 * PATTERN: Config-driven mapping instead of switch statement
 * 
 * @param entityKey - The entity type key
 * @returns Human-readable display name for the entity type
 */
const ENTITY_DISPLAY_NAMES: Record<GlobalEntityKey, string> = {
  blockInstance: 'Block Profile',
  blockShape: 'Block Shape',
  partInstance: 'Part Profile',
  partShape: 'Part Shape',
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

  // If metadata not loaded, log warning but continue
  if (!metadata || Object.keys(metadata).length === 0) {
    logger.warn(`Metadata not loaded for entityType: ${entityType}. Defaults may be incomplete.`)
  }

  const defaults: Record<string, ValidAdminValue> = {}

  // LEARNING: Always include orderIndex as it's required NOT NULL
  // WHY: Database requires orderIndex to be NOT NULL, so we must guarantee it's set
  defaults.orderIndex = 0

  // LEARNING: Iterate through metadata to build defaults dynamically
  // WHY: No hardcoded field lists - automatically includes all fields from metadata
  // PATTERN: Use metadata dataType and isRequired to determine appropriate defaults
  try {
    for (const [fieldKey, fieldMetadata] of Object.entries(metadata || {})) {
      const { dataType, isRequired } = fieldMetadata

      // Skip if already set (e.g., orderIndex)
      if (fieldKey in defaults) continue

      // LEARNING: Set defaults based on dataType and isRequired
      // WHY: Different field types need different default values
      // PATTERN: Boolean fields default to false (required) or undefined (nullable), ternary fields default to 'false', numbers to 0, strings to ''
      //          Exception: 'active' field defaults to true for instance entities (blockInstance, partInstance, eventInstance, annotationInstance)
      if (dataType === 'boolean' || dataType === 'ternary') {
        // Required booleans default to false, nullable booleans default to undefined
        // Ternary fields default to 'false' (string enum)
        if (dataType === 'ternary') {
          defaults[fieldKey] = 'false'
        } else {
          // LEARNING: 'active' field defaults to true for instance entities
          // WHY: Matches Sequelize model defaults (active: true) for blockInstance, partInstance, eventInstance, annotationInstance
          // PATTERN: Check field name and entity type to determine if active should default to true
          if (fieldKey === 'active' && (
            entityType === 'blockInstance' || 
            entityType === 'partInstance' || 
            entityType === 'eventInstance' || 
            entityType === 'annotationInstance'
          )) {
            defaults[fieldKey] = true
          } else {
            defaults[fieldKey] = isRequired ? false : undefined
          }
        }
      } else if (dataType === 'number') {
        // Required numbers default to 0
        if (isRequired) {
          defaults[fieldKey] = 0
        }
        // Nullable numbers don't need defaults
      } else if (dataType === 'string') {
        // Strings default to empty string (allows placeholder to show)
        defaults[fieldKey] = ''
      } else if (dataType === 'array') {
        // Arrays default to empty array
        defaults[fieldKey] = []
      }
      // Reference fields don't need defaults (they're relationships)
    }
  } catch (error) {
    logger.error('Error iterating metadata:', error)
  }

  return defaults
}

/**
 * Default values for required NOT NULL fields per entity type
 * Based on database schema requirements (allowNull: false)
 * 
 * @deprecated Use getDynamicEntityDefaults() instead - this is kept for reference only
 */
// @ts-expect-error - Deprecated constant kept for reference only
const ENTITY_REQUIRED_DEFAULTS: Record<GlobalEntityKey, Partial<GlobalEntity<GlobalEntityKey>>> = {
  blockShape: {
    orderIndex: 0, // Required NOT NULL field
    composable: false, // Boolean field must have explicit default
    canHaveParts: false, // Boolean field must have explicit default
    isStateControl: false, // Boolean field must have explicit default
  },
  blockInstance: {
    orderIndex: 0, // Required NOT NULL field
    active: true,
    bookingMode: 'standalone' as BookingMode,
    composite: false, // Boolean field must have explicit default
    differential: 'false' as const, // Ternary field defaults to 'false'
    baseSqFt: 0,
  },
  partInstance: {
    orderIndex: 0, // Required NOT NULL field
    baseFee: 0,
    rateOverBaseFee: 0,
    baseTime: 0,
    rateOverBaseTime: 0,
    active: true,
  },
  partShape: {
    orderIndex: 0, // Required NOT NULL field
  },
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
  // LEARNING: Use dynamic defaults from metadata instead of hardcoded ENTITY_REQUIRED_DEFAULTS
  // WHY: Automatically includes all fields from metadata
  // PATTERN: getDynamicEntityDefaults() provides complete defaults based on metadata
  const defaults = getDynamicEntityDefaults(entityKey)
  
  // Merge: provided values override defaults
  const merged = {
    ...defaults,
    ...providedData,
  } as Partial<GlobalEntity<GE>>
  
  // LEARNING: Ensure orderIndex is always a number, never null or undefined
  // WHY: Database requires orderIndex to be NOT NULL, so we must guarantee it's set
  // PATTERN: Explicit validation for critical required fields
  if (merged.orderIndex === null || merged.orderIndex === undefined) {
    const defaultOrderIndex = typeof defaults.orderIndex === 'number' ? defaults.orderIndex : 0
    merged.orderIndex = defaultOrderIndex
  }
  
  return merged
}

/**
 * Get default form values for entity creation
 * 
 * LEARNING: Provides default values for form initialization when creating new entities
 * WHY: Forms need initial values to prevent null/undefined errors and provide sensible defaults
 * PATTERN: Uses dynamic metadata-based defaults instead of hardcoded values
 * 
 * LEARNING: Dynamic defaults from metadata
 * WHY: No hardcoded field lists - automatically includes all fields from metadata
 * PATTERN: Uses getDynamicEntityDefaults() to get defaults based on metadata dataType and isRequired
 * 
 * @param entityKey - The entity type key
 * @returns Record of default values for form initialization
 */
export function getDefaultEntityValues(entityKey: GlobalEntityKey): Record<string, ValidAdminValue> {
  // LEARNING: Get dynamic defaults from metadata
  // WHY: Automatically includes all fields (including zeroOutPart, differentialOverride, etc.)
  // PATTERN: Metadata is single source of truth for field types and required status
  const defaults = getDynamicEntityDefaults(entityKey)
  
  // Create result with defaults
  const result: Record<string, ValidAdminValue> = {
    ...defaults,
  } as Record<string, ValidAdminValue>
  
  // LEARNING: Set empty name to allow placeholder to show
  // WHY: Placeholders provide better UX than pre-filled values that need to be deleted
  // PATTERN: Use empty string so placeholder from display config is visible
  if (result.name === undefined) {
    result.name = ''
  }
  
  // LEARNING: Ensure orderIndex is always set (required NOT NULL field)
  // WHY: Database requires orderIndex to be NOT NULL, so we must guarantee it's set
  // PATTERN: Explicit check with fallback to 0 (defensive check even though metadata should include it)
  if (result.orderIndex === null || result.orderIndex === undefined) {
    result.orderIndex = 0
  }
  
  return result
}

