/**
 * WHY: Block Instance Form Composable

WHY: Components should be thin UI wrappe...
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
   */
  isEdit: Ref<boolean>
  
  /**
   */
  entityId: Ref<string | undefined>
  
  /**
   */
  blockTypeOptions: Ref<Array<{ id: string; name: string }>>
  
  /**
   */
  formData: Ref<BlockInstanceFormData>
  
  /**
LEARNING: Submission loading state
WHY: Component needs to show load...
   */
  isSubmitting: Ref<boolean>
  
  /**
   */
  error: Ref<string | null>
  
  /**
   * PATTERN: Function called in onMounted hook
   */
  loadEntity: () => Promise<void>
  
  /**
   */
  handleSubmit: () => Promise<void>
  
  /**
   */
  goBack: () => void
}

/**
 * WHY: Block Instance Form Composable

WHY: Moves business logic out of compone...
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
   */
  const isEdit = computed(() => !!route.params.id)
  
  /**
   */
  const entityId = computed(() => route.params.id as string | undefined)
  
  /**
   */
  const blockTypeOptions = computed(() => {
    return getGlobalEntities('blockShape').map(bt => ({
      id: bt.id,
      name: bt.name || `Block Type ${bt.id}`,
    }))
  })
  
  /**
   */
  const formData = ref<BlockInstanceFormData>({
    name: '',
    blockShapeRef: '',
    orderIndex: 0,
    active: true,
  })
  
  /**
LEARNING: Submission loading state
WHY: Component needs to show load...
   */
  const isSubmitting = ref(false)
  
  /**
   */
  const error = ref<string | null>(null)
  
  /**
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
   */
  const goBack = (): void => {
    router.push({ name: redirectRouteName })
  }
  
  /**
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

