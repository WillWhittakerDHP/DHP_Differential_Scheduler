/**
 * useNestedCollectionField Composable
 * 
 * LEARNING: Parses relationshipSelect config from metadata and determines display conditions
 * WHY: Extracts config parsing logic from NestedCollectionField component
 * PATTERN: Composable that provides config-derived values and display validation
 * 
 * Features:
 * - Parse relationshipSelect config from metadata.inputConfig
 * - Determine child entity key
 * - Determine relationship key
 * - Determine options field key
 * - Validate display conditions (parent type has valid options)
 */

import { computed } from 'vue'
import { useAdmin } from '@/composables/useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/useFieldContext'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { useEntityMetadata } from './useEntityMetadata'
import type { RelationshipFieldType } from '@/types/entity/formFields'

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
  
  /**
   * LEARNING: Get entity for metadata fetch
   * WHY: useEntityMetadata needs entity to determine entityId
   * PATTERN: Get entity from admin store using entityKey and entityId
   */
  const entity = computed(() => {
    try {
      return adminComp.getEntity(fieldContext.entityKey, fieldContext.entityId)
    } catch {
      return null
    }
  })
  
  /**
   * LEARNING: Fetch field metadata from /admin-input-metadata
   * WHY: Metadata is the source of truth for field configuration, including inputConfig
   * PATTERN: Use useEntityMetadata composable to fetch metadata
   */
  const { fieldMetadata } = useEntityMetadata(
    fieldContext.entityKey,
    entity
  )
  
  /**
   * LEARNING: Get field metadata entry for this field
   * WHY: Contains inputConfig with nested select behavior configuration
   * PATTERN: Read from metadata Record by fieldKey
   */
  const fieldMetadataEntry = computed(() => {
    if (!fieldMetadata.value) {
      return undefined
    }
    return fieldMetadata.value[String(fieldContext.fieldKey)]
  })

  /**
   * LEARNING: Extract select config from metadata.inputConfig - NO FALLBACKS
   * WHY: inputConfig stores relationshipSelect config for nested fields (selectMode: 'nested')
   * PATTERN: Read inputConfig from metadata entry, fail explicitly if missing
   */
  const selectConfig = computed<RelationshipFieldType<GE>>(() => {
    const meta = fieldMetadataEntry.value
    
    // LEARNING: NO FALLBACKS - inputConfig is required for nested fields
    // WHY: Nested fields must have inputConfig configured in metadata
    // PATTERN: Fail explicitly when inputConfig is missing
    if (!meta) {
      throw new Error(
        `[useNestedCollectionField] Missing FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Field must be configured in /admin-input-metadata.`
      )
    }
    
    if (!meta.inputConfig) {
      throw new Error(
        `[useNestedCollectionField] Missing inputConfig in FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Nested fields (renderAs: select/multiselect/reference with selectMode: nested) must have inputConfig configured.`
      )
    }
    
    // LEARNING: For nested fields, inputConfig should be RelationshipFieldType with targetMode: 'relationship'
    // WHY: Nested fields use relationship selects, not type selects
    // PATTERN: Cast inputConfig to RelationshipFieldType (backend validates structure)
    const config = meta.inputConfig as RelationshipFieldType<GE>
    
    // LEARNING: Verify this is a relationship select (not type select)
    // WHY: Nested fields only work with relationship selects
    // PATTERN: Fail explicitly if targetMode is not 'relationship'
    if (config.targetMode !== 'relationship') {
      throw new Error(
        `[useNestedCollectionField] Invalid targetMode in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Nested fields must have targetMode: 'relationship', got: ${config.targetMode}.`
      )
    }
    
    return config
  })

  /**
   * Get child entity key from config - NO FALLBACKS
   * LEARNING: Extract candidateChildKey from config
   * WHY: Determines which entity type to display (e.g., "partInstance" for activeConstituents)
   * PATTERN: Read candidateChildKey from config, fail if missing
   */
  const childEntityKey = computed<GlobalEntityKey>(() => {
    const config = selectConfig.value
    
    // LEARNING: NO FALLBACKS - candidateChildKey is required
    // WHY: Nested fields must specify which entity type to display
    // PATTERN: Fail explicitly when candidateChildKey is missing
    if (!config.candidateChildKey) {
      throw new Error(
        `[useNestedCollectionField] Missing candidateChildKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Nested fields must have candidateChildKey configured.`
      )
    }
    
    return config.candidateChildKey as GlobalEntityKey
  })

  /**
   * Get relationship key from config - NO FALLBACKS
   * LEARNING: Extract targetKey from config
   * WHY: Determines which relationship field to use (e.g., "activeConstituents")
   * PATTERN: Read targetKey from config, fail if missing
   */
  const relationshipKey = computed<string>(() => {
    const config = selectConfig.value
    
    // LEARNING: NO FALLBACKS - targetKey is required
    // WHY: Nested fields must specify which relationship field to use
    // PATTERN: Fail explicitly when targetKey is missing
    if (!config.targetKey) {
      throw new Error(
        `[useNestedCollectionField] Missing targetKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Nested fields must have targetKey configured.`
      )
    }
    
    return config.targetKey as string
  })

  /**
   * Get options field key from config - NO DEFAULTS
   * LEARNING: Extract optionsFieldKey from config
   * WHY: Determines which field on parent type contains valid options (e.g., "validConstituents")
   * PATTERN: Read optionsFieldKey from config, fail if missing
   */
  const optionsFieldKey = computed<string>(() => {
    const config = selectConfig.value
    
    // LEARNING: NO DEFAULTS - optionsFieldKey must be explicitly configured
    // WHY: Nested fields must specify which field contains valid options
    // PATTERN: Fail explicitly when optionsFieldKey is missing
    if (!config.optionsFieldKey) {
      throw new Error(
        `[useNestedCollectionField] Missing optionsFieldKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Nested fields must have optionsFieldKey configured (e.g., 'validConstituents').`
      )
    }
    
    return config.optionsFieldKey as string
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
   * Default expanded state - NO DEFAULTS
   * LEARNING: Controls whether nested collection is expanded by default
   * WHY: Should be configured in metadata if needed
   * PATTERN: Read from metadata, undefined if not configured (no default)
   */
  const defaultExpanded = computed<boolean | undefined>(() => {
    const meta = fieldMetadataEntry.value
    // LEARNING: NO DEFAULTS - expanded state should be explicitly configured
    // WHY: If not configured, return undefined (not false)
    // PATTERN: Return undefined if not in metadata
    return (meta as { defaultExpanded?: boolean })?.defaultExpanded
  })

  /**
   * Function to get child's parent ID - NO DEFAULTS
   * LEARNING: Check if child ID is in parent's relationship array
   * WHY: Determines if a child entity belongs to this parent
   * PATTERN: Function that checks relationship array, fails if required data missing
   */
  const getChildParentId = (child: GlobalEntity<GlobalEntityKey>): string => {
    // LEARNING: NO FALLBACKS - parentEntity and relationshipKey are required
    // WHY: Cannot determine parent ID without parent entity and relationship key
    // PATTERN: Fail explicitly when required data is missing
    if (!parentEntity.value) {
      throw new Error(
        `[useNestedCollectionField] Missing parentEntity for ${String(fieldContext.entityKey)}.${String(fieldContext.entityId)}. ` +
        `Cannot determine child parent ID.`
      )
    }
    
    if (!relationshipKey.value) {
      throw new Error(
        `[useNestedCollectionField] Missing relationshipKey for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Cannot determine child parent ID.`
      )
    }
    
    // For activeConstituents relationship, check if child ID is in parent's activeConstituents array
    const parentRelationshipIds = getEntityFieldValue(parentEntity.value, String(relationshipKey.value))
    if (Array.isArray(parentRelationshipIds) && parentRelationshipIds.includes(child.id)) {
      return parentEntity.value.id
    }
    
    // LEARNING: NO DEFAULT - return empty string if child is not in relationship
    // WHY: Child might not belong to this parent - empty string indicates no relationship
    // PATTERN: Return empty string (not a default, indicates absence of relationship)
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


