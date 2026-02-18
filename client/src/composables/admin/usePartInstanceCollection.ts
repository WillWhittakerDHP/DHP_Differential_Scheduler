import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/useEntity'
import { useNotification } from '@/composables/useNotification'
import { usePartInstanceData } from '@/composables/usePartInstanceData'
import { usePartInstanceBulkEdit, type PartInstanceBulkEditData } from '@/composables/admin/usePartInstanceBulkEdit'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import type { GlobalEntity } from '@/types/entities'

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
 * usePartInstanceCollection
 *
 * LEARNING: Collection-level composable for PartInstances within a BlockInstance.
 * WHY: Moves relationship creation, invalidation, name generation, and dialog state out of the SFC.
 * PATTERN: Composable owns all non-UI state and handlers; SFC becomes template wiring.
 * 
 * UPDATED: Added inline creation support with expandable placeholder cards
 * WHY: User requested inline creation instead of dialog for better UX
 * PATTERN: Expandable cards with form inputs, save creates entity + relationship
 * 
 * UPDATED: Made metadata-driven with optionsFieldKey parameter
 * WHY: Removes hardcoded field names, uses metadata-driven approach
 * PATTERN: Accept optionsFieldKey from metadata and pass to usePartInstanceData
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
   * LEARNING: Inline creation state for placeholder cards
   * WHY: Track which placeholder cards are expanded
   * PATTERN: Separate expansion state from existing PartInstances
   */
  const expandedPlaceholders = ref<string[]>([])

  /**
   * LEARNING: Get temporary entity for new PartInstance creation
   * WHY: EntityCard needs an entity object to work with, even for new entities
   * PATTERN: Create temporary entity with `new-{partShapeId}` ID prefix for EntityCard isNew detection
   * LEARNING: Use getDefaultEntityValues() to ensure all required fields are included
   * WHY: No hardcoded field lists - automatically includes all fields from metadata (including zeroOutPart, differentialOverride)
   * PATTERN: Use dynamic defaults from metadata instead of hardcoding fields
   */
  const getNewPartInstanceEntity = (partShapeId: string): GlobalEntity<'partInstance'> => {
    // PATTERN: Use getDefaultEntityValues() which uses metadata to determine defaults
    let defaults
    try {
      defaults = getDefaultEntityValues('partInstance')
    } catch (_error) {
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

    const blockInstanceEntity = blockInstance.value as import('@/types/entities').BlockInstanceEntity
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
   * LEARNING: Handle EntityCard save for new PartInstance
   * WHY: After EntityCard creates the entity, we need to create the relationship
   * PATTERN: EntityCard handles entity creation, we handle relationship + cleanup
   * FIX: Use entity from saved event instead of looking it up (avoids timing issues)
   */
  const handleNewPartInstanceSaved = async (
    partShapeId: string,
    createdEntity: GlobalEntity<'partInstance'>
  ): Promise<void> => {
    if (!blockInstance.value) return

    try {
      const blockInstanceEntity = blockInstance.value as import('@/types/entities').BlockInstanceEntity
      
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
      notifyError('Failed to link PartInstance to BlockInstance')
    }
  }

  /**
   * LEARNING: Handle EntityCard cancel for new PartInstance
   * WHY: Just collapse the placeholder - no cleanup needed since EntityCard handles its own state
   * PATTERN: Simple collapse of expansion panel
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
