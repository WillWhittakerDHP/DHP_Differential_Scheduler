/**
 * WHY: Part Instance Form Composable

WHY: Components should be thin UI wrapper...
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEntityCrud } from '../entityCrud/useEntityCrud'
import { useGlobal } from '../useGlobal'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'
import { asEmptyString } from '@/utils/safeDefaults'
import type { UseEntityFormRedirectOptions } from '@/types/admin/entityFormRedirectOptions'
import type { PartInstanceFormData, UsePartInstanceFormReturn } from '@/types/admin/partInstanceForm'

const logger = createLogger('usePartInstanceForm')

/**
 * WHY: Part Instance Form Composable

WHY: Moves business logic out of componen...
 */
export function usePartInstanceForm(
  options: UseEntityFormRedirectOptions = {}
): UsePartInstanceFormReturn {
  const {
    redirectRouteName = 'part-instances-list'
  } = options
  
  const router = useRouter()
  const route = useRoute()
  const { create, update } = useEntityCrud('partInstance')
  const { getGlobalEntities } = useGlobal()
  
  /**
   */
  const isEdit = computed(() => !!route.params.id)
  
  /**
   */
  const entityId = computed(() => route.params.id as string | undefined)
  
  /**
   */
  const partTypeOptions = computed(() => {
    return getGlobalEntities('partShape').map(pt => ({
      id: pt.id,
      name: pt.name || `Part Type ${pt.id}`,
    }))
  })
  
  /**
   */
  const formData = ref<PartInstanceFormData>({
    name: '',
    partShapeRef: '',
    orderIndex: 0,
    active: true,
  })
  
  const isSubmitting = ref(false)
  
  /**
   */
  const error = ref<string | null>(null)
  
  /**
   */
  const loadEntity = async (): Promise<void> => {
    if (!isEdit.value || !entityId.value) return
    
    const entity = getGlobalEntities('partInstance').find(e => e.id === entityId.value)
    if (entity) {
      formData.value = {
        name: asEmptyString(entity.name),
        partShapeRef: asEmptyString(entity.partShapeRef),
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
        await update(formData.value as Partial<GlobalEntity<'partInstance'>>, toGlobalEntityId(entityId.value!))
      } else {
        await create(formData.value as Partial<GlobalEntity<'partInstance'>>)
      }
      goBack()
    } catch (err) {
      logger.error('Failed to save part instance', { err })
      error.value = err instanceof Error ? err.message : 'Failed to save part instance'
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
    partTypeOptions,
    formData,
    isSubmitting,
    error,
    loadEntity,
    handleSubmit,
    goBack
  }
}
