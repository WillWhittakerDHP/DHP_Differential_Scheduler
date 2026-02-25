import type { Ref } from 'vue'
import type { UseEntityFormRedirectOptions } from '@/types/admin/entityFormRedirectOptions'
import type { UseEntityInstanceFormReturn } from '@/types/admin/entityInstanceFormBase'

export interface PartInstanceFormData {
  name: string
  partShapeRef: string
  orderIndex: number
  active: boolean
}

export type UsePartInstanceFormOptions = UseEntityFormRedirectOptions

export interface UsePartInstanceFormReturn
  extends UseEntityInstanceFormReturn<PartInstanceFormData> {
  partTypeOptions: Ref<Array<{ id: string; name: string }>>
}
