import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { PartPricingFields } from '@/types/admin/partPricing'

export interface PartInstanceBulkEditData extends PartPricingFields {
  [fieldKey: string]: number | null | undefined
}

export interface UsePartInstanceBulkEditOptions {
  existingPartInstances: ComputedRef<GlobalEntity<'partInstance'>[]>
}

export interface UsePartInstanceBulkEditReturn {
  bulkEditMode: Ref<boolean>
  bulkEditData: Ref<PartInstanceBulkEditData>
  toggleBulkEditMode: () => void
  applyPartInstanceBulkEdit: () => Promise<void>
  handleBulkEditModalUpdate: (value: boolean) => void
  handleBulkEditConfirm: (data: PartInstanceBulkEditData) => void
}
