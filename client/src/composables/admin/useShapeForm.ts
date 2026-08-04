/**
 */
import { ref, computed, onMounted, type ComputedRef, type Ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { useGlobal } from '@/composables/useGlobal'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { createLogger } from '@/utils/logger'

type ShapeFormEntityKey = 'blockShape' | 'partShape'

export interface BlockShapeFormData {
  name: string
  orderIndex: number
}

interface PartShapeFormData {
  name: string
  orderIndex: number
}

function useShapeFormBlock(): {
  isEdit: ComputedRef<boolean>
  entityId: ComputedRef<string | undefined>
  formData: Ref<BlockShapeFormData>
  isSubmitting: Ref<boolean>
  error: Ref<string | null>
  handleSubmit: () => Promise<void>
  goBack: () => void
} {
  const logger = createLogger('BlockShapeForm')
  const router = useRouter()
  const route = useRoute()
  const { create, update } = useEntityCrud('blockShape')
  const { getGlobalEntityById } = useGlobal()

  const isEdit = computed(() => !!route.params.id)
  const entityId = computed(() => route.params.id as string | undefined)
  const formData = ref<BlockShapeFormData>({ name: '', orderIndex: 0 })
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  onMounted(async () => {
    if (isEdit.value && entityId.value) {
      const entity = getGlobalEntityById('blockShape', entityId.value)
      if (entity) {
        const rawName = entity.name
        formData.value = {
          name: rawName !== undefined && rawName !== null && rawName !== '' ? rawName : '',
          orderIndex: entity.orderIndex ?? 0,
        }
      }
    }
  })

  async function handleSubmit(): Promise<void> {
    isSubmitting.value = true
    error.value = null
    try {
      if (isEdit.value && entityId.value) {
        await update(
          formData.value as Partial<GlobalEntity<'blockShape'>>,
          toGlobalEntityId(entityId.value)
        )
      } else {
        await create(formData.value as Partial<GlobalEntity<'blockShape'>>)
      }
      router.back()
    } catch (err) {
      logger.error('Failed to save block type', { err })
      error.value = err instanceof Error ? err.message : 'Failed to save block type'
    } finally {
      isSubmitting.value = false
    }
  }

  function goBack(): void {
    router.push({ name: 'block-types-list' })
  }

  return { isEdit, entityId, formData, isSubmitting, error, handleSubmit, goBack }
}

function useShapeFormPart(): {
  isEdit: ComputedRef<boolean>
  entityId: ComputedRef<string | undefined>
  formData: Ref<PartShapeFormData>
  isSubmitting: Ref<boolean>
  error: Ref<string | null>
  handleSubmit: () => Promise<void>
  goBack: () => void
} {
  const logger = createLogger('PartShapeForm')
  const router = useRouter()
  const route = useRoute()
  const { create, update } = useEntityCrud('partShape')
  const { getGlobalEntityById } = useGlobal()

  const isEdit = computed(() => !!route.params.id)
  const entityId = computed(() => route.params.id as string | undefined)
  const formData = ref<PartShapeFormData>({ name: '', orderIndex: 0 })
  const isSubmitting = ref(false)
  const error = ref<string | null>(null)

  onMounted(async () => {
    if (isEdit.value && entityId.value) {
      const entity = getGlobalEntityById('partShape', entityId.value)
      if (entity) {
        const rawName = entity.name
        formData.value = {
          name: rawName !== undefined && rawName !== null && rawName !== '' ? rawName : '',
          orderIndex: entity.orderIndex ?? 0,
        }
      }
    }
  })

  async function handleSubmit(): Promise<void> {
    isSubmitting.value = true
    error.value = null
    try {
      if (isEdit.value && entityId.value) {
        await update(
          formData.value as Partial<GlobalEntity<'partShape'>>,
          toGlobalEntityId(entityId.value)
        )
      } else {
        await create(formData.value as Partial<GlobalEntity<'partShape'>>)
      }
      router.back()
    } catch (err) {
      logger.error('Failed to save part type', { err })
      error.value = err instanceof Error ? err.message : 'Failed to save part type'
    } finally {
      isSubmitting.value = false
    }
  }

  function goBack(): void {
    router.push({ name: 'part-types-list' })
  }

  return { isEdit, entityId, formData, isSubmitting, error, handleSubmit, goBack }
}

export function useShapeForm(
  entityKey: ShapeFormEntityKey
): ReturnType<typeof useShapeFormBlock> | ReturnType<typeof useShapeFormPart> {
  return entityKey === 'blockShape' ? useShapeFormBlock() : useShapeFormPart()
}
