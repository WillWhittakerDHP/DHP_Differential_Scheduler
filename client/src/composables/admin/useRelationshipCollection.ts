/**
 * WHY: useRelationshipCollection Composable
 */
import { computed, ref, type Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import { useQueryClient } from '@tanstack/vue-query'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useNotification } from '@/composables/useNotification'
import { useRelationshipCollectionData } from './useRelationshipCollectionData'
import { useRelationshipCollectionField } from './useRelationshipCollectionField'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { createLogger } from '@/utils/logger'
import type { RelationshipCollectionModel, UseRelationshipCollectionOptions } from '@/types/admin/relationshipCollection'
import { childEntityKeyToShapeEntityKey, shapeRefPropertyForChild } from '@/utils/admin/relationshipCollectionShape'
import { buildNewRelationshipChildEntity } from '@/utils/admin/relationshipCollectionNewChild'
import { appendEntityToGlobalDataEntities } from '@/utils/admin/globalDataAppendChildEntity'

const logger = createLogger('useRelationshipCollection')

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
    parentContext,
  } = fieldConfig
  const { parentEntity: parentEntityFromField, parentTypeEntityKey, parentTypeRef } = parentContext
  
  // WHY: Pattern: partInstance → partShape, annotationInstance → annotationShape, eventInstance → eventShape
  // PATTERN: Replace 'Instance' with 'Shape' in entity key
  const shapeEntityKey = computed<GlobalEntityKey>(() =>
    childEntityKeyToShapeEntityKey(String(childEntityKey.value))
  )

  const shapeRefProperty = computed<string>(() =>
    shapeRefPropertyForChild(String(childEntityKey.value), String(shapeEntityKey.value))
  )
  
  const parentEntityId = computed(() => fieldContext.state.entityId)
  
  // PATTERN: Options accept childEntityKey | null; implementation casts to GlobalEntityKey
  const collectionData = useRelationshipCollectionData({
    parentEntityId,
    parentEntityKey: computed(() => fieldContext.state.entityKey),
    childEntityKey,
    shapeEntityKey,
    relationshipKey,
    optionsFieldKey,
    parentTypeEntityKey,
    parentTypeRef,
    shapeRefProperty: shapeRefProperty.value
  } as import('@/types/admin/relationshipCollectionData').UseRelationshipCollectionDataOptions)
  
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
  
  const { create: createRelationship, remove: removeRelationship } = useRelationshipCrud(relationshipKey.value as GlobalRelationshipKey)
  
  const expandedPlaceholders = ref<string[]>([])
  
  /**

PATTERN: Set shape reference property explicitly, matching usePartI...
   */
  const getNewChildEntity = (shapeId: string): GlobalEntity<GlobalEntityKey> => {
    let defaults: Record<string, unknown>
    try {
      defaults = getDefaultEntityValues(childEntityKey.value)
    } catch (err) {
      logger.warn('getDefaultEntityValues failed, using fallback', { childEntityKey: childEntityKey.value, error: err })
      defaults = { orderIndex: 0 }
    }
    const children = existingChildren.value.filter((c): c is GlobalEntity<GlobalEntityKey> => c != null)
    return buildNewRelationshipChildEntity({
      shapeId,
      childEntityKey: childEntityKey.value,
      shapeRefProperty: shapeRefProperty.value,
      defaults,
      parentEntity: parentEntity.value,
      getShapeName,
      nameGenerator,
      existingChildren: children,
    })
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
      queryClient.setQueryData<GlobalData>(['globalData'], (old: GlobalData | undefined) =>
        appendEntityToGlobalDataEntities(old, childEntityKey.value, createdEntity)
      )
      
      await new Promise(resolve => setTimeout(resolve, 0))
      
      await createRelationship({
        parentId: parentEntity.value.id,
        childId: createdEntity.id,
      })
      
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [fieldContext.state.entityKey] }),
        queryClient.invalidateQueries({ queryKey: [childEntityKey.value] }),
        queryClient.invalidateQueries({ queryKey: [relationshipKey.value] }),
        queryClient.invalidateQueries({ queryKey: ['globalData'] }),
      ])
      
      const index = expandedPlaceholders.value.indexOf(shapeId)
      if (index !== -1) {
        expandedPlaceholders.value.splice(index, 1)
      }
    } catch (error) {
      logger.error(`Failed to link ${childEntityKey.value} to ${fieldContext.state.entityKey}:`, error)
      notifyError(`Failed to link ${childEntityKey.value} to ${fieldContext.state.entityKey}`)
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

  const handleDeleteChildById = async (id: string): Promise<void> => {
    if (!parentEntity.value) return
    try {
      await removeRelationship(toGlobalEntityId(parentEntity.value.id), toGlobalEntityId(id))
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [fieldContext.state.entityKey] }),
        queryClient.invalidateQueries({ queryKey: [childEntityKey.value] }),
        queryClient.invalidateQueries({ queryKey: [relationshipKey.value] }),
        queryClient.invalidateQueries({ queryKey: ['globalData'] }),
      ])
    } catch (error) {
      logger.error(`Failed to remove child ${id} from ${fieldContext.state.entityKey}:`, error)
      notifyError(`Failed to remove child`)
    }
  }

  const handleDeleteChild = async (entity: GlobalEntity<GlobalEntityKey>): Promise<void> => {
    await handleDeleteChildById(String(entity.id))
  }
  
  const expandedChildren = ref<string[]>([])
  const isPanelExpanded = (childId: string): boolean => expandedChildren.value.includes(String(childId))
  
  const collectionModel: RelationshipCollectionModel = {
    validShapes,
    existingChildren,
    getChildForShape,
    getShapeName,

    parentEntity: parentEntity as import('vue').ComputedRef<
      GlobalEntity<GlobalEntityKey> | undefined
    >,
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
