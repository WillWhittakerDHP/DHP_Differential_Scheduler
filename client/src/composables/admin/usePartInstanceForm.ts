/**
 * Part Instance Form Composable
 * 
 * LEARNING: Extracts form management logic from PartInstanceForm component
 * WHY: Components should be thin UI wrappers - form logic belongs in composables
 * PATTERN: Composable that handles form state, entity loading, and submission
 * 
 * This composable handles:
 * - Form data state management
 * - Entity loading for edit mode
 * - Form submission (create/update)
 * - Error handling
 */

import { ref, computed, onMounted, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEntityCrud } from '../useEntity'
import { useGlobal } from '../useGlobal'
import type { GlobalEntity } from '@/types/entities'

export interface PartInstanceFormData {
  name: string
  partShapeRef: string
  orderIndex: number
  active: boolean
}

export interface UsePartInstanceFormOptions {
  /**
   * LEARNING: Route name for navigation after submit
   * WHY: Allows customization of redirect route
   * PATTERN: Optional route name, defaults to 'part-instances-list'
   */
  redirectRouteName?: string
}

export interface UsePartInstanceFormReturn {
  /**
   * LEARNING: Whether component is in edit mode
   * WHY: Determines if loading existing entity or creating new
   * PATTERN: Computed property based on route params
   */
  isEdit: Ref<boolean>
  
  /**
   * LEARNING: Entity ID from route
   * WHY: Used to load existing entity in edit mode
   * PATTERN: Computed property from route params
   */
  entityId: Ref<string | undefined>
  
  /**
   * LEARNING: Part type options for select dropdown
   * WHY: Component needs options for partShapeRef select
   * PATTERN: Computed property that maps entities to select options
   */
  partTypeOptions: Ref<Array<{ id: string; name: string }>>
  
  /**
   * LEARNING: Form data state
   * WHY: Component needs reactive form data
   * PATTERN: Ref containing form data object
   */
  formData: Ref<PartInstanceFormData>
  
  /**
   * LEARNING: Submission loading state
   * WHY: Component needs to show loading state during submit
   * PATTERN: Ref boolean flag
   */
  isSubmitting: Ref<boolean>
  
  /**
   * LEARNING: Error state
   * WHY: Component needs to display errors
   * PATTERN: Ref string or null
   */
  error: Ref<string | null>
  
  /**
   * LEARNING: Load entity data for edit mode
   * WHY: Populates form with existing entity data
   * PATTERN: Function called in onMounted hook
   */
  loadEntity: () => Promise<void>
  
  /**
   * LEARNING: Handle form submission
   * WHY: Creates or updates entity based on mode
   * PATTERN: Async function that handles create/update logic
   */
  handleSubmit: () => Promise<void>
  
  /**
   * LEARNING: Navigate back to list
   * WHY: Component needs navigation function
   * PATTERN: Function that uses router to navigate
   */
  goBack: () => void
}

/**
 * Part Instance Form Composable
 * 
 * LEARNING: Provides form management logic extracted from components
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with form state, entity loading, and submission logic
 */
export function usePartInstanceForm(
  options: UsePartInstanceFormOptions = {}
): UsePartInstanceFormReturn {
  const {
    redirectRouteName = 'part-instances-list'
  } = options
  
  const router = useRouter()
  const route = useRoute()
  const { create, update } = useEntityCrud('partInstance')
  const { getGlobalEntities } = useGlobal()
  
  /**
   * LEARNING: Whether component is in edit mode
   * WHY: Determines if loading existing entity or creating new
   * PATTERN: Computed property based on route params
   */
  const isEdit = computed(() => !!route.params.id)
  
  /**
   * LEARNING: Entity ID from route
   * WHY: Used to load existing entity in edit mode
   * PATTERN: Computed property from route params
   */
  const entityId = computed(() => route.params.id as string | undefined)
  
  /**
   * LEARNING: Part type options for select dropdown
   * WHY: Component needs options for partShapeRef select
   * PATTERN: Computed property that maps entities to select options
   */
  const partTypeOptions = computed(() => {
    return getGlobalEntities('partShape').map(pt => ({
      id: String(pt.id),
      name: pt.name || `Part Type ${pt.id}`,
    }))
  })
  
  /**
   * LEARNING: Form data state
   * WHY: Component needs reactive form data
   * PATTERN: Ref containing form data object
   */
  const formData = ref<PartInstanceFormData>({
    name: '',
    partShapeRef: '',
    orderIndex: 0,
    active: true,
  })
  
  /**
   * LEARNING: Submission loading state
   * WHY: Component needs to show loading state during submit
   * PATTERN: Ref boolean flag
   */
  const isSubmitting = ref(false)
  
  /**
   * LEARNING: Error state
   * WHY: Component needs to display errors
   * PATTERN: Ref string or null
   */
  const error = ref<string | null>(null)
  
  /**
   * LEARNING: Load entity data for edit mode
   * WHY: Populates form with existing entity data
   * PATTERN: Function that finds entity and populates formData
   */
  const loadEntity = async (): Promise<void> => {
    if (!isEdit.value || !entityId.value) return
    
    const entity = getGlobalEntities('partInstance').find(e => String(e.id) === entityId.value)
    if (entity) {
      formData.value = {
        name: entity.name || '',
        partShapeRef: entity.partShapeRef || '',
        orderIndex: entity.orderIndex ?? 0,
        active: entity.active ?? true,
      }
    }
  }
  
  /**
   * LEARNING: Handle form submission
   * WHY: Creates or updates entity based on mode
   * PATTERN: Async function that handles create/update logic with error handling
   */
  const handleSubmit = async (): Promise<void> => {
    isSubmitting.value = true
    error.value = null
    
    try {
      if (isEdit.value && entityId.value) {
        await update(formData.value as Partial<GlobalEntity<'partInstance'>>, entityId.value)
      } else {
        await create(formData.value as Partial<GlobalEntity<'partInstance'>>)
      }
      goBack()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save part instance'
    } finally {
      isSubmitting.value = false
    }
  }
  
  /**
   * LEARNING: Navigate back to list
   * WHY: Component needs navigation function
   * PATTERN: Function that uses router to navigate
   */
  const goBack = (): void => {
    router.push({ name: redirectRouteName })
  }
  
  /**
   * LEARNING: Load entity when component mounts (if in edit mode)
   * WHY: Form needs to be populated with existing data
   * PATTERN: Call loadEntity in onMounted hook
   */
  onMounted(() => {
    loadEntity()
  })
  
  return {
    isEdit,
    entityId,
    partTypeOptions,
    formData,
    isSubmitting,
    error,
    loadEntity,
    handleSubmit,
    goBack
  }
}

