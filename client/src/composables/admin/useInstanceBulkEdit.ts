/**
 * Instance bulk edit: pure buildBulkEditDataFromForm from util; stateful API when options provided (InstancesTab).
 * WHY: Pure part lives in utils/admin/instanceBulkEdit.ts; this composable re-exports it and adds state for tab UI.
 */
import { ref, computed, type ComputedRef } from 'vue'
import { buildBulkEditDataFromForm as buildBulkEditDataFromFormUtil } from '@/utils/admin/instanceBulkEdit'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import type { UseInstanceBulkEditReturn } from '@/types/admin/instanceBulkEdit'
import type { UseInstanceBlockInstancesByShapeOptions } from '@/types/admin/instanceComposableOptions'

export { buildBulkEditDataFromFormUtil as buildBulkEditDataFromForm }

export function useInstanceBulkEdit(
  options?: UseInstanceBlockInstancesByShapeOptions
): UseInstanceBulkEditReturn & { buildBulkEditDataFromForm: typeof buildBulkEditDataFromFormUtil } {
  const noArgReturn = {
    buildBulkEditDataFromForm: buildBulkEditDataFromFormUtil,
  }

  if (!options?.blockInstancesByShape) {
    return {
      ...noArgReturn,
      bulkEditMode: ref(new Map<string, boolean>()),
      bulkEditData: ref(new Map<string, Record<string, unknown>>()),
      getBulkEditBaseSqFt: () => computed(() => undefined),
      getBulkEditData: () => ({}),
      toggleBulkEditMode: () => {},
      applyBulkEdit: async () => {},
    }
  }

  const { blockInstancesByShape } = options
  const bulkEditMode = ref(new Map<string, boolean>())
  const bulkEditData = ref(new Map<string, Record<string, unknown>>())
  const { patchBulk } = useEntityCrud('blockInstance')

  function getBulkEditData(blockShapeId: string): Record<string, unknown> {
    const existingBulkEditData = bulkEditData.value.get(blockShapeId)
    if (existingBulkEditData === undefined) {
      return {}
    }
    return existingBulkEditData
  }

  function toggleBulkEditMode(blockShapeId: string): void {
    const next = new Map(bulkEditMode.value)
    next.set(blockShapeId, !next.get(blockShapeId))
    bulkEditMode.value = next
  }

  async function applyBulkEdit(blockShapeId: string): Promise<void> {
    const instances = blockInstancesByShape.value.get(blockShapeId)
    if (!instances || instances.length === 0) return
    const data = bulkEditData.value.get(blockShapeId)
    if (!data) return
    const updates = instances.map((inst) => ({ id: inst.id, ...data }))
    await patchBulk(updates)
  }

  function getBulkEditBaseSqFt(_blockShapeId: string): ComputedRef<number | undefined> {
    return computed(() => undefined)
  }

  return {
    ...noArgReturn,
    bulkEditMode,
    bulkEditData,
    getBulkEditBaseSqFt,
    getBulkEditData,
    toggleBulkEditMode,
    applyBulkEdit,
  }
}
