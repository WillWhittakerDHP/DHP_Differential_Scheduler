/**
 * Block Instance Form Composable
 * 
 * LEARNING: Extracts form management logic from BlockInstanceForm component
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
import { useEntityCrud } from '../entityCrud/useEntityCrud'
import { useGlobal } from '../useGlobal'
import { toGlobalEntityId, type GlobalEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'
import { asEmptyString } from '@/utils/safeDefaults'

const logger = createLogger('useBlockInstanceForm')

export interface BlockInstanceFormData {
  name: string
  blockShapeRef: string
  orderIndex: number
  active: boolean
}

import type { UseEntityFormRedirectOptions } from './useEntityFormRedirectOptions'

export type UseBlockInstanceFormOptions = UseEntityFormRedirectOptions

export interface UseBlockInstanceFormReturn {
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
   * LEARNING: Block type options for select dropdown
   * WHY: Component needs options for blockShapeRef select
   * PATTERN: Computed property that maps entities to select options
   */
  blockTypeOptions: Ref<Array<{ id: string; name: string }>>
  
  /**
   * LEARNING: Form data state
   * WHY: Component needs reactive form data
   * PATTERN: Ref containing form data object
   */
  formData: Ref<BlockInstanceFormData>
  
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
 * Block Instance Form Composable
 * 
 * LEARNING: Provides form management logic extracted from components
 * WHY: Moves business logic out of components into reusable composable
 * PATTERN: Composable with form state, entity loading, and submission logic
 */
export function useBlockInstanceForm(
  options: UseBlockInstanceFormOptions = {}
): UseBlockInstanceFormReturn {
  const {
    redirectRouteName = 'block-instances-list'
  } = options
  
  const router = useRouter()
  const route = useRoute()
  const { create, update } = useEntityCrud('blockInstance')
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
   * LEARNING: Block type options for select dropdown
   * WHY: Component needs options for blockShapeRef select
   * PATTERN: Computed property that maps entities to select options
   */
  const blockTypeOptions = computed(() => {
    return getGlobalEntities('blockShape').map(bt => ({
      id: bt.id,
      name: bt.name || `Block Type ${bt.id}`,
    }))
  })
  
  /**
   * LEARNING: Form data state
   * WHY: Component needs reactive form data
   * PATTERN: Ref containing form data object
   */
  const formData = ref<BlockInstanceFormData>({
    name: '',
    blockShapeRef: '',
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
    
    const entity = getGlobalEntities('blockInstance').find(e => e.id === entityId.value)
    if (entity) {
      formData.value = {
        name: asEmptyString(entity.name),
        blockShapeRef: asEmptyString(entity.blockShapeRef),
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
        await update(formData.value as Partial<GlobalEntity<'blockInstance'>>, toGlobalEntityId(entityId.value!))
      } else {
        await create(formData.value as Partial<GlobalEntity<'blockInstance'>>)
      }
      goBack()
    } catch (err) {
      logger.error('Failed to save block instance', { err })
      error.value = err instanceof Error ? err.message : 'Failed to save block instance'
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
    blockTypeOptions,
    formData,
    isSubmitting,
    error,
    loadEntity,
    handleSubmit,
    goBack
  }
}

