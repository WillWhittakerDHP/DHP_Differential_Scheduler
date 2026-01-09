/**
 * useNestedCollectionField Composable
 * 
 * LEARNING: Parses relationshipSelect config and determines display conditions
 * WHY: Extracts config parsing logic from NestedCollectionField component
 * PATTERN: Composable that provides config-derived values and display validation
 * 
 * Features:
 * - Parse relationshipSelect config
 * - Determine child entity key
 * - Determine relationship key
 * - Determine options field key
 * - Validate display conditions (parent type has valid options)
 */

import { computed } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import { useAdminConfig } from '@/composables/useAdminConfig'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/useFieldContext'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

/**
 * useNestedCollectionField composable
 * LEARNING: Provides config parsing and display validation for nested collection fields
 * WHY: Centralizes config logic for reuse
 * PATTERN: Composable that returns computed properties based on field context
 */
export function useNestedCollectionField<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(fieldContext: FieldContextType<GE, GF>) {
  const adminComp = useAdmin()
  const adminConfig = useAdminConfig()

  /**
   * Get form field config for this field
   * LEARNING: Read config from adminConfig
   * WHY: Contains relationshipSelect config with nested field settings
   * PATTERN: Computed property that reads from adminConfig
   */
  const fieldConfig = computed(() => {
    try {
      return adminConfig.getFormFieldConfig(fieldContext.entityKey, fieldContext.fieldKey).value
    } catch (error) {
      return undefined
    }
  })

  /**
   * Extract select config (relationshipSelect)
   * LEARNING: Read relationshipSelect config from field config
   * WHY: Contains nested field configuration (childEntityKey, optionsFieldKey, etc.)
   * PATTERN: Computed property that extracts relationshipSelect
   */
  const selectConfig = computed(() => {
    const config = fieldConfig.value
    if (!config) {
      return undefined
    }
    return config?.relationshipSelect
  })

  /**
   * Get child entity key from config
   * LEARNING: Extract candidateChildKey from config
   * WHY: Determines which entity type to display (e.g., "partInstance" for activeConstituents)
   * PATTERN: Read candidateChildKey from config
   */
  const childEntityKey = computed<GlobalEntityKey | undefined>(() => {
    const config = selectConfig.value
    if (!config) {
      return undefined
    }
    return 'candidateChildKey' in config ? config.candidateChildKey as GlobalEntityKey : undefined
  })

  /**
   * Get relationship key from config
   * LEARNING: Extract targetKey from config
   * WHY: Determines which relationship field to use (e.g., "activeConstituents")
   * PATTERN: Read targetKey from config
   */
  const relationshipKey = computed<string | undefined>(() => {
    const config = selectConfig.value
    if (!config) {
      return undefined
    }
    return 'targetKey' in config ? config.targetKey as string : undefined
  })

  /**
   * Get options field key from config
   * LEARNING: Extract optionsFieldKey from config, default to "validConstituents"
   * WHY: Determines which field on parent type contains valid options (e.g., "validConstituents")
   * PATTERN: Read optionsFieldKey from config with fallback
   */
  const optionsFieldKey = computed<string>(() => {
    const config = selectConfig.value
    if (!config) {
      return 'validConstituents'
    }
    return 'optionsFieldKey' in config && config.optionsFieldKey ? config.optionsFieldKey as string : 'validConstituents'
  })

  /**
   * Get parent entity from admin store
   * LEARNING: Read parent entity using admin composable
   * WHY: Need parent entity (e.g., blockInstance) to check relationships and type
   * PATTERN: Computed property that reads from admin store
   */
  const parentEntity = computed<GlobalEntity<GE> | undefined>(() => {
    return adminComp.getEntity(fieldContext.entityKey, fieldContext.entityId)
  })

  /**
   * Determine parent type field based on entity key
   * LEARNING: Map entityKey to type field name
   * WHY: Different entity types use different properties for type reference
   * PATTERN: Computed property with conditional mapping
   */
  const parentTypeProperty = computed<string | null>(() => {
    if (fieldContext.entityKey === 'blockInstance') return 'blockShapeRef'
    if (fieldContext.entityKey === 'partInstance') return 'partShapeRef'
    return null
  })

  /**
   * Get parent type entity key based on entity key
   * LEARNING: Map entityKey to type entity key
   * WHY: Determines which shape entity to fetch (blockShape or partShape)
   * PATTERN: Computed property with conditional mapping
   */
  const parentTypeEntityKey = computed<GlobalEntityKey | null>(() => {
    if (fieldContext.entityKey === 'blockInstance') return 'blockShape' as GlobalEntityKey
    if (fieldContext.entityKey === 'partInstance') return 'partShape' as GlobalEntityKey
    return null
  })

  /**
   * Get parent type reference from parent entity
   * LEARNING: Read type reference property from parent entity
   * WHY: Need type reference to fetch parent type entity
   * PATTERN: Computed property that reads from parentEntity
   */
  const parentTypeRef = computed<string | null>(() => {
    if (!parentEntity.value || !parentTypeProperty.value) return null
    return getEntityFieldValue(parentEntity.value, parentTypeProperty.value) as string | null
  })

  /**
   * Get parent type entity from admin store
   * LEARNING: Read parent shape entity using admin composable
   * WHY: Need parent shape entity to check valid options (e.g., blockShape.validConstituents)
   * PATTERN: Computed property that reads from admin store
   */
  const parentTypeEntity = computed<GlobalEntity<GlobalEntityKey> | undefined>(() => {
    if (!parentTypeEntityKey.value || !parentTypeRef.value) return undefined
    return adminComp.getEntity(parentTypeEntityKey.value, parentTypeRef.value)
  })

  /**
   * Determine if nested field should be displayed
   * LEARNING: Check if parent type has valid options configured
   * WHY: Only show nested field if parent type has valid options array
   * PATTERN: Computed property that validates display conditions
   */
  const shouldDisplay = computed<boolean>(() => {
    if (!parentEntity.value || !parentTypeProperty.value) {
      return false
    }
    
    if (!parentTypeRef.value) {
      return false
    }
    
    if (!parentTypeEntity.value) {
      return false
    }
    
    // Check if the shape entity has valid options (e.g., blockShape.validConstituents)
    const validOptions = getEntityFieldValue(parentTypeEntity.value, String(optionsFieldKey.value))
    const hasValidOptions = Array.isArray(validOptions) && validOptions.length > 0
    
    return hasValidOptions
  })

  /**
   * Default expanded state
   * LEARNING: Controls whether nested collection is expanded by default
   * WHY: Can be configured per field if needed
   * PATTERN: Computed property with default value
   */
  const defaultExpanded = computed<boolean>(() => {
    return false // Default to collapsed
  })

  /**
   * Function to get child's parent ID
   * LEARNING: Check if child ID is in parent's relationship array
   * WHY: Determines if a child entity belongs to this parent
   * PATTERN: Function that checks relationship array
   */
  const getChildParentId = (child: GlobalEntity<GlobalEntityKey>): string => {
    if (!parentEntity.value || !relationshipKey.value) return ''
    
    // For activeConstituents relationship, check if child ID is in parent's activeConstituents array
    const parentRelationshipIds = getEntityFieldValue(parentEntity.value, String(relationshipKey.value))
    if (Array.isArray(parentRelationshipIds) && parentRelationshipIds.includes(child.id)) {
      return parentEntity.value.id
    }
    return ''
  }

  /**
   * Function to get parent ID
   * LEARNING: Simple getter for parent ID
   * WHY: Returns parent entity ID for filtering
   * PATTERN: Function that returns parent ID
   */
  const getParentId = (parent: GlobalEntity<GlobalEntityKey>): string => {
    return parent.id
  }

  return {
    // Config-derived values
    childEntityKey,
    relationshipKey,
    optionsFieldKey,
    
    // Parent/type entities
    parentEntity,
    parentTypeProperty,
    parentTypeEntityKey,
    parentTypeRef,
    parentTypeEntity,
    
    // Display validation
    shouldDisplay,
    defaultExpanded,
    
    // Helper functions
    getChildParentId,
    getParentId,
  }
}


