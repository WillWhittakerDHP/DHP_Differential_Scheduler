/**
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'
import type { PartInstanceBulkEditData } from '@/types/admin/partInstanceBulkEdit'
import { useEntityCrud } from '@/composables/entityCrud/useEntityCrud'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { createLogger } from '@/utils/logger'

const logger = createLogger('usePartInstanceBulkEdit')


type UsePartInstanceBulkEditOptions =
  | {
      blockInstanceId: string
      partInstances: Ref<GlobalEntity<'partInstance'>[]>
      partAssignments: Ref<GlobalRelationship[] | undefined | null>
      logger: { debug: (msg: string, ctx?: unknown) => void }
    }
  | {
      existingPartInstances: ComputedRef<GlobalEntity<'partInstance'>[]>
    }

export function usePartInstanceBulkEdit(options: UsePartInstanceBulkEditOptions): {
  firstPartInstanceForMetadata: Ref<GlobalEntity<'partInstance'> | null>
  buildBulkEditDataFromForm: (
    filteredMetadataKeys: string[],
    formValues: Record<string, unknown>
  ) => PartInstanceBulkEditData
  bulkEditMode: Ref<boolean>
  bulkEditData: Ref<PartInstanceBulkEditData>
  toggleBulkEditMode: () => void
  applyPartInstanceBulkEdit: () => Promise<void>
  handleBulkEditModalUpdate: (value: boolean) => void
  handleBulkEditConfirm: (data: PartInstanceBulkEditData) => void
} {
  const partInstancesRef =
    'existingPartInstances' in options
      ? options.existingPartInstances
      : options.partInstances
  const partAssignmentsRef =
    'partAssignments' in options ? options.partAssignments : undefined
  const blockInstanceId = 'blockInstanceId' in options ? options.blockInstanceId : undefined
  const optsLogger = 'logger' in options ? options.logger : logger

  const firstPartInstanceForMetadata = computed<GlobalEntity<'partInstance'> | null>(() => {
    if (blockInstanceId !== undefined && partAssignmentsRef) {
      const raw = partAssignmentsRef.value
      if (raw === undefined || raw === null) {
        optsLogger.debug('firstPartInstanceForMetadata: partAssignments missing, using []')
      }
      const relationships = raw !== undefined && raw !== null ? raw : []
      const constituentIds = new Set(
        relationships
          .filter((rel) => rel.parent.id === blockInstanceId)
          .flatMap((rel) => rel.children.map((child) => child.id))
      )
      const instances = partInstancesRef.value.filter((pi) => constituentIds.has(pi.id))
      if (instances.length === 0) return null
      return instances[0]
    }
    const instances = partInstancesRef.value
    return instances.length > 0 ? instances[0] : null
  })

  function buildBulkEditDataFromForm(
    filteredMetadataKeys: string[],
    formValues: Record<string, unknown>
  ): PartInstanceBulkEditData {
    return filteredMetadataKeys.reduce<PartInstanceBulkEditData>((acc, field) => {
      const value = formValues[field]
      if (value !== null && value !== undefined && value !== '') {
        const numericValue = Number(value)
        if (!isNaN(numericValue)) {
          (acc as Record<string, number>)[field] = numericValue
        }
      }
      return acc
    }, {})
  }

  const bulkEditMode = ref(false)
  const bulkEditData = ref<PartInstanceBulkEditData>({})
  const { patchBulk } = useEntityCrud('partInstance')

  function toggleBulkEditMode(): void {
    bulkEditMode.value = !bulkEditMode.value
  }

  function handleBulkEditModalUpdate(value: boolean): void {
    bulkEditMode.value = value
  }

  function handleBulkEditConfirm(data: PartInstanceBulkEditData): void {
    bulkEditData.value = data
  }

  async function applyPartInstanceBulkEdit(): Promise<void> {
    const instances = partInstancesRef.value
    const data = bulkEditData.value
    if (instances.length === 0 || Object.keys(data).length === 0) return
    const updates = instances.map((inst) => ({
      id: toGlobalEntityId(inst.id),
      ...data,
    })) as Parameters<typeof patchBulk>[0]
    await patchBulk(updates)
  }

  return {
    firstPartInstanceForMetadata,
    buildBulkEditDataFromForm,
    bulkEditMode,
    bulkEditData,
    toggleBulkEditMode,
    applyPartInstanceBulkEdit,
    handleBulkEditModalUpdate,
    handleBulkEditConfirm,
  }
}
