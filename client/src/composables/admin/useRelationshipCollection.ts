/**
 * WHY: useRelationshipCollection Composable
LEARNING: Generic collection-level ...
 */
import { computed, ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import { useQueryClient } from '@tanstack/vue-query'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useNotification } from '@/composables/useNotification'
import { useRelationshipCollectionData } from './useRelationshipCollectionData'
import { useRelationshipCollectionField } from './useRelationshipCollectionField'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { createLogger } from '@/utils/logger'
import type { RelationshipCollectionModel, UseRelationshipCollectionOptions } from '@/types/admin/relationshipCollection'

const logger = createLogger('useRelationshipCollection')

export type {
  NameGenerator,
  RelationshipCollectionModel,
  UseRelationshipCollectionOptions
} from '@/types/admin/relationshipCollection'

/**
LEARNING: Generic collection-level composable ...
 */
export function useRelationshipCollection(
  options: UseRelationshipCollectionOptions
): RelationshipCollectionModel {
  const { fieldContext, nameGenerator, enableBulkEdit = false, bulkEditComposable } = options
  
  const queryClient = useQueryClient()
  const { error: notifyError } = useNotification()
  
  const fieldConfig = useRelationshipCollectionField(fieldContext)
  const {
    childEntityKey,
    relationshipKey,
    optionsFieldKey,
    parentEntity: parentEntityFromField,
    parentTypeEntityKey,
    parentTypeRef
    // LEARNING: shapeRefProperty removed - not used in this composable
  } = fieldConfig
  
  // WHY: Pattern: partInstance → partShape, annotationInstance → annotationShape, eventInstance → eventShape
  // PATTERN: Replace 'Instance' with 'Shape' in entity key
  const shapeEntityKey = computed<GlobalEntityKey>(() => {
    const childKey = String(childEntityKey.value)
    if (childKey.endsWith('Instance')) {
      return childKey.replace('Instance', 'Shape') as GlobalEntityKey
    }
    return childKey.replace('instance', 'shape').replace('Instance', 'Shape') as GlobalEntityKey
  })
  
  // WHY: Pattern: partShape → partShapeRef, annotationShape → annotationShapeRef
  // PATTERN: Lowercase first letter + 'Ref' suffix
  const shapeRefProperty = computed<string>(() => {
    const shapeKey = String(shapeEntityKey.value)
    const firstLower = shapeKey.charAt(0).toLowerCase() + shapeKey.slice(1)
    return `${firstLower}Ref`
  })
  
  const parentEntityId = computed(() => fieldContext.entityId)
  
  // PATTERN: Add type assertion since we know it should be non-null at runtime
  const collectionData = useRelationshipCollectionData({
    parentEntityId,
    parentEntityKey: computed(() => fieldContext.entityKey),
    childEntityKey,
    shapeEntityKey,
    relationshipKey,
    optionsFieldKey,
    parentTypeEntityKey: parentTypeEntityKey as ComputedRef<GlobalEntityKey>,
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
  
  const { create: createRelationship } = useRelationshipCrud(relationshipKey.value as GlobalRelationshipKey)
  
  const expandedPlaceholders = ref<string[]>([])
  
  /**

PATTERN: Set shape reference property explicitly, matching usePartI...
   */
  const getNewChildEntity = (shapeId: string): GlobalEntity<GlobalEntityKey> => {
    let defaults: Record<string, unknown>
    try {
      defaults = getDefaultEntityValues(childEntityKey.value)
    } catch {
      defaults = { orderIndex: 0 }
    }
    
    // PATTERN: Computed property derives from shape entity key
    const shapeRefProp = shapeRefProperty.value
    
    // PATTERN: Spread defaults first, then set shape reference explicitly
    const baseEntity = {
      id: `new-${shapeId}`,
      entityKey: childEntityKey.value,
      ...defaults,
      [shapeRefProp]: shapeId, // Set shape reference after defaults to ensure correct value
    } as GlobalEntity<GlobalEntityKey>
    
    if (!parentEntity.value) {
      return baseEntity
    }
    
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
    
    const parentName = (parentEntity.value as { name?: string }).name || 'Parent'
    const shapeName = getShapeName(shapeId)
    return {
      ...baseEntity,
      name: `${parentName}-${shapeName}`,
    } as GlobalEntity<GlobalEntityKey>
  }
  
  /**
   * 
   */
  const handleNewChildSaved = async (
    shapeId: string,
    createdEntity: GlobalEntity<GlobalEntityKey>
  ): Promise<void> => {
    if (!parentEntity.value) return
    
    try {
      // PATTERN: Manually update cache to include the new entity, then create relationship
      queryClient.setQueryData<GlobalData>(['globalData'], (old: GlobalData | undefined) => {
        if (!old) return old
        
        const rawEntities = old.entities[childEntityKey.value]
        const currentEntities = rawEntities !== undefined && rawEntities !== null ? rawEntities : []
        const entityExists = currentEntities.some(e => String(e.id) === String(createdEntity.id))
        
        if (!entityExists) {
          return {
            ...old,
            entities: {
              ...old.entities,
              [childEntityKey.value]: [...currentEntities, createdEntity],
            },
          }
        }
        
        return old
      })
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      await createRelationship({
        parentId: parentEntity.value.id,
        childId: createdEntity.id,
      })
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [fieldContext.entityKey] }),
        queryClient.invalidateQueries({ queryKey: [childEntityKey.value] }),
        queryClient.invalidateQueries({ queryKey: [relationshipKey.value] }),
        queryClient.invalidateQueries({ queryKey: ['globalData'] }),
      ])
      
      const index = expandedPlaceholders.value.indexOf(shapeId)
      if (index !== -1) {
        expandedPlaceholders.value.splice(index, 1)
      }
    } catch (error) {
      logger.error(`Failed to link ${childEntityKey.value} to ${fieldContext.entityKey}:`, error)
      notifyError(`Failed to link ${childEntityKey.value} to ${fieldContext.entityKey}`)
    }
  }
  
  /**
   */
  const handleNewChildCancelled = (shapeId: string): void => {
    const index = expandedPlaceholders.value.indexOf(shapeId)
    if (index !== -1) {
      expandedPlaceholders.value.splice(index, 1)
    }
  }
  
  const expandedChildren = ref<string[]>([])
  const isPanelExpanded = (childId: string): boolean => expandedChildren.value.includes(String(childId))
  
  const collectionModel: RelationshipCollectionModel = {
    validShapes,
    existingChildren,
    getChildForShape,
    getShapeName,
    
    parentEntity,
    shouldShow,
    
    optionsFieldKey,
    
    expandedPlaceholders,
    getNewChildEntity,
    handleNewChildSaved,
    handleNewChildCancelled,
    handleDeleteChildById,
    handleDeleteChild,

    expandedChildren,
    isPanelExpanded,
  }
  
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
    
    collectionModel.bulkEditMode = bulkEditMode
    collectionModel.bulkEditData = bulkEditData
    collectionModel.toggleBulkEditMode = toggleBulkEditMode
    collectionModel.applyBulkEdit = applyBulkEdit
    collectionModel.handleBulkEditModalUpdate = handleBulkEditModalUpdate
    collectionModel.handleBulkEditConfirm = handleBulkEditConfirm
  }
  
  return collectionModel
}
