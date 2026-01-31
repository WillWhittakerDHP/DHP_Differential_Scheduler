/**
 * useRelationshipCollectionField Composable
 * 
 * LEARNING: Generic version of usePartsCollectionField - works for any relationship collection type
 * WHY: Extracts config parsing logic from collection components, supports parts, annotations, events
 * PATTERN: Composable that provides config-derived values and display validation for any relationship collection
 * 
 * Features:
 * - Parse relationship select config from metadata.inputConfig (direct format)
 * - Determine child entity key
 * - Determine relationship key
 * - Derive options field key from config (not hardcoded)
 * - Validate display conditions (parent type has valid options)
 * - Support both instance-level and shape-level parents
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
 * useRelationshipCollectionField composable
 * LEARNING: Provides config parsing and display validation for relationshipCollection fields
 * WHY: Centralizes config logic for reuse across parts, annotations, events
 * PATTERN: Composable that returns computed properties based on field context
 */
export function useRelationshipCollectionField<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(fieldContext: FieldContextType<GE, GF>) {
  const adminComp = useAdmin()
  
  /**
   * LEARNING: Get entity for metadata fetch
   * WHY: useEntityMetadata needs entity to determine entityId
   * PATTERN: Get entity from admin store using entityKey and entityId
   */
  const entity = computed<GlobalEntity<GE> | null>(() => {
    try {
      const entityValue = adminComp.getEntity(fieldContext.entityKey, fieldContext.entityId)
      return entityValue ?? null
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
   * WHY: Contains inputConfig with relationshipCollection field configuration
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
   * WHY: inputConfig stores relationship select config for relationshipCollection fields (direct format)
   * PATTERN: Read inputConfig from metadata entry, fail explicitly if missing
   */
  const selectConfig = computed<RelationshipFieldType<GE>>(() => {
    const meta = fieldMetadataEntry.value
    
    // LEARNING: NO FALLBACKS - inputConfig is required for relationshipCollection fields
    // WHY: RelationshipCollection fields must have inputConfig configured in metadata
    // PATTERN: Fail explicitly when inputConfig is missing
    if (!meta) {
      throw new Error(
        `[useRelationshipCollectionField] Missing FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Field must be configured in /admin-input-metadata or /admin-relationship-metadata.`
      )
    }
    
    if (!meta.inputConfig) {
      throw new Error(
        `[useRelationshipCollectionField] Missing inputConfig in FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `RelationshipCollection fields (renderAs: relationshipCollection) must have inputConfig configured.`
      )
    }
    
    // LEARNING: inputConfig is stored in direct format (not wrapped)
    // WHY: Database stores inputConfig directly, not wrapped in relationshipSelect/typeSelect
    // PATTERN: Use inputConfig directly as RelationshipFieldType
    const config = meta.inputConfig as RelationshipFieldType<GE>
    
    // LEARNING: Verify this is a relationship select (not type select)
    // WHY: RelationshipCollection fields only work with relationship selects
    // PATTERN: Fail explicitly if targetMode is not 'relationship'
    if (config.targetMode !== 'relationship') {
      throw new Error(
        `[useRelationshipCollectionField] Invalid targetMode in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `RelationshipCollection fields must have targetMode: 'relationship', got: ${String(config.targetMode)}.`
      )
    }
    
    return config
  })

  /**
   * Get child entity key from config - NO FALLBACKS
   * LEARNING: Extract candidateChildKey from config
   * WHY: Determines which entity type to display (e.g., "partInstance", "annotationInstance", "eventInstance")
   * PATTERN: Read candidateChildKey from config, fail if missing
   */
  const childEntityKey = computed<GlobalEntityKey>(() => {
    const config = selectConfig.value
    
    // LEARNING: NO FALLBACKS - candidateChildKey is required
    // WHY: RelationshipCollection fields must specify which entity type to display
    // PATTERN: Fail explicitly when candidateChildKey is missing
    if (!config.candidateChildKey) {
      throw new Error(
        `[useRelationshipCollectionField] Missing candidateChildKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `RelationshipCollection fields must have candidateChildKey configured.`
      )
    }
    
    return config.candidateChildKey as GlobalEntityKey
  })

  /**
   * Get relationship key from config - NO FALLBACKS
   * LEARNING: Extract targetKey from config
   * WHY: Determines which relationship field to use (e.g., "partAssignments", "annotationAssignments", "eventAssignments")
   * PATTERN: Read targetKey from config, fail if missing
   */
  const relationshipKey = computed<string>(() => {
    const config = selectConfig.value
    
    // LEARNING: NO FALLBACKS - targetKey is required
    // WHY: RelationshipCollection fields must specify which relationship field to use
    // PATTERN: Fail explicitly when targetKey is missing
    if (!config.targetKey) {
      throw new Error(
        `[useRelationshipCollectionField] Missing targetKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `RelationshipCollection fields must have targetKey configured.`
      )
    }
    
    return config.targetKey as string
  })

  /**
   * Get options field key from config - DERIVED FROM CONFIG
   * LEARNING: Extract optionsFieldKey from config.selectedChildPath or derive from relationshipKey
   * WHY: Different collection types use different options fields (validParts, validAnnotations, validEvents)
   * PATTERN: Derive from config instead of hardcoding
   * 
   * For parts: relationshipKey='partAssignments' → optionsFieldKey='validParts'
   * For annotations: relationshipKey='annotationAssignments' → optionsFieldKey='validAnnotations'
   * For events: relationshipKey='eventAssignments' → optionsFieldKey='validEvents'
   */
  const optionsFieldKey = computed<string>(() => {
    const config = selectConfig.value
    const relKey = relationshipKey.value
    
    // LEARNING: Derive optionsFieldKey from relationshipKey
    // WHY: Options field name follows pattern: 'valid' + pluralized relationshipKey without 'Assignments' suffix
    // PATTERN: Transform 'partAssignments' → 'validParts', 'annotationAssignments' → 'validAnnotations', etc.
    if (relKey.endsWith('Assignments')) {
      const withoutAssignments = relKey.replace(/Assignments$/, '')
      // Pluralize: add 's' to make it plural (part → parts, annotation → annotations, event → events)
      const pluralized = `${withoutAssignments}s`
      // Capitalize first letter and prepend 'valid'
      const capitalized = pluralized.charAt(0).toUpperCase() + pluralized.slice(1)
      return `valid${capitalized}`
    }
    
    // LEARNING: Fallback: try to get from config.selectedChildPath if available
    // WHY: Some configs might specify the options field explicitly
    // PATTERN: Check config.selectedChildPath for options field name
    if (config.selectedChildPath && Array.isArray(config.selectedChildPath) && config.selectedChildPath.length > 0) {
      const lastPath = config.selectedChildPath[config.selectedChildPath.length - 1]
      if (typeof lastPath === 'string' && lastPath.startsWith('valid')) {
        return lastPath
      }
    }
    
    // LEARNING: If derivation fails, throw error
    // WHY: Options field key is required for relationshipCollection fields
    // PATTERN: Fail explicitly when optionsFieldKey cannot be determined
    throw new Error(
      `[useRelationshipCollectionField] Cannot determine optionsFieldKey for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
      `RelationshipKey: ${relKey}. Please configure optionsFieldKey in inputConfig or ensure relationshipKey follows '*Assignments' pattern.`
    )
  })

  /**
   * Get parent entity from admin store
   * LEARNING: Read parent entity using admin composable
   * WHY: Need parent entity (e.g., blockInstance, blockShape, partShape) to check relationships and type
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
   * 
   * Supports:
   * - blockInstance → blockShapeRef
   * - partInstance → partShapeRef
   * - blockShape → null (shape is already the type)
   * - partShape → null (shape is already the type)
   */
  const parentTypeProperty = computed<string | null>(() => {
    if (fieldContext.entityKey === 'blockInstance') return 'blockShapeRef'
    if (fieldContext.entityKey === 'partInstance') return 'partShapeRef'
    // For shape-level entities (blockShape, partShape), they are already the type
    if (fieldContext.entityKey === 'blockShape' || fieldContext.entityKey === 'partShape') return null
    return null
  })

  /**
   * Get parent type entity key based on entity key
   * LEARNING: Map entityKey to type entity key
   * WHY: Determines which shape entity to fetch (blockShape, partShape, or same entity if already shape)
   * PATTERN: Computed property with conditional mapping
   */
  const parentTypeEntityKey = computed<GlobalEntityKey | null>(() => {
    if (fieldContext.entityKey === 'blockInstance') return 'blockShape' as GlobalEntityKey
    if (fieldContext.entityKey === 'partInstance') return 'partShape' as GlobalEntityKey
    // For shape-level entities, the entity itself is the type
    if (fieldContext.entityKey === 'blockShape' || fieldContext.entityKey === 'partShape') {
      return fieldContext.entityKey
    }
    return null
  })

  /**
   * Get parent type reference from parent entity
   * LEARNING: Read type reference property from parent entity
   * WHY: Need type reference to fetch parent type entity (for instance-level entities)
   * PATTERN: Computed property that reads from parentEntity
   * 
   * For shape-level entities, returns the entity ID directly
   */
  const parentTypeRef = computed<string | null>(() => {
    // For shape-level entities, the entity itself is the type
    if (fieldContext.entityKey === 'blockShape' || fieldContext.entityKey === 'partShape') {
      return fieldContext.entityId
    }
    
    // For instance-level entities, read the type reference property
    if (!parentEntity.value || !parentTypeProperty.value) return null
    return getEntityFieldValue(parentEntity.value, parentTypeProperty.value) as string | null
  })

  /**
   * Get parent type entity from admin store
   * LEARNING: Read parent shape entity using admin composable
   * WHY: Need parent shape entity to check valid options (e.g., blockShape.validParts)
   * PATTERN: Computed property that reads from admin store
   */
  const parentTypeEntity = computed<GlobalEntity<GlobalEntityKey> | undefined>(() => {
    if (!parentTypeEntityKey.value || !parentTypeRef.value) return undefined
    return adminComp.getEntity(parentTypeEntityKey.value, parentTypeRef.value)
  })

  /**
   * Determine if relationshipCollection field should be displayed
   * LEARNING: Check if parent type has valid options configured
   * WHY: Only show relationshipCollection field if parent type has valid options array
   * PATTERN: Computed property that validates display conditions
   * 
   * For shape-level entities, checks the entity itself for valid options
   */
  const shouldDisplay = computed<boolean>(() => {
    // For shape-level entities, check the entity itself
    if (fieldContext.entityKey === 'blockShape' || fieldContext.entityKey === 'partShape') {
      if (!parentEntity.value) return false
      const validOptions = getEntityFieldValue(parentEntity.value, String(optionsFieldKey.value))
      return Array.isArray(validOptions) && validOptions.length > 0
    }
    
    // For instance-level entities, check the parent type entity
    if (!parentEntity.value || !parentTypeProperty.value) {
      return false
    }
    
    if (!parentTypeRef.value) {
      return false
    }
    
    if (!parentTypeEntity.value) {
      return false
    }
    
    // Check if the shape entity has valid options (e.g., blockShape.validParts)
    const validOptions = getEntityFieldValue(parentTypeEntity.value, String(optionsFieldKey.value))
    const hasValidOptions = Array.isArray(validOptions) && validOptions.length > 0
    
    return hasValidOptions
  })

  /**
   * Default expanded state - NO DEFAULTS
   * LEARNING: Controls whether relationshipCollection is expanded by default
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
        `[useRelationshipCollectionField] Missing parentEntity for ${String(fieldContext.entityKey)}.${String(fieldContext.entityId)}. ` +
        `Cannot determine child parent ID.`
      )
    }
    
    if (!relationshipKey.value) {
      throw new Error(
        `[useRelationshipCollectionField] Missing relationshipKey for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Cannot determine child parent ID.`
      )
    }
    
    // Check if child ID is in parent's relationship array
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
