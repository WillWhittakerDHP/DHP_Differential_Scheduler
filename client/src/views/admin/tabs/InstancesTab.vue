<!--
  LEARNING: Instances Tab Component with BlockInstance Grouping by BlockShape Tabs
  WHY: Displays BlockInstances grouped by BlockShape in separate tabs for better organization
  PATTERN: VTabs/VWindow for tab navigation, composables for data access
  COMPARISON: React uses Ant Design Tabs. Vue uses Vuetify VTabs with VWindow
  RESOURCE: https://vuetifyjs.com/en/components/tabs/
-->
<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, onUnmounted, nextTick, type Ref, type ComponentPublicInstance } from 'vue'
import { animations, handleEnd, performTransfer } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import EntityCard from '@/components/admin/generic/EntityCard.vue'
import ShapesSubTab from './ShapesSubTab.vue'
import { useInstanceGrouping } from '@/composables/admin/useInstanceGrouping'
import { useInstanceBulkEdit } from '@/composables/admin/useInstanceBulkEdit'
import { useExpansionState } from '@/composables/admin/useExpansionState'
import { useEntityGrouping } from '@/composables/admin/useEntityGrouping'
import { useEntityDragHandlers } from '@/composables/admin/useEntityDragHandlers'
import { useEntityTabState } from '@/composables/admin/useEntityTabState'
import { useEntityCrud } from '@/composables/useEntity'
import { usePrimitiveMutation } from '@/composables/entityCrud/usePrimitiveMutation'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { getDefaultEntityValues } from '@/utils/entityDefaults'
import { categorizeFieldsBySection, type StatusButtonField } from '@/utils/forms/fieldSectionCategorization'
import type { GlobalFieldKey } from '@/constants/primitives'
import { isRef } from 'vue'
import { useGlobal } from '@/composables/useGlobal'

/**
 * LEARNING: Reactive active tab state
 * WHY: Tracks which tab is currently active (BlockShape ID or 'shapes')
 * PATTERN: ref for reactive string value
 */
const activeTab = ref<string>('')

/**
 * LEARNING: Use instance grouping composable for grouping logic and metadata
 * WHY: Moves grouping logic out of component into reusable composable
 * PATTERN: Composable handles BlockInstance grouping and metadata (expansion state moved to useExpansionState)
 */
const instanceGroupingComposable = useInstanceGrouping({ activeTab })
const {
  sortedBlockShapes,
  blockInstancesCountByShape,
  blockShapeComposable,
  blockShapeStateControl,
  blockShapeValidCascades
} = instanceGroupingComposable

/**
 * LEARNING: Use entity grouping composable for filtered instances grouped by BlockShape
 * WHY: Extracts filtering and sorting logic from component to generic composable
 * PATTERN: Generic composable provides filtered instances grouped by BlockShape
 */
const { entitiesByGroup: blockInstancesByShape } = useEntityGrouping({
  entityKey: 'blockInstance',
  groupKey: 'blockShape',
  groupBy: (instance) => String(instance.blockShapeRef)
})

/**
 * LEARNING: Use expansion state composable for expansion state management
 * WHY: Moves expansion state logic out of component into reusable composable
 * PATTERN: Composable handles expansion state (single shared array, like ShapesTab)
 */
const expansionStateComposable = useExpansionState()
const { expandedEntities: expandedInstances, isPanelExpanded } = expansionStateComposable

/**
 * LEARNING: Use instance bulk edit composable for bulk edit logic
 * WHY: Moves bulk edit logic out of component into reusable composable
 * PATTERN: Composable handles bulk edit state, form data, and operations
 */
const instanceBulkEditComposable = useInstanceBulkEdit({
  blockInstancesByShape
})
const {
  bulkEditMode,
  getBulkEditBaseSqFt,
  toggleBulkEditMode,
  applyBulkEdit
} = instanceBulkEditComposable

/**
 * LEARNING: Entity CRUD composable for BlockInstance
 * WHY: Provides orderIndex operations for drag-and-drop
 * PATTERN: useEntityCrud composable wraps Vue Query mutations
 */
const { patchOrderIndex: patchBlockInstanceOrderIndex } = useEntityCrud('blockInstance')

/**
 * LEARNING: Entity CRUD composable for BlockShape
 * WHY: Provides access to BlockShape entities for entity card display
 * PATTERN: useEntityCrud composable wraps Vue Query queries
 */
const { entities: _blockShapes } = useEntityCrud('blockShape')

const { globalData } = useGlobal()

/**
 * LEARNING: Component-child detection (instanceComponents relationship)
 * WHY: Instances used only as components should be visually grouped and clearly marked as "not in booking main lists".
 * PATTERN: Build a Set of all child blockInstance IDs from instanceComponents relationships.
 */
const componentChildIds = computed((): Set<string> => {
  const relationships = globalData.value?.relationships?.instanceComponents ?? []

  return relationships.reduce((acc, rel) => {
    if (rel.relationshipKind !== 'instanceComponents') return acc
    rel.children.forEach((child) => {
      acc.add(String(child.id))
    })
    return acc
  }, new Set<string>())
})

type BlockInstanceEntityWithFlags = GlobalEntity<'blockInstance'> & { dependent?: boolean }

const isInstanceDependent = (instance: GlobalEntity<'blockInstance'>): boolean => {
  return (instance as BlockInstanceEntityWithFlags).dependent === true
}

const isComponentChild = (instance: GlobalEntity<'blockInstance'>): boolean => {
  return componentChildIds.value.has(String(instance.id))
}

/**
 * LEARNING: Expansion state for BlockShape entity cards
 * WHY: Separate expansion state for BlockShape entity cards (different from BlockInstances)
 * PATTERN: Use separate expansion state composable instance
 */
const blockShapeExpansionState = useExpansionState()
const { expandedEntities: expandedBlockShapes, isPanelExpanded: isBlockShapeExpanded } = blockShapeExpansionState

/**
 * LEARNING: Handle save on existing BlockShape - collapse the card
 * WHY: User expects card to collapse after saving changes
 * PATTERN: Remove entity ID from expandedBlockShapes to collapse the panel
 */
const handleExistingBlockShapeSaved = (entity: GlobalEntity<GlobalEntityKey>) => {
  // Collapse the card by removing from expanded list
  expandedBlockShapes.value = expandedBlockShapes.value.filter(id => id !== String(entity.id))
}

/**
 * LEARNING: Primitive mutation for single-field updates
 * WHY: More efficient than full PUT for single field changes, uses PATCH with {key, value} format
 * PATTERN: usePrimitiveMutation for field-level updates, useEntityCrud.update for multi-field updates
 */
const primitiveMutation = usePrimitiveMutation('blockInstance')

/**
 * LEARNING: Admin config for status button fields
 * WHY: Config-driven status buttons defined in adminConfig.ts
 * PATTERN: Extract statusButtonFields from field categorization
 */
const adminConfig = useAdminConfig()
const blockInstanceConfig = computed(() => adminConfig.getInstanceConfig('blockInstance').value)

/**
 * LEARNING: Status button fields from config
 * WHY: Config-driven approach - booleans with renderAs: 'statusButton' render as clickable VChips
 * PATTERN: Categorize fields and extract status buttons for panel title rendering
 */
type BlockInstanceStatusButtonField = Omit<StatusButtonField, 'key'> & { key: GlobalFieldKey<'blockInstance'> }

const statusButtonFields = computed((): BlockInstanceStatusButtonField[] => {
  const fieldsConfig = blockInstanceConfig.value?.fields
  if (!fieldsConfig) return []
  
  // Use categorization utility to extract status button fields
  const categorized = categorizeFieldsBySection([], fieldsConfig)
  return categorized.statusButtonFields.map((f) => ({
    ...f,
    key: f.key as GlobalFieldKey<'blockInstance'>,
  }))
})

/**
 * LEARNING: Split instances into main vs grouped (components/dependent)
 * WHY: Makes it visually obvious which instances are not shown in booking main lists.
 * PATTERN: Main list stays draggable; grouped list lives in a collapsible section.
 */
const mainInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
  const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

  blockInstancesByShape.value.forEach((instances, blockShapeId) => {
    const mainInstances = instances.filter((instance) => !isComponentChild(instance) && !isInstanceDependent(instance))
    result.set(blockShapeId, mainInstances)
  })

  return result
})

const groupedInstancesByShape = computed((): Map<string, GlobalEntity<'blockInstance'>[]> => {
  const result = new Map<string, GlobalEntity<'blockInstance'>[]>()

  blockInstancesByShape.value.forEach((instances, blockShapeId) => {
    const groupedInstances = instances.filter((instance) => isComponentChild(instance) || isInstanceDependent(instance))
    result.set(blockShapeId, groupedInstances)
  })

  return result
})

const groupedPanelValue = (blockShapeId: string): string => `atomic-dependent-${blockShapeId}`

/**
 * LEARNING: Toggle status button field value
 * WHY: Clicking a status button toggles the boolean value
 * PATTERN: Use update mutation with partial entity to toggle single field
 */
// LEARNING: Track pending toggles to prevent duplicate rapid calls
// WHY: Prevents the same field from being toggled multiple times in quick succession
// PATTERN: Use a Map to track pending operations by instanceId + fieldKey
const pendingToggles = new Map<string, boolean>()

const toggleStatusButton = async (
  instance: GlobalEntity<'blockInstance'>,
  fieldKey: GlobalFieldKey<'blockInstance'>,
  event?: Event
): Promise<void> => {
  // LEARNING: Create unique key for this toggle operation
  // WHY: Prevents duplicate calls for the same instance + field combination
  // PATTERN: Combine instanceId and fieldKey to create unique operation key
  const toggleKey = `${instance.id}-${String(fieldKey)}`
  
  // LEARNING: Check if this toggle is already pending
  // WHY: Prevents duplicate rapid calls that could cause race conditions
  // PATTERN: Return early if toggle is already in progress
  if (pendingToggles.has(toggleKey)) {
    return
  }
  
  // Mark toggle as pending
  pendingToggles.set(toggleKey, true)

  // LEARNING: Stop event propagation to prevent triggering other click handlers
  // WHY: Prevents clicks on status buttons from propagating to parent elements or sibling buttons
  // PATTERN: Explicitly stop propagation in handler as backup to @click.stop
  if (event) {
    event.stopPropagation()
    event.preventDefault()
  }

  /**
   * LEARNING: Nullable boolean fields
   * WHY: Some blockInstance booleans are intentionally nullable in the DB (e.g., requiresUnitNumber).
   *      In the admin UI, we still want the status chip to be toggleable even when the current value is null.
   * PATTERN: Treat null/undefined as false, but still guard against non-boolean unexpected types.
   */
  const currentRaw = instance[fieldKey]
  const isBooleanish = currentRaw === true || currentRaw === false || currentRaw === null || currentRaw === undefined
  if (!isBooleanish) {
    pendingToggles.delete(toggleKey)
    return
  }

  const currentValue = currentRaw === true
  const newValue = !currentValue
  
  try {
    // LEARNING: Use primitive mutation for single-field updates
    // WHY: More efficient than full PUT, uses PATCH with {key, value} format that server expects
    // PATTERN: usePrimitiveMutation for field-level updates, useEntityCrud.update for multi-field updates
    await primitiveMutation.mutateAsync({
      admin: { key: String(fieldKey), value: newValue },
      dynamicId: String(instance.id)
    })
  } finally {
    // LEARNING: Clear pending toggle after operation completes (success or failure)
    // WHY: Ensures the toggle can be triggered again after the operation finishes
    // PATTERN: Use finally block to ensure cleanup happens even if update fails
    pendingToggles.delete(toggleKey)
  }
}

/**
 * LEARNING: VChip click handler wrapper
 * WHY: Separate method for template event handler to avoid import.meta in template
 * PATTERN: Separate method for template event handler
 */
const handleStatusButtonClick = (
  instance: GlobalEntity<'blockInstance'>,
  fieldKey: GlobalFieldKey<'blockInstance'>,
  event: Event
): void => {
  toggleStatusButton(instance, fieldKey, event)
}

/**
 * LEARNING: Reactive arrays for drag-and-drop per BlockShape group
 * WHY: Need mutable arrays that can be reordered during drag operations
 * PATTERN: Maps of ref arrays that sync with computed filtered results (similar to ShapesTab but per group)
 */
const blockInstancesLists = ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>(new Map())
const blockInstanceIdsMap = ref<Map<string, Ref<string[]>>>(new Map())

/**
 * LEARNING: Template refs for drag-and-drop containers per group
 * WHY: Need DOM references to initialize drag-and-drop for each BlockShape group
 * PATTERN: Maps of container refs (one per BlockShape group)
 */
const groupContainers = ref<Map<string, HTMLElement | null>>(new Map())
const groupPanelsContainers = ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>(new Map())

/**
 * LEARNING: Drag handlers per group
 * WHY: Each BlockShape group needs its own drag handlers
 * PATTERN: Map of drag handlers (one per BlockShape group)
 */
const groupDragHandlers = ref<Map<string, ReturnType<typeof useEntityDragHandlers<'blockInstance'>>>>(new Map())

/**
 * LEARNING: Drag-and-drop instances per group
 * WHY: Track drag-and-drop instances for cleanup
 * PATTERN: Map of drag-and-drop instances (one per BlockShape group)
 */
const groupDragInstances = ref<Map<string, ReturnType<typeof dragAndDrop>>>(new Map())
const isMounted = ref(false)


/**
 * LEARNING: Inline creation state management
 * WHY: Instead of dialog, show inline EntityCard for creating new BlockInstances
 * PATTERN: Map of boolean flags per BlockShape group, plus initial values for new entity
 */
const isCreatingBlockInstance = ref<Map<string, boolean>>(new Map())
const newBlockInstanceInitialValues = ref<Map<string, GlobalEntity<'blockInstance'>>>(new Map())

/**
 * LEARNING: Function to start inline creation for a specific BlockShape
 * WHY: Shows inline EntityCard at top of list instead of opening dialog
 * PATTERN: Set isCreating flag and generate initial values with blockShapeRef pre-filled
 */
const createBlockInstance = async (blockShapeRef: string) => {
  // Generate default values with blockShapeRef pre-filled
  const defaults = getDefaultEntityValues('blockInstance')
  const initialValues = {
    ...defaults,
    blockShapeRef,
    // Generate a temp ID for form management
    id: `new-${Date.now()}` as string,
  } as GlobalEntity<'blockInstance'>
  
  // LEARNING: Vue 3 ref() with Map doesn't track mutations (set/delete)
  // WHY: Must replace the entire Map to trigger reactivity
  const newInitialValuesMap = new Map(newBlockInstanceInitialValues.value)
  newInitialValuesMap.set(blockShapeRef, initialValues)
  newBlockInstanceInitialValues.value = newInitialValuesMap
  
  const newCreatingMap = new Map(isCreatingBlockInstance.value)
  newCreatingMap.set(blockShapeRef, true)
  isCreatingBlockInstance.value = newCreatingMap
  
  // Expand the new card immediately
  expandedInstances.value = [`new-${blockShapeRef}`, ...expandedInstances.value]
  
  // LEARNING: Focus the name input field after card is created
  // WHY: Better UX - user can start typing immediately without clicking
  // PATTERN: Use nextTick and retry mechanism to wait for DOM update and VExpansionPanel animation
  await nextTick()
  
  // Retry mechanism to find and focus the input (VExpansionPanel animation takes time)
  const focusNameInput = async (): Promise<void> => {
    // Try multiple times with increasing delays to account for VExpansionPanel animation
    const delays = [100, 200, 300, 400, 500]
    
    for (const delay of delays) {
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Find the new instance card panel
      const newCardPanel = document.querySelector('.new-instance-card')
      if (!newCardPanel) continue
      
      // Look for the name input field within the panel
      // Try multiple selectors to find the input
      const selectors = [
        '#field-name',
        '[id*="field-name"]',
        'input[type="text"]',
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'
      ]
      
      for (const selector of selectors) {
        const element = newCardPanel.querySelector(selector)
        if (!element) continue
        
        // For Vuetify AppTextField, find the actual input element inside
        let inputElement: HTMLElement | null = null
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          inputElement = element as HTMLElement
        } else {
          inputElement = element.querySelector('input') || 
                        element.querySelector('textarea')
        }
        
        if (inputElement) {
          // Focus and select the input
          inputElement.focus()
          if (inputElement instanceof HTMLInputElement && inputElement.select) {
            inputElement.select()
          }
          return
        }
      }
    }
  }
  
  await focusNameInput()
}

/**
 * LEARNING: Event handler for inline creation save
 * WHY: Handles successful creation - clear creation state, Vue Query will refetch
 * PATTERN: Clear isCreating flag and initial values for this BlockShape
 */
const handleBlockInstanceCreated = (blockShapeRef: string, _entity: GlobalEntity<'blockInstance'>) => {
  // LEARNING: Vue 3 ref() with Map doesn't track mutations (set/delete)
  // WHY: Must replace the entire Map to trigger reactivity
  // PATTERN: Create new Map from existing Map with updated values
  const newCreatingMap = new Map(isCreatingBlockInstance.value)
  newCreatingMap.set(blockShapeRef, false)
  isCreatingBlockInstance.value = newCreatingMap
  
  const newInitialValuesMap = new Map(newBlockInstanceInitialValues.value)
  newInitialValuesMap.delete(blockShapeRef)
  newBlockInstanceInitialValues.value = newInitialValuesMap
  
  // Remove temp expansion state
  expandedInstances.value = expandedInstances.value.filter(id => id !== `new-${blockShapeRef}`)
}

/**
 * LEARNING: Event handler for inline creation cancel
 * WHY: User cancelled creation - clear creation state
 * PATTERN: Clear isCreating flag and initial values for this BlockShape
 */
const handleBlockInstanceCancelled = (blockShapeRef: string) => {
  // LEARNING: Vue 3 ref() with Map doesn't track mutations (set/delete)
  // WHY: Must replace the entire Map to trigger reactivity
  const newCreatingMap = new Map(isCreatingBlockInstance.value)
  newCreatingMap.set(blockShapeRef, false)
  isCreatingBlockInstance.value = newCreatingMap
  
  const newInitialValuesMap = new Map(newBlockInstanceInitialValues.value)
  newInitialValuesMap.delete(blockShapeRef)
  newBlockInstanceInitialValues.value = newInitialValuesMap
  
  // Remove temp expansion state
  expandedInstances.value = expandedInstances.value.filter(id => id !== `new-${blockShapeRef}`)
}

/**
 * LEARNING: Handle delete BlockInstance event
 * WHY: EntityCard already handled the deletion - this is just for parent awareness
 * PATTERN: No-op handler - card handles all deletion logic, Vue Query will automatically refetch
 */
const handleDeleteBlockInstance = (_id: string) => {
  // EntityCard already handled the deletion - this is just for parent awareness
  // Vue Query will automatically refetch and update the UI
}

/**
 * LEARNING: Handle save on existing BlockInstance - collapse the card
 * WHY: User expects card to collapse after saving changes
 * PATTERN: Remove instance ID from expandedInstances to collapse the panel
 */
const handleExistingBlockInstanceSaved = (entity: GlobalEntity<GlobalEntityKey>) => {
  // Collapse the card by removing from expanded list
  expandedInstances.value = expandedInstances.value.filter(id => id !== String(entity.id))
}


/**
 * LEARNING: Handle tab click to switch active tab
 * WHY: Switches between BlockShape tabs and Shapes tab, always keeping a tab active
 * PATTERN: Set activeTab to clicked tab value (blockShapeId or 'shapes'), never allow empty state
 * FIX: Removed collapse behavior that set activeTab to '' which caused VWindow to have no matching content
 * WHY FIX: When activeTab is empty string, VWindow can't find matching VWindowItem (all have blockShape.id values or 'shapes'),
 *          causing content to disappear and potentially causing layout/scrolling issues
 */
const handleTabClick = (tabValue: string) => {
  // Always set to clicked tab - don't allow collapse to empty string
  // Empty string causes VWindow to have no matching VWindowItem, breaking the UI
  activeTab.value = tabValue
}


/**
 * LEARNING: Initialize drag handlers and arrays for each BlockShape group
 * WHY: Set up drag handlers and sync arrays when BlockShapes are available
 * PATTERN: Watch blockInstancesByShape and create handlers/arrays for each group (similar to ShapesTab pattern)
 */
watch(mainInstancesByShape, (instancesMap) => {
  instancesMap.forEach((instances, blockShapeId) => {
    // Create refs if they don't exist
    if (!blockInstancesLists.value.has(blockShapeId)) {
      blockInstancesLists.value.set(blockShapeId, ref([...instances]))
      blockInstanceIdsMap.value.set(blockShapeId, ref(instances.map(i => String(i.id))))
      
      // Create computed for filtered instances for this group
      const filteredInstances = computed(() => mainInstancesByShape.value.get(blockShapeId) || [])
      
      // Create drag handlers for this group
      const dragHandlers = useEntityDragHandlers({
        entityIds: blockInstanceIdsMap.value.get(blockShapeId)!,
        entityList: blockInstancesLists.value.get(blockShapeId)!,
        filteredEntities: filteredInstances,
        patchOrderIndex: patchBlockInstanceOrderIndex
      })
      groupDragHandlers.value.set(blockShapeId, dragHandlers)
      
      // Use entity tab state for array syncing (similar to ShapesTab pattern)
      useEntityTabState({
        filteredEntities: filteredInstances,
        dragHandlers
      })
    } else {
      // Update existing refs and sync
      const handlers = groupDragHandlers.value.get(blockShapeId)
      if (handlers) {
        handlers.syncArrays()
      }
    }
  })
}, { immediate: true, deep: true })

/**
 * LEARNING: Helper to get actual DOM element from VExpansionPanels component ref
 * WHY: Component refs give us component instances, we need the .v-expansion-panels DOM element
 * PATTERN: Access .$el property of component instance, then find .v-expansion-panels child
 */
function getPanelsElement(
  componentRef: ComponentPublicInstance | HTMLElement | null,
  containerRef: HTMLElement | null
): HTMLElement | null {
  if (!isMounted.value) return null
  if (!componentRef && !containerRef) return null
  
  try {
    const componentEl = (componentRef && typeof componentRef === 'object' && '$el' in componentRef) 
      ? (componentRef as ComponentPublicInstance).$el || componentRef 
      : componentRef
    
    const panelsEl = componentEl?.querySelector?.('.v-expansion-panels') || componentEl
    
    if (!panelsEl && containerRef) {
      return containerRef.querySelector('.v-expansion-panels') as HTMLElement | null
    }
    
    return panelsEl as HTMLElement | null
  } catch {
    return null
  }
}

/**
 * LEARNING: Set up drag-and-drop for each group when containers are available
 * WHY: Initialize drag-and-drop when component mounts and containers are set
 * PATTERN: Watch containers and panels containers, set up drag-and-drop manually (similar to useDragAndDrop pattern)
 */
watch(() => [groupContainers.value, groupPanelsContainers.value], ([containers, panelsContainers]) => {
  if (!isMounted.value) return
  
  if (!containers || !(containers instanceof Map)) return
  if (!panelsContainers || !(panelsContainers instanceof Map)) return
  
  containers.forEach((container, blockShapeId) => {
    if (!container || !(container instanceof HTMLElement)) return
    
    // Skip if already set up
    if (groupDragInstances.value.has(blockShapeId)) return
    
    const instancesList = blockInstancesLists.value.get(blockShapeId)
    const instanceIds = blockInstanceIdsMap.value.get(blockShapeId)
    const dragHandlers = groupDragHandlers.value.get(blockShapeId)
    const panelsRef = panelsContainers.get(blockShapeId)
    
    if (!instancesList || !instanceIds || !dragHandlers || !panelsRef) return
    
    nextTick(() => {
      if (!isMounted.value) return
      
      try {
        const panelsEl = getPanelsElement(isRef(panelsRef) ? panelsRef.value : panelsRef, container)
        if (!panelsEl || !(panelsEl instanceof HTMLElement)) return
        
        const panelsRefForDrag = ref(panelsEl)
        
        // Clean up previous instance if it exists
        const existingInstance = groupDragInstances.value.get(blockShapeId)
        if (existingInstance) {
          groupDragInstances.value.delete(blockShapeId)
        }
        
        groupDragInstances.value.set(blockShapeId, dragAndDrop({
          parent: panelsRefForDrag,
          values: instanceIds,
          group: `blockInstances-${blockShapeId}`,
          draggable: (child) => {
            if (!child) return false
            return child.classList?.contains('v-expansion-panel') && 
                   (child.classList?.contains(`draggable-instance-${blockShapeId}`) ||
                    child.classList?.contains('draggable-instance-item'))
          },
          plugins: [animations()],
          performTransfer: (state, data) => {
            performTransfer(state, data)
          },
          handleEnd: (state) => {
            handleEnd(state)
            dragHandlers.handleDragEnd()
          },
        }))
      } catch (_error) {
        // Failed to initialize drag-and-drop
      }
    })
  })
}, { immediate: true, deep: true })

/**
 * LEARNING: Initialize when component mounts
 * WHY: Set mount status to enable drag-and-drop setup
 * PATTERN: Set isMounted flag on mount
 */
onMounted(() => {
  isMounted.value = true
})

/**
 * LEARNING: Cleanup BEFORE component unmount starts
 * WHY: Prevents watchers from running during Vue's unmount process
 * PATTERN: Clear drag instances and set mount status to false
 */
onBeforeUnmount(() => {
  isMounted.value = false
  // Clear drag instances
  groupDragInstances.value.forEach(_instance => {
    // Cleanup handled by drag-and-drop library
  })
  groupDragInstances.value.clear()
})

/**
 * LEARNING: Final cleanup after component unmount completes
 * WHY: Ensures all Maps are cleared for garbage collection
 * PATTERN: Clear Maps after Vue finishes unmounting
 */
onUnmounted(() => {
  groupContainers.value.clear()
  groupPanelsContainers.value.clear()
  blockInstancesLists.value.clear()
  blockInstanceIdsMap.value.clear()
  groupDragHandlers.value.clear()
})
</script>

<template>
  <div class="instances-tab">
    <!--
      LEARNING: VTabs component for tab navigation
      WHY: Provides tabbed interface to switch between BlockShapes and Shapes
      PATTERN: v-model binds to reactive ref for two-way data binding
    -->
    <VTabs 
      v-model="activeTab" 
      class="mb-4 instances-tabs-container"
      v-if="sortedBlockShapes.length > 0"
    >
      <VTab
        v-for="blockShape in sortedBlockShapes"
        :key="String(blockShape.id)"
        :value="String(blockShape.id)"
        @click="handleTabClick(String(blockShape.id))"
      >
        {{ blockShape.name }} ({{ blockInstancesCountByShape.get(String(blockShape.id)) || 0 }})
      </VTab>
      <VTab
        value="shapes"
        class="shapes-tab"
        @click="handleTabClick('shapes')"
      >
        Shapes
      </VTab>
    </VTabs>
    
    <!--
      LEARNING: VWindow component for tab content container
      WHY: Manages which tab content is visible based on activeTab value
      PATTERN: v-model syncs with VTabs - when tab clicked, VWindow shows matching VWindowItem
    -->
    <VWindow 
      v-model="activeTab"
      v-if="sortedBlockShapes.length > 0"
    >
      <VWindowItem
        v-for="blockShape in sortedBlockShapes"
        :key="String(blockShape.id)"
        :value="String(blockShape.id)"
      >
        <div class="block-shape-tab-content">
          <!--
            LEARNING: Tab header with BlockShape indicators (left) and action buttons (right)
            WHY: Shows BlockShape-level properties (Composable, State Control, Valid Cascades) and provides actions
            PATTERN: Flex container with indicators on left, buttons on right
          -->
          <div class="d-flex justify-space-between align-center mb-4">
            <!-- BlockShape-Level Indicators -->
            <div class="d-flex align-center gap-2 flex-wrap">
              <!-- Composable Badge -->
              <VChip
                v-if="blockShapeComposable.get(String(blockShape.id))"
                color="success"
                size="small"
                prepend-icon="tabler-link"
                variant="flat"
              >
                Composable
              </VChip>
              
              <!-- State Control Badge -->
              <VChip
                v-if="blockShapeStateControl.get(String(blockShape.id))"
                color="secondary"
                size="small"
                prepend-icon="tabler-toggle-left"
                variant="flat"
              >
                State Control
              </VChip>
              
              <!-- Valid Cascades Badge -->
              <VChip
                :color="(blockShapeValidCascades.get(String(blockShape.id)) || []).length > 0 ? 'info' : 'default'"
                size="small"
                prepend-icon="tabler-hierarchy"
                variant="tonal"
              >
                {{ (() => {
                  const cascades = blockShapeValidCascades.get(String(blockShape.id)) || []
                  return cascades.length > 0 
                    ? `Cascades: ${cascades.join(', ')}` 
                    : 'No Cascades'
                })() }}
              </VChip>
            </div>
            
            <!-- Action Buttons -->
            <div class="d-flex align-center gap-2">
              <VBtn
                color="primary"
                prepend-icon="tabler-plus"
                @click="createBlockInstance(String(blockShape.id))"
              >
                Create
              </VBtn>
              <VBtn
                :color="bulkEditMode.get(String(blockShape.id)) ? 'success' : 'default'"
                :variant="bulkEditMode.get(String(blockShape.id)) ? 'flat' : 'outlined'"
                prepend-icon="tabler-edit"
                @click="toggleBulkEditMode(String(blockShape.id))"
              >
                {{ bulkEditMode.get(String(blockShape.id)) ? 'Exit Bulk Edit' : 'Bulk Edit' }}
              </VBtn>
            </div>
          </div>
          
          <!--
            LEARNING: Bulk Edit Panel
            WHY: Shows bulk edit controls when bulk edit mode is enabled
            PATTERN: Conditional rendering with v-if, VCard with form fields
          -->
          <VCard
            v-if="bulkEditMode.get(String(blockShape.id))"
            variant="outlined"
            color="success"
            class="mb-4"
          >
            <VCardTitle class="text-subtitle-1">
              Bulk Edit: {{ blockShape.name }}
            </VCardTitle>
            <VCardText>
              <div class="d-flex flex-column gap-3">
                <VTextField
                  v-model.number="getBulkEditBaseSqFt(String(blockShape.id)).value"
                  label="Base Sq Ft"
                  type="number"
                  hint="Leave empty to skip this field"
                  persistent-hint
                />
                <div class="d-flex justify-end gap-2">
                  <VBtn
                    variant="outlined"
                    @click="toggleBulkEditMode(String(blockShape.id))"
                  >
                    Cancel
                  </VBtn>
                  <VBtn
                    color="primary"
                    @click="applyBulkEdit(String(blockShape.id))"
                  >
                    Apply to All ({{ blockInstancesCountByShape.get(String(blockShape.id)) || 0 }})
                  </VBtn>
                </div>
              </div>
            </VCardText>
          </VCard>
          
          <!--
            LEARNING: BlockInstance cards container with drag-and-drop and expansion panels
            WHY: Displays BlockInstances for this BlockShape with reordering and expand/collapse capability
            PATTERN: VExpansionPanels directly in tab (matches ShapesTab pattern)
          -->
          <div 
            :ref="el => groupContainers.set(String(blockShape.id), el as HTMLElement)"
            class="block-instances-container"
          >
            <VExpansionPanels
              v-if="
                isCreatingBlockInstance.get(String(blockShape.id)) ||
                (blockInstancesLists.get(String(blockShape.id))?.value || mainInstancesByShape.get(String(blockShape.id)) || []).length > 0
              "
              :ref="el => {
                const blockShapeId = String(blockShape.id)
                if (!groupPanelsContainers.has(blockShapeId)) {
                  groupPanelsContainers.set(blockShapeId, ref(el as ComponentPublicInstance | HTMLElement | null))
                } else {
                  const panelsRef = groupPanelsContainers.get(blockShapeId)
                  if (panelsRef) {
                    panelsRef.value = el as ComponentPublicInstance | HTMLElement | null
                  }
                }
              }"
              v-model="expandedInstances"
              multiple
            >
              <!-- LEARNING: Inline creation card at top of list -->
              <!-- WHY: New entity appears at top, expanded, with Create/Cancel buttons -->
              <!-- PATTERN: Use same status button chips as existing cards for consistency -->
              <VExpansionPanel
                v-if="isCreatingBlockInstance.get(String(blockShape.id))"
                :key="`new-${blockShape.id}`"
                :value="`new-${blockShape.id}`"
                class="new-instance-card"
              >
                <template #title>
                  <div class="d-flex align-center gap-2 flex-grow-1">
                    <VIcon icon="tabler-plus" size="small" color="primary" />
                    <span class="text-primary font-weight-medium">New BlockInstance</span>
                    
                    <!-- LEARNING: Same status button fields as existing cards for consistency -->
                    <!-- WHY: New entity card should look like existing cards with clickable status chips -->
                    <!-- PATTERN: Use initial values to determine initial state of status buttons -->
                    <div class="d-flex align-center gap-1 flex-wrap ml-auto">
                      <VChip
                        v-for="statusField in statusButtonFields"
                        :key="statusField.key"
                        :color="statusField.color"
                        :variant="Boolean(newBlockInstanceInitialValues.get(String(blockShape.id))?.[statusField.key]) ? 'flat' : 'outlined'"
                        size="small"
                        style="cursor: pointer"
                        role="switch"
                        :aria-checked="String(Boolean(newBlockInstanceInitialValues.get(String(blockShape.id))?.[statusField.key]))"
                        :aria-label="`Toggle ${statusField.label}`"
                      >
                        {{ statusField.label }}
                      </VChip>
                    </div>
                  </div>
                </template>
                
                <template #text>
                  <EntityCard
                    entity-key="blockInstance"
                    :entity="newBlockInstanceInitialValues.get(String(blockShape.id))!"
                    :is-new="true"
                    :expanded="true"
                    :hide-title-field="true"
                    @saved="(entity) => handleBlockInstanceCreated(String(blockShape.id), entity as GlobalEntity<'blockInstance'>)"
                    @cancelled="handleBlockInstanceCancelled(String(blockShape.id))"
                  />
                </template>
              </VExpansionPanel>
              
              <!-- Existing BlockInstances -->
              <VExpansionPanel
                v-for="instance in (blockInstancesLists.get(String(blockShape.id))?.value || mainInstancesByShape.get(String(blockShape.id)) || [])"
                :key="String(instance.id)"
                :value="String(instance.id)"
                :class="`draggable-instance-${blockShape.id}`"
                class="draggable-instance-item"
                :data-drag-id="String(instance.id)"
              >
                <template #title>
                  <div class="d-flex align-center gap-2 flex-grow-1">
                    <VIcon icon="tabler-grip-vertical" class="drag-handle" size="small" />
                    <!-- LEARNING: Always show static name in expansion panel title -->
                    <!-- WHY: Name field editing happens in EntityCard content, not in panel title -->
                    <span>{{ instance.name || `BlockInstance ${instance.id}` }}</span>
                    
                    <!-- LEARNING: Config-driven status button fields -->
                    <!-- WHY: Booleans with renderAs: 'statusButton' render as clickable VChips -->
                    <!-- PATTERN: Click to toggle value, solid for true, outlined for false -->
                    <div 
                      class="d-flex align-center gap-1 flex-wrap ml-auto"
                    >
                      <VChip
                        v-for="statusField in statusButtonFields"
                        :key="statusField.key"
                        :color="statusField.color"
                        :variant="Boolean(instance[statusField.key]) ? 'flat' : 'outlined'"
                        size="small"
                        style="cursor: pointer; position: relative; z-index: 1; pointer-events: auto"
                        role="switch"
                        :aria-checked="String(Boolean(instance[statusField.key]))"
                        :aria-label="`Toggle ${statusField.label}`"
                        @click.stop.prevent="handleStatusButtonClick(instance, statusField.key, $event)"
                        @mousedown.stop.prevent
                        @mouseup.stop.prevent
                        @touchstart.stop.prevent
                        @touchend.stop.prevent
                      >
                        {{ statusField.label }}
                      </VChip>
                    </div>
                  </div>
                </template>
                
                <template #text>
                  <EntityCard
                    entity-key="blockInstance"
                    :entity="instance"
                    :expanded="isPanelExpanded(String(instance.id))"
                    :hide-title-field="true"
                    @saved="handleExistingBlockInstanceSaved"
                    @delete="handleDeleteBlockInstance"
                  />
                </template>
              </VExpansionPanel>
            </VExpansionPanels>

            <!-- Grouped: Components + Dependent (collapsed by default) -->
            <VCard
              v-if="(groupedInstancesByShape.get(String(blockShape.id)) || []).length > 0"
              variant="outlined"
              color="warning"
              class="mt-4 grouped-instances-card"
            >
              <VCardTitle class="text-subtitle-1 d-flex align-center gap-2">
                <VIcon icon="tabler-folders" size="small" />
                Components & Dependent (Hidden from Booking)
                <VChip size="small" variant="tonal" class="ml-2">
                  {{ (groupedInstancesByShape.get(String(blockShape.id)) || []).length }}
                </VChip>
              </VCardTitle>
              <VCardText>
                <VExpansionPanels v-model="expandedInstances" multiple>
                  <VExpansionPanel :value="groupedPanelValue(String(blockShape.id))">
                    <template #title>
                      <span>Show / Hide grouped instances</span>
                    </template>
                    <template #text>
                      <VExpansionPanels v-model="expandedInstances" multiple>
                        <VExpansionPanel
                          v-for="instance in (groupedInstancesByShape.get(String(blockShape.id)) || [])"
                          :key="String(instance.id)"
                          :value="String(instance.id)"
                        >
                          <template #title>
                            <div class="d-flex align-center gap-2 flex-grow-1">
                              <VIcon
                                :icon="isComponentChild(instance) ? 'tabler-puzzle' : 'tabler-link'"
                                size="small"
                                :color="isComponentChild(instance) ? 'info' : 'warning'"
                              />
                              <span>{{ instance.name || `BlockInstance ${instance.id}` }}</span>

                              <div class="d-flex align-center gap-1 flex-wrap ml-auto">
                                <VChip
                                  v-if="isComponentChild(instance)"
                                  color="info"
                                  size="small"
                                  variant="tonal"
                                >
                                  Component
                                </VChip>
                                <VChip
                                  v-if="isInstanceDependent(instance)"
                                  color="warning"
                                  size="small"
                                  variant="tonal"
                                >
                                  Dependent
                                </VChip>

                                <!-- Config-driven status button fields (same as main list) -->
                                <VChip
                                  v-for="statusField in statusButtonFields"
                                  :key="statusField.key"
                                  :color="statusField.color"
                                  :variant="Boolean(instance[statusField.key]) ? 'flat' : 'outlined'"
                                  size="small"
                                  style="cursor: pointer; position: relative; z-index: 1; pointer-events: auto"
                                  role="switch"
                                  :aria-checked="String(Boolean(instance[statusField.key]))"
                                  :aria-label="`Toggle ${statusField.label}`"
                                  @click.stop.prevent="handleStatusButtonClick(instance, statusField.key, $event)"
                                  @mousedown.stop.prevent
                                  @mouseup.stop.prevent
                                  @touchstart.stop.prevent
                                  @touchend.stop.prevent
                                >
                                  {{ statusField.label }}
                                </VChip>
                              </div>
                            </div>
                          </template>

                          <template #text>
                            <EntityCard
                              entity-key="blockInstance"
                              :entity="instance"
                              :expanded="isPanelExpanded(String(instance.id))"
                              :hide-title-field="true"
                              @saved="handleExistingBlockInstanceSaved"
                              @delete="handleDeleteBlockInstance"
                            />
                          </template>
                        </VExpansionPanel>
                      </VExpansionPanels>
                    </template>
                  </VExpansionPanel>
                </VExpansionPanels>
              </VCardText>
            </VCard>
            
            <!-- Empty state -->
            <VAlert
              v-if="
                !isCreatingBlockInstance.get(String(blockShape.id)) &&
                (blockInstancesLists.get(String(blockShape.id))?.value || mainInstancesByShape.get(String(blockShape.id)) || []).length === 0 &&
                (groupedInstancesByShape.get(String(blockShape.id)) || []).length === 0
              "
              type="info"
              variant="tonal"
              class="mt-4"
            >
              No BlockInstances found for {{ blockShape.name }}. Create one to get started.
            </VAlert>
          </div>
          
          <!--
            LEARNING: BlockShape Entity Card at bottom of tab
            WHY: Shows BlockShape configuration in visually distinct wrapper at bottom of instances list
            PATTERN: VCard wrapper with EntityCard inside, separate expansion state
          -->
          <VCard
            variant="outlined"
            color="primary"
            class="mt-6 block-shape-entity-card-wrapper"
          >
            <VCardTitle class="text-subtitle-1 d-flex align-center gap-2">
              <VIcon icon="tabler-settings" size="small" />
              Block Shape Configuration: {{ blockShape.name }}
            </VCardTitle>
            <VCardText>
              <VExpansionPanels v-model="expandedBlockShapes" multiple>
                <VExpansionPanel :value="String(blockShape.id)">
                  <template #title>
                    <span>{{ blockShape.name || `BlockShape ${blockShape.id}` }}</span>
                  </template>
                  <template #text>
                    <EntityCard
                      entity-key="blockShape"
                      :entity="blockShape"
                      :expanded="isBlockShapeExpanded(String(blockShape.id))"
                      :hide-title-field="false"
                      @saved="handleExistingBlockShapeSaved"
                    />
                  </template>
                </VExpansionPanel>
              </VExpansionPanels>
            </VCardText>
          </VCard>
        </div>
      </VWindowItem>
      
      <!-- Shapes Tab Content -->
      <VWindowItem key="shapes" value="shapes">
        <ShapesSubTab />
      </VWindowItem>
    </VWindow>
    
    <!--
      LEARNING: Empty state when no BlockShapes exist
      WHY: Provides feedback when no BlockShapes are configured
      PATTERN: Conditional rendering with v-else
    -->
    <VAlert
      v-else
      type="info"
      variant="tonal"
      class="mt-4"
    >
      No BlockShapes found. Create a BlockShape first.
    </VAlert>
  </div>
</template>

<style scoped>
.instances-tab {
  margin-top: 1rem;
}

.block-shape-tab-content {
  padding: 0.5rem 0;
}

.block-shape-entity-card-wrapper {
  border: 2px solid rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.block-instances-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.draggable-instance-item {
  transition: transform 0.2s;
}

.new-instance-card {
  border: 2px dashed rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.drag-handle {
  cursor: grab;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.drag-handle:hover {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.instances-tabs-container :deep(.v-tab) {
  flex: 0 1 auto;
}

.shapes-tab {
  margin-left: auto;
  background-color: rgba(var(--v-theme-secondary), 0.1);
  border-radius: 4px 4px 0 0;
}

.shapes-tab:hover {
  background-color: rgba(var(--v-theme-secondary), 0.15);
}

.instances-tabs-container :deep(.v-tabs) {
  display: flex;
}

.instances-tabs-container :deep(.v-slide-group__content) {
  display: flex;
  flex: 1;
}
</style>
