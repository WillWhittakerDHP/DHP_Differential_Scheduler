import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useNotification } from '@/composables/useNotification'
import { usePartInstanceData } from '@/composables/usePartInstanceData'
import { usePartInstanceBulkEdit, type PartInstanceBulkEditData } from '@/composables/admin/usePartInstanceBulkEdit'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { BlockInstanceEntity, GlobalEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'

const logger = createLogger('usePartInstanceCollection')

export interface PartInstanceCollectionModel {
  validPartShapes: Ref<GlobalEntity<'partShape'>[]>
  existingPartInstances: Ref<GlobalEntity<'partInstance'>[]>
  getPartInstanceForShape: (partShapeId: string) => GlobalEntity<'partInstance'> | undefined
  getPartShapeName: (partShapeId: string) => string

  blockInstance: ComputedRef<GlobalEntity<'blockInstance'> | undefined>
  shouldShowPartInstances: ComputedRef<boolean>
  
  optionsFieldKey: ComputedRef<string>

  expandedPlaceholders: Ref<string[]>
  getNewPartInstanceEntity: (partShapeId: string) => GlobalEntity<'partInstance'>
  handleNewPartInstanceSaved: (partShapeId: string, createdEntity: GlobalEntity<'partInstance'>) => Promise<void>
  handleNewPartInstanceCancelled: (partShapeId: string) => void

  bulkEditMode: Ref<boolean>
  bulkEditData: Ref<PartInstanceBulkEditData>
  toggleBulkEditMode: () => void
  applyPartInstanceBulkEdit: () => Promise<void>
  handleBulkEditModalUpdate: (value: boolean) => void
  handleBulkEditConfirm: (data: PartInstanceBulkEditData) => void

  expandedPartInstances: Ref<string[]>
  isPanelExpanded: (partInstanceId: string) => boolean
}

/**
 * WHY: usePartInstanceCollection
LEARNING: Collection-level composable for Part...
 */
export function usePartInstanceCollection(
  blockInstanceId: ComputedRef<string>,
  optionsFieldKey: ComputedRef<string>
): PartInstanceCollectionModel {
  const { getGlobalEntityById } = useGlobal()
  const queryClient = useQueryClient()
  const { success: _notifySuccess, error: notifyError } = useNotification()

  const { create: createPartAssignmentsRelationship } = useRelationshipCrud('partAssignments')
  const { create: _createPartInstance } = useEntityCrud('partInstance')

  const partInstanceData = usePartInstanceData({ 
    blockInstanceId
  })
  const {
    validPartShapes,
    existingPartInstances: existingPartInstancesRef,
    getPartInstanceForShape,
    getPartShapeName,
    generatePartInstanceName,
  } = partInstanceData
  
  const existingPartInstances = computed(() => existingPartInstancesRef.value)

  const blockInstance = computed(() => getGlobalEntityById('blockInstance', blockInstanceId.value))

  // FIX: blockShape computed is unused - removed to fix TS6133 error

  const shouldShowPartInstances = computed(() => {
    // WHY: Data-driven approach - if validPartShapes exists, show the panel
    // PATTERN: Check actual data availability instead of flag
    return validPartShapes.value.length > 0
  })

  /**
   * WHY: /**
LEARNING: Inline creation state for placeholder cards
PATTERN: Separ...
   */
  const expandedPlaceholders = ref<string[]>([])

  /**
   */
  const getNewPartInstanceEntity = (partShapeId: string): GlobalEntity<'partInstance'> => {
    // PATTERN: Use getDefaultEntityValues() which uses metadata to determine defaults
    let defaults
    try {
      defaults = getDefaultEntityValues('partInstance')
    } catch (_error) {
      logger.error('Failed to get default entity values for partInstance', { error: _error })
      defaults = { orderIndex: 0 }
    }
    
    const baseEntity = {
      id: `new-${partShapeId}`,
      entityKey: 'partInstance' as const,
      partShapeRef: partShapeId,
      ...defaults,
    } as GlobalEntity<'partInstance'>

    if (!blockInstance.value) {
      return baseEntity
    }

    const blockInstanceEntity = blockInstance.value as BlockInstanceEntity
    const blockInstanceName = blockInstanceEntity.name || 'BlockInstance'
    const partShape = getGlobalEntityById('partShape', partShapeId)
    const rawName = partShape?.name
    const partShapeName = rawName !== undefined && rawName !== null && rawName !== '' ? rawName : 'PartShape'

    const autoName = generatePartInstanceName(
      blockInstanceName,
      partShapeName,
      blockInstanceEntity.id,
      partShapeId
    )

    return {
      ...baseEntity,
      name: autoName,
    } as GlobalEntity<'partInstance'>
  }

  /**
   * FIX: Use entity from saved event instead of looking it up (avoids timing issues)
   */
  const handleNewPartInstanceSaved = async (
    partShapeId: string,
    createdEntity: GlobalEntity<'partInstance'>
  ): Promise<void> => {
    if (!blockInstance.value) return

    try {
      const blockInstanceEntity = blockInstance.value as BlockInstanceEntity
      
      // This avoids timing issues where getPartInstanceForShape might not find it yet
      await createPartAssignmentsRelationship({
        parentId: blockInstanceEntity.id,
        childId: createdEntity.id,
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['blockInstance'] }),
        queryClient.invalidateQueries({ queryKey: ['partInstance'] }),
        queryClient.invalidateQueries({ queryKey: ['partAssignments'] }),
        queryClient.invalidateQueries({ queryKey: ['globalData'] }),
      ])

      const index = expandedPlaceholders.value.indexOf(partShapeId)
      if (index !== -1) {
        expandedPlaceholders.value.splice(index, 1)
      }
    } catch (_error) {
      logger.error('Failed to link PartInstance to BlockInstance', { error: _error })
      notifyError('Failed to link PartInstance to BlockInstance')
    }
  }

  /**
   * WHY: Just collapse the placeholder - no cleanup needed since EntityCard handles its own state
   */
  const handleNewPartInstanceCancelled = (partShapeId: string): void => {
    const index = expandedPlaceholders.value.indexOf(partShapeId)
    if (index !== -1) {
      expandedPlaceholders.value.splice(index, 1)
    }
  }

  const partInstanceBulkEditComposable = usePartInstanceBulkEdit({ existingPartInstances: existingPartInstances as ComputedRef<GlobalEntity<'partInstance'>[]> })
  const { 
    bulkEditMode, 
    bulkEditData, 
    toggleBulkEditMode, 
    applyPartInstanceBulkEdit,
    handleBulkEditModalUpdate,
    handleBulkEditConfirm
  } = partInstanceBulkEditComposable
  
  const bulkEditModeRef = bulkEditMode as Ref<boolean>
  // FIX: bulkEditData is already Ref<PartInstanceBulkEditData> from usePartInstanceBulkEdit
  const bulkEditDataRef = bulkEditData

  const expandedPartInstances = ref<string[]>([])
  const isPanelExpanded = (partInstanceId: string): boolean => expandedPartInstances.value.includes(partInstanceId)

  return {
    validPartShapes,
    existingPartInstances,
    getPartInstanceForShape,
    getPartShapeName,
    blockInstance,
    shouldShowPartInstances,
    optionsFieldKey,
    expandedPlaceholders,
    getNewPartInstanceEntity,
    handleNewPartInstanceSaved,
    handleNewPartInstanceCancelled,
    bulkEditMode: bulkEditModeRef,
    bulkEditData: bulkEditDataRef as Ref<PartInstanceBulkEditData>,
    toggleBulkEditMode,
    applyPartInstanceBulkEdit,
    handleBulkEditModalUpdate,
    handleBulkEditConfirm,
    expandedPartInstances,
    isPanelExpanded,
  }
}
