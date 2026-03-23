import type { Ref } from 'vue'
import type { UseEntityInstanceFormReturn } from '@/types/admin/entityInstanceFormBase'

export interface PartInstanceFormData {
  name: string
  partShapeRef: string
  orderIndex: number
  active: boolean
  /** Optional percentage off (e.g. 10 for 10% off) for coupon/discount; flows to fee pipeline. */
  percentageOff?: number
}

export interface UsePartInstanceFormReturn
  extends UseEntityInstanceFormReturn<PartInstanceFormData> {
  partTypeOptions: Ref<Array<{ id: string; name: string }>>
}
