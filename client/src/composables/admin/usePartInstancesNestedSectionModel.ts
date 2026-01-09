import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'
import { useGlobal } from '@/composables/useGlobal'
import { useRelationshipCrud } from '@/composables/useRelationship'
import { useEntityCrud } from '@/composables/useEntity'
import { useNotification } from '@/composables/useNotification'
import { usePartInstanceData } from '@/composables/usePartInstanceData'
import { usePartInstanceBulkEdit } from '@/composables/admin/usePartInstanceBulkEdit'
import type { GlobalEntity } from '@/types/entities'

export interface PartInstancesNestedSectionModel {
  validPartShapes: Ref<GlobalEntity<'partShape'>[]>
  existingPartInstances: Ref<GlobalEntity<'partInstance'>[]>
  getPartInstanceForShape: (partShapeId: string) => GlobalEntity<'partInstance'> | undefined
  getPartShapeName: (partShapeId: string) => string

  blockInstance: ComputedRef<GlobalEntity<'blockInstance'> | undefined>
  shouldShowPartInstances: ComputedRef<boolean>

  // Inline creation support (EntityCard-based)
  expandedPlaceholders: Ref<string[]>
  getNewPartInstanceEntity: (partShapeId: string) => GlobalEntity<'partInstance'>
  handleNewPartInstanceSaved: (partShapeId: string) => Promise<void>
  handleNewPartInstanceCancelled: (partShapeId: string) => void

  bulkEditMode: Ref<boolean>
  bulkEditData: Ref<Record<string, number | null>>
  toggleBulkEditMode: () => void
  applyPartInstanceBulkEdit: () => Promise<void>

  expandedPartInstances: Ref<string[]>
  isPanelExpanded: (partInstanceId: string) => boolean
}

/**
 * usePartInstancesNestedSectionModel
 *
 * LEARNING: "Component model" composable for PartInstancesNestedSection.
 * WHY: Moves relationship creation, invalidation, name generation, and dialog state out of the SFC.
 * PATTERN: Composable owns all non-UI state and handlers; SFC becomes template wiring.
 * 
 * UPDATED: Added inline creation support with expandable placeholder cards
 * WHY: User requested inline creation instead of dialog for better UX
 * PATTERN: Expandable cards with form inputs, save creates entity + relationship
 */
export function usePartInstancesNestedSectionModel(blockInstanceId: ComputedRef<string>): PartInstancesNestedSectionModel {
  const { getGlobalEntityById } = useGlobal()
  const queryClient = useQueryClient()
  const { success: _notifySuccess, error: notifyError } = useNotification()
  // NOTE: notifySuccess not used after refactor - EntityCard shows its own success messages

  const { create: createActiveConstituentsRelationship } = useRelationshipCrud('activeConstituents')
  const { create: _createPartInstance } = useEntityCrud('partInstance')
  // NOTE: createPartInstance is available but EntityCard handles entity creation
  // We only need to create the relationship after EntityCard saves

  const partInstanceData = usePartInstanceData({ blockInstanceId })
  const {
    validPartShapes,
    existingPartInstances: existingPartInstancesRef,
    getPartInstanceForShape,
    getPartShapeName,
    generatePartInstanceName,
  } = partInstanceData
  
  // Convert Ref to ComputedRef for interface compatibility
  const existingPartInstances = computed(() => existingPartInstancesRef.value)

  const blockInstance = computed(() => getGlobalEntityById('blockInstance', blockInstanceId.value))

  const blockShape = computed(() => {
    if (!blockInstance.value) return null
    const blockInstanceEntity = blockInstance.value as import('@/types/entities').BlockInstanceEntity
    return getGlobalEntityById('blockShape', blockInstanceEntity.blockShapeRef) || null
  })

  const shouldShowPartInstances = computed(() => {
    if (!blockShape.value) return false
    return blockShape.value.constituable === true
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
   */
  const getNewPartInstanceEntity = (partShapeId: string): GlobalEntity<'partInstance'> => {
    if (!blockInstance.value) {
      // Return minimal entity if blockInstance not ready
      return {
        id: `new-${partShapeId}`,
        entityKey: 'partInstance',
        orderIndex: 0,
        partShapeRef: partShapeId,
        name: '',
        active: true,
        onSite: false,
        clientPresent: false,
        moveable: false,
        baseTime: 0,
        rateOverBaseTime: 0,
        baseFee: 0,
        rateOverBaseFee: 0,
      } as GlobalEntity<'partInstance'>
    }

    const blockInstanceEntity = blockInstance.value as import('@/types/entities').BlockInstanceEntity
    const blockInstanceName = blockInstanceEntity.name || 'BlockInstance'
    const partShape = getGlobalEntityById('partShape', partShapeId)
    const partShapeName = partShape?.name || 'PartShape'

    const autoName = generatePartInstanceName(
      blockInstanceName,
      partShapeName,
      blockInstanceEntity.id,
      partShapeId
    )

    return {
      id: `new-${partShapeId}`,
      entityKey: 'partInstance',
      orderIndex: 0,
      partShapeRef: partShapeId,
      name: autoName,
      active: true,
      onSite: false,
      clientPresent: false,
      moveable: false,
      baseTime: 0,
      rateOverBaseTime: 0,
      baseFee: 0,
      rateOverBaseFee: 0,
    } as GlobalEntity<'partInstance'>
  }

  /**
   * LEARNING: Handle EntityCard save for new PartInstance
   * WHY: After EntityCard creates the entity, we need to create the relationship
   * PATTERN: EntityCard handles entity creation, we handle relationship + cleanup
   */
  const handleNewPartInstanceSaved = async (partShapeId: string): Promise<void> => {
    if (!blockInstance.value) return

    try {
      const blockInstanceEntity = blockInstance.value as import('@/types/entities').BlockInstanceEntity
      
      // Get the newly created PartInstance (it should now exist for this shape)
      // EntityCard already created it, we just need to link it
      const newPartInstance = getPartInstanceForShape(partShapeId)
      
      if (newPartInstance) {
        // Create the relationship to link PartInstance to BlockInstance
        await createActiveConstituentsRelationship({
          parent_id: blockInstanceEntity.id,
          child_id: newPartInstance.id,
        })

        // Invalidate queries to refresh data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['blockInstance'] }),
          queryClient.invalidateQueries({ queryKey: ['partInstance'] }),
          queryClient.invalidateQueries({ queryKey: ['activeConstituents'] }),
          queryClient.invalidateQueries({ queryKey: ['globalData'] }),
        ])
      }

      // Collapse the placeholder
      const index = expandedPlaceholders.value.indexOf(partShapeId)
      if (index !== -1) {
        expandedPlaceholders.value.splice(index, 1)
      }
    } catch (error) {
      // Failed to create relationship
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
  const { bulkEditMode, bulkEditData, toggleBulkEditMode, applyPartInstanceBulkEdit } = partInstanceBulkEditComposable
  
  // Type assertions to match interface expectations
  const bulkEditModeRef = bulkEditMode as Ref<boolean>
  const bulkEditDataRef = bulkEditData as Ref<Record<string, number | null>>

  const expandedPartInstances = ref<string[]>([])
  const isPanelExpanded = (partInstanceId: string): boolean => expandedPartInstances.value.includes(String(partInstanceId))

  return {
    validPartShapes,
    existingPartInstances,
    getPartInstanceForShape,
    getPartShapeName,
    blockInstance,
    shouldShowPartInstances,
    // Inline creation (EntityCard-based)
    expandedPlaceholders,
    getNewPartInstanceEntity,
    handleNewPartInstanceSaved,
    handleNewPartInstanceCancelled,
    // Bulk edit
    bulkEditMode: bulkEditModeRef,
    bulkEditData: bulkEditDataRef,
    toggleBulkEditMode,
    applyPartInstanceBulkEdit,
    expandedPartInstances,
    isPanelExpanded,
  }
}


