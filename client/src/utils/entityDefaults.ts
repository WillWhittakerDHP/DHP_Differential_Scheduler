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
 * Default values for required NOT NULL fields per entity type
 * Based on database schema requirements (allowNull: false)
 */
const ENTITY_REQUIRED_DEFAULTS: Record<GlobalEntityKey, Partial<GlobalEntity<GlobalEntityKey>>> = {
  blockShape: {
    orderIndex: 0, // Required NOT NULL field
    isDependentInstance: false,
    composable: false, // Boolean field must have explicit default
    constituable: false, // Boolean field must have explicit default
  },
  blockInstance: {
    orderIndex: 0, // Required NOT NULL field
    active: true,
    isDependentInstance: false,
    composite: false, // Boolean field must have explicit default
    baseSqFt: 0,
  },
  partInstance: {
    orderIndex: 0, // Required NOT NULL field
    isDependentInstance: false,
    onSite: false,
    clientPresent: false,
    moveable: false,
    baseFee: 0,
    rateOverBaseFee: 0,
    baseTime: 0,
    rateOverBaseTime: 0,
    active: true,
  },
  partShape: {
    orderIndex: 0, // Required NOT NULL field
    isDependentInstance: false,
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
  const defaults = ENTITY_REQUIRED_DEFAULTS[entityKey] || {}
  
  // Merge: provided values override defaults
  const merged = {
    ...defaults,
    ...providedData,
  } as Partial<GlobalEntity<GE>>
  
  // LEARNING: Ensure orderIndex is always a number, never null or undefined
  // WHY: Database requires orderIndex to be NOT NULL, so we must guarantee it's set
  // PATTERN: Explicit validation for critical required fields
  if (merged.orderIndex === null || merged.orderIndex === undefined) {
    merged.orderIndex = defaults.orderIndex ?? 0
  }
  
  return merged
}

/**
 * Get default form values for entity creation
 * 
 * LEARNING: Provides default values for form initialization when creating new entities
 * WHY: Forms need initial values to prevent null/undefined errors and provide sensible defaults
 * PATTERN: Returns defaults from ENTITY_REQUIRED_DEFAULTS with friendly name fallback
 * 
 * COMPARISON: React version reads from PROPERTY_KEYS. Vue version uses ENTITY_REQUIRED_DEFAULTS
 *             which is simpler and sufficient for form initialization.
 * 
 * @param entityKey - The entity type key
 * @returns Record of default values for form initialization
 */
export function getDefaultEntityValues(entityKey: GlobalEntityKey): Record<string, ValidAdminValue> {
  const defaults = ENTITY_REQUIRED_DEFAULTS[entityKey] || {}
  
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
  // PATTERN: Explicit check with fallback to 0
  if (result.orderIndex === null || result.orderIndex === undefined) {
    result.orderIndex = 0
  }
  
  return result
}

