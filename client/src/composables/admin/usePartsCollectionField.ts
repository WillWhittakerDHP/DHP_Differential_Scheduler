/**
 * PATTERN: usePartsCollectionField Composable

PATTERN: Composable that provides co...
 */
import { computed } from 'vue'
import { useAdmin } from '@/composables/admin/useAdmin'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { useEntityMetadata } from './useEntityMetadata'
import type { RelationshipFieldType } from '@/types/entity/formFields'

/**
 * PATTERN: usePartsCollectionField composable
PATTERN: Composable that returns comp...
 */
export function usePartsCollectionField<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(fieldContext: FieldContextType<GE, GF>) {
  const adminComp = useAdmin()
  
  /**
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
   * PATTERN: Use useEntityMetadata composable to fetch metadata
   */
  const { fieldMetadata } = useEntityMetadata(
    fieldContext.entityKey,
    entity
  )
  
  /**
   */
  const fieldMetadataEntry = computed(() => {
    if (!fieldMetadata.value) {
      return undefined
    }
    return fieldMetadata.value[String(fieldContext.fieldKey)]
  })

  /**
   * WHY: inputConfig stores relationship select config for partsCollection fields (direct format)
   */
  const selectConfig = computed<RelationshipFieldType<GE>>(() => {
    const meta = fieldMetadataEntry.value
    
    // PATTERN: Fail explicitly when inputConfig is missing
    if (!meta) {
      throw new Error(
        `[usePartsCollectionField] Missing FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Field must be configured in /admin-input-metadata or /admin-relationship-metadata.`
      )
    }
    
    if (!meta.inputConfig) {
      throw new Error(
        `[usePartsCollectionField] Missing inputConfig in FieldMetadataEntry for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `PartsCollection fields (renderAs: partsCollection) must have inputConfig configured.`
      )
    }
    
    // PATTERN: Cast inputConfig to RelationshipFieldType (backend validates structure)
    const config = meta.inputConfig as RelationshipFieldType<GE>
    
    // PATTERN: Fail explicitly if targetMode is not 'relationship'
    if (config.targetMode !== 'relationship') {
      throw new Error(
        `[usePartsCollectionField] Invalid targetMode in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `PartsCollection fields must have targetMode: 'relationship', got: ${config.targetMode}.`
      )
    }
    
    return config
  })

  /**
Get child entity key from config - NO FALLBACKS
LEARNING: Extract ca...
   */
  const childEntityKey = computed<GlobalEntityKey>(() => {
    const config = selectConfig.value
    
    // PATTERN: Fail explicitly when candidateChildKey is missing
    if (!config.candidateChildKey) {
      throw new Error(
        `[usePartsCollectionField] Missing candidateChildKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `PartsCollection fields must have candidateChildKey configured.`
      )
    }
    
    return config.candidateChildKey as GlobalEntityKey
  })

  /**
Get relationship key from config - NO FALLBACKS
LEARNING: Extract ta...
   */
  const relationshipKey = computed<string>(() => {
    const config = selectConfig.value
    
    // PATTERN: Fail explicitly when targetKey is missing
    if (!config.targetKey) {
      throw new Error(
        `[usePartsCollectionField] Missing targetKey in inputConfig for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `PartsCollection fields must have targetKey configured.`
      )
    }
    
    return config.targetKey as string
  })

  /**
Get options field key - HARDCODED for partsCollection
PATTERN: Hardc...
   */
  const optionsFieldKey = computed<string>(() => {
    // PATTERN: Hardcode instead of requiring configuration
    return 'validParts'
  })

  /**
Get parent entity from admin store
LEARNING: Read parent entity usin...
   */
  const parentEntity = computed<GlobalEntity<GE> | undefined>(() => {
    return adminComp.getEntity(fieldContext.entityKey, fieldContext.entityId)
  })

  /**
   * Determine parent type field based on entity key
   */
  const parentTypeProperty = computed<string | null>(() => {
    if (fieldContext.entityKey === 'blockInstance') return 'blockShapeRef'
    if (fieldContext.entityKey === 'partInstance') return 'partShapeRef'
    return null
  })

  /**
   * Get parent type entity key based on entity key
   */
  const parentTypeEntityKey = computed<GlobalEntityKey | null>(() => {
    if (fieldContext.entityKey === 'blockInstance') return 'blockShape' as GlobalEntityKey
    if (fieldContext.entityKey === 'partInstance') return 'partShape' as GlobalEntityKey
    return null
  })

  /**
   * Get parent type reference from parent entity
   */
  const parentTypeRef = computed<string | null>(() => {
    if (!parentEntity.value || !parentTypeProperty.value) return null
    return getEntityFieldValue(parentEntity.value, parentTypeProperty.value) as string | null
  })

  /**
Get parent type entity from admin store
LEARNING: Read parent shape ...
   */
  const parentTypeEntity = computed<GlobalEntity<GlobalEntityKey> | undefined>(() => {
    if (!parentTypeEntityKey.value || !parentTypeRef.value) return undefined
    return adminComp.getEntity(parentTypeEntityKey.value, toGlobalEntityId(parentTypeRef.value))
  })

  /**
   * Determine if partsCollection field should be displayed
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
    
    const validOptions = getEntityFieldValue(parentTypeEntity.value, String(optionsFieldKey.value))
    const hasValidOptions = Array.isArray(validOptions) && validOptions.length > 0
    
    return hasValidOptions
  })

  /**
   * Default expanded state - NO DEFAULTS
   */
  const defaultExpanded = computed<boolean | undefined>(() => {
    const meta = fieldMetadataEntry.value
    // LEARNING: NO DEFAULTS - expanded state should be explicitly configured
    // PATTERN: Return undefined if not in metadata
    return (meta as { defaultExpanded?: boolean })?.defaultExpanded
  })

  /**
   * Function to get child's parent ID - NO DEFAULTS
   */
  const getChildParentId = (child: GlobalEntity<GlobalEntityKey>): string => {
    // PATTERN: Fail explicitly when required data is missing
    if (!parentEntity.value) {
      throw new Error(
        `[usePartsCollectionField] Missing parentEntity for ${String(fieldContext.entityKey)}.${String(fieldContext.entityId)}. ` +
        `Cannot determine child parent ID.`
      )
    }
    
    if (!relationshipKey.value) {
      throw new Error(
        `[usePartsCollectionField] Missing relationshipKey for ${String(fieldContext.entityKey)}.${String(fieldContext.fieldKey)}. ` +
        `Cannot determine child parent ID.`
      )
    }
    
    const parentRelationshipIds = getEntityFieldValue(parentEntity.value, String(relationshipKey.value))
    if (Array.isArray(parentRelationshipIds) && parentRelationshipIds.includes(child.id)) {
      return parentEntity.value.id
    }
    
    // PATTERN: Return empty string (not a default, indicates absence of relationship)
    return ''
  }

  /**
   * Function to get parent ID
   */
  const getParentId = (parent: GlobalEntity<GlobalEntityKey>): string => {
    return parent.id
  }

  return {
    childEntityKey,
    relationshipKey,
    optionsFieldKey,
    
    parentEntity,
    parentTypeProperty,
    parentTypeEntityKey,
    parentTypeRef,
    parentTypeEntity,
    
    shouldDisplay,
    defaultExpanded,
    
    getChildParentId,
    getParentId,
  }
}


