/**
 * useRelationshipCollection Composable
 *
 * LEARNING: Generic collection-level composable for any relationship collection type
 * WHY: Moves relationship creation, invalidation, and state management out of SFCs
 * PATTERN: Composable owns all non-UI state and handlers; SFC becomes template wiring
 * 
 * Supports:
 * - Parts (BlockInstance → PartInstance via partAssignments)
 * - Annotations (BlockInstance → AnnotationInstance via annotationAssignments)
 * - Events (BlockShape/PartShape → EventInstance via eventAssignments)
 */

import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useNotification } from '@/composables/useNotification'
import { useRelationshipCollectionData } from './useRelationshipCollectionData'
import { useRelationshipCollectionField } from './useRelationshipCollectionField'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { FieldContextType } from '@/composables/useFieldContext'
import type { GlobalFieldKey } from '@/constants/primitives'

/**
 * Name generation function type
 * LEARNING: Allows collection-specific name generation logic
 * WHY: Different collection types may have different naming patterns
 */
export type NameGenerator = (
  parentName: string,
  shapeName: string,
  parentId: string,
  shapeId: string,
  existingChildren: GlobalEntity<GlobalEntityKey>[]
) => string

/**
 * Relationship Collection Model
 */
export interface RelationshipCollectionModel {
  // Data
  validShapes: Ref<GlobalEntity<GlobalEntityKey>[]>
  existingChildren: Ref<GlobalEntity<GlobalEntityKey>[]>
  getChildForShape: (shapeId: string) => GlobalEntity<GlobalEntityKey> | undefined
  getShapeName: (shapeId: string) => string
  
  // Parent entity
  parentEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | undefined>
  shouldShow: ComputedRef<boolean>
  
  // Options field key
  optionsFieldKey: ComputedRef<string>
  
  // Inline creation support
  expandedPlaceholders: Ref<string[]>
  getNewChildEntity: (shapeId: string) => GlobalEntity<GlobalEntityKey>
  handleNewChildSaved: (shapeId: string, createdEntity: GlobalEntity<GlobalEntityKey>) => Promise<void>
  handleNewChildCancelled: (shapeId: string) => void
  
  // Expansion state
  expandedChildren: Ref<string[]>
  isPanelExpanded: (childId: string) => boolean
  
  // Bulk edit (optional - only for parts)
  bulkEditMode?: Ref<boolean>
  bulkEditData?: Ref<Record<string, unknown>>
  toggleBulkEditMode?: () => void
  applyBulkEdit?: () => Promise<void>
  handleBulkEditModalUpdate?: (value: boolean) => void
  handleBulkEditConfirm?: (data: Record<string, unknown>) => void
}

/**
 * Relationship Collection Options
 */
export interface UseRelationshipCollectionOptions {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  nameGenerator?: NameGenerator
  enableBulkEdit?: boolean
  bulkEditComposable?: (collectionModel: RelationshipCollectionModel) => {
    bulkEditMode: Ref<boolean>
    bulkEditData: Ref<Record<string, unknown>>
    toggleBulkEditMode: () => void
    applyBulkEdit: () => Promise<void>
    handleBulkEditModalUpdate: (value: boolean) => void
    handleBulkEditConfirm: (data: Record<string, unknown>) => void
  }
}

/**
 * useRelationshipCollection
 *
 * LEARNING: Generic collection-level composable for any relationship type
 * WHY: Provides unified pattern for parts, annotations, and events
 * PATTERN: Composable owns all non-UI state and handlers
 */
export function useRelationshipCollection(
  options: UseRelationshipCollectionOptions
): RelationshipCollectionModel {
  const { fieldContext, nameGenerator, enableBulkEdit = false, bulkEditComposable } = options
  
  const { getGlobalEntityById } = useGlobal()
  const queryClient = useQueryClient()
  const { error: notifyError } = useNotification()
  
  // Get field configuration
  const fieldConfig = useRelationshipCollectionField(fieldContext)
  const {
    childEntityKey,
    relationshipKey,
    optionsFieldKey,
    parentEntity: parentEntityFromField,
    parentTypeEntityKey,
    parentTypeRef,
    parentTypeEntity,
    shapeRefProperty: _shapeRefProperty
  } = fieldConfig
  
  // Determine shape entity key from child entity key
  // LEARNING: Derive shape entity key from child entity key
  // WHY: Pattern: partInstance → partShape, annotationInstance → annotationShape, eventInstance → eventShape
  // PATTERN: Replace 'Instance' with 'Shape' in entity key
  const shapeEntityKey = computed<GlobalEntityKey>(() => {
    const childKey = String(childEntityKey.value)
    if (childKey.endsWith('Instance')) {
      return childKey.replace('Instance', 'Shape') as GlobalEntityKey
    }
    // Fallback: assume shape key follows pattern
    return childKey.replace('instance', 'shape').replace('Instance', 'Shape') as GlobalEntityKey
  })
  
  // Determine shape reference property name
  // LEARNING: Derive shape ref property from shape entity key
  // WHY: Pattern: partShape → partShapeRef, annotationShape → annotationShapeRef
  // PATTERN: Lowercase first letter + 'Ref' suffix
  const shapeRefProperty = computed<string>(() => {
    const shapeKey = String(shapeEntityKey.value)
    const firstLower = shapeKey.charAt(0).toLowerCase() + shapeKey.slice(1)
    return `${firstLower}Ref`
  })
  
  // Get parent entity ID
  const parentEntityId = computed(() => fieldContext.entityId)
  
  // Use generic data composable
  const collectionData = useRelationshipCollectionData({
    parentEntityId,
    parentEntityKey: computed(() => fieldContext.entityKey),
    childEntityKey,
    shapeEntityKey,
    relationshipKey,
    optionsFieldKey,
    parentTypeEntityKey,
    parentTypeRef,
    shapeRefProperty: shapeRefProperty.value
  })
  
  const {
    validShapes,
    existingChildren,
    getChildForShape,
    getShapeName
  } = collectionData
  
  const parentEntity = parentEntityFromField
  
  const shouldShow = computed(() => {
    return validShapes.value.length > 0
  })
  
  // Get relationship CRUD
  const { create: createRelationship } = useRelationshipCrud(relationshipKey.value)
  
  // Inline creation state
  const expandedPlaceholders = ref<string[]>([])
  
  /**
   * LEARNING: Get temporary entity for new child creation
   * WHY: EntityCard needs an entity object to work with, even for new entities
   * PATTERN: Create temporary entity with `new-{shapeId}` ID prefix
   */
  const getNewChildEntity = (shapeId: string): GlobalEntity<GlobalEntityKey> => {
    // Get defaults from metadata
    let defaults: Record<string, unknown>
    try {
      defaults = getDefaultEntityValues(childEntityKey.value)
    } catch {
      defaults = { orderIndex: 0 }
    }
    
    // Base entity with defaults and required fields
    const baseEntity = {
      id: `new-${shapeId}`,
      entityKey: childEntityKey.value,
      [shapeRefProperty.value]: shapeId,
      ...defaults,
    } as GlobalEntity<GlobalEntityKey>
    
    if (!parentEntity.value) {
      return baseEntity
    }
    
    // Generate name if nameGenerator provided
    if (nameGenerator) {
      const parentName = (parentEntity.value as { name?: string }).name || 'Parent'
      const shapeName = getShapeName(shapeId)
      const name = nameGenerator(
        parentName,
        shapeName,
        parentEntity.value.id,
        shapeId,
        existingChildren.value
      )
      return {
        ...baseEntity,
        name,
      } as GlobalEntity<GlobalEntityKey>
    }
    
    // Default name generation: parentName-shapeName
    const parentName = (parentEntity.value as { name?: string }).name || 'Parent'
    const shapeName = getShapeName(shapeId)
    return {
      ...baseEntity,
      name: `${parentName}-${shapeName}`,
    } as GlobalEntity<GlobalEntityKey>
  }
  
  /**
   * LEARNING: Handle EntityCard save for new child
   * WHY: After EntityCard creates the entity, we need to create the relationship
   * PATTERN: EntityCard handles entity creation, we handle relationship + cleanup
   */
  const handleNewChildSaved = async (
    shapeId: string,
    createdEntity: GlobalEntity<GlobalEntityKey>
  ): Promise<void> => {
    if (!parentEntity.value) return
    
    try {
      await createRelationship({
        parent_id: parentEntity.value.id,
        child_id: createdEntity.id,
      })
      
      // Invalidate queries to refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [fieldContext.entityKey] }),
        queryClient.invalidateQueries({ queryKey: [childEntityKey.value] }),
        queryClient.invalidateQueries({ queryKey: [relationshipKey.value] }),
        queryClient.invalidateQueries({ queryKey: ['globalData'] }),
      ])
      
      // Collapse the placeholder
      const index = expandedPlaceholders.value.indexOf(shapeId)
      if (index !== -1) {
        expandedPlaceholders.value.splice(index, 1)
      }
    } catch (_error) {
      notifyError(`Failed to link ${childEntityKey.value} to ${fieldContext.entityKey}`)
    }
  }
  
  /**
   * LEARNING: Handle EntityCard cancel for new child
   * WHY: Just collapse the placeholder - no cleanup needed
   * PATTERN: Simple collapse of expansion panel
   */
  const handleNewChildCancelled = (shapeId: string): void => {
    const index = expandedPlaceholders.value.indexOf(shapeId)
    if (index !== -1) {
      expandedPlaceholders.value.splice(index, 1)
    }
  }
  
  // Expansion state
  const expandedChildren = ref<string[]>([])
  const isPanelExpanded = (childId: string): boolean => expandedChildren.value.includes(String(childId))
  
  // Build collection model first (without bulk edit)
  const collectionModel: RelationshipCollectionModel = {
    // Data
    validShapes,
    existingChildren,
    getChildForShape,
    getShapeName,
    
    // Parent entity
    parentEntity,
    shouldShow,
    
    // Options field key
    optionsFieldKey,
    
    // Inline creation
    expandedPlaceholders,
    getNewChildEntity,
    handleNewChildSaved,
    handleNewChildCancelled,
    
    // Expansion state
    expandedChildren,
    isPanelExpanded,
  }
  
  // Bulk edit (optional) - initialize after collection model is created
  let bulkEditMode: Ref<boolean> | undefined
  let bulkEditData: Ref<Record<string, unknown>> | undefined
  let toggleBulkEditMode: (() => void) | undefined
  let applyBulkEdit: (() => Promise<void>) | undefined
  let handleBulkEditModalUpdate: ((value: boolean) => void) | undefined
  let handleBulkEditConfirm: ((data: Record<string, unknown>) => void) | undefined
  
  if (enableBulkEdit && bulkEditComposable) {
    const bulkEdit = bulkEditComposable(collectionModel)
    bulkEditMode = bulkEdit.bulkEditMode
    bulkEditData = bulkEdit.bulkEditData
    toggleBulkEditMode = bulkEdit.toggleBulkEditMode
    applyBulkEdit = bulkEdit.applyBulkEdit
    handleBulkEditModalUpdate = bulkEdit.handleBulkEditModalUpdate
    handleBulkEditConfirm = bulkEdit.handleBulkEditConfirm
    
    // Add bulk edit to collection model
    collectionModel.bulkEditMode = bulkEditMode
    collectionModel.bulkEditData = bulkEditData
    collectionModel.toggleBulkEditMode = toggleBulkEditMode
    collectionModel.applyBulkEdit = applyBulkEdit
    collectionModel.handleBulkEditModalUpdate = handleBulkEditModalUpdate
    collectionModel.handleBulkEditConfirm = handleBulkEditConfirm
  }
  
  return collectionModel
}
