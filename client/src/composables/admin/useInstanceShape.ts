/**
 * WHY: Shared composable for getting shape entity from instance entity
PATTERN:...
 */
import { computed } from 'vue'
import { useGlobal } from '@/composables/useGlobal'
import { useAdmin } from '@/composables/admin/useAdmin'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { BlockShapeEntity, PartShapeEntity } from '@/types/entities'
import type { UseInstanceShapeOptions, UseInstanceShapeReturn } from '@/types/admin/instanceShape'
import {
  combinedInstanceShape,
  computeBlockShapeForInstanceKey,
  computePartShapeForInstanceKey,
  shapeRefFromInstance,
} from '@/utils/admin/instanceShapeResolution'

export function useInstanceShape(options: UseInstanceShapeOptions): UseInstanceShapeReturn {
  const { entityKey, entityId } = options
  const { globalData } = useGlobal()
  const adminComp = useAdmin()

  const entityIdRef = typeof entityId === 'string' ? computed(() => entityId) : entityId

  const instance = computed(() => adminComp.getEntity(entityKey, toGlobalEntityId(entityIdRef.value)))

  const shapeRef = computed(() => shapeRefFromInstance(entityKey, instance.value))

  const blockShape = computed((): BlockShapeEntity | null =>
    computeBlockShapeForInstanceKey(
      entityKey,
      shapeRef.value,
      globalData.value?.entities?.blockShape as BlockShapeEntity[] | undefined
    )
  )

  const partShape = computed((): PartShapeEntity | null =>
    computePartShapeForInstanceKey(
      entityKey,
      shapeRef.value,
      globalData.value?.entities?.partShape as PartShapeEntity[] | undefined
    )
  )

  const shape = computed(() => combinedInstanceShape(entityKey, blockShape.value, partShape.value))

  return {
    blockShape,
    partShape,
    shape,
  }
}
