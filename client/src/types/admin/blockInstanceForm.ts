import type { Ref } from 'vue'
import type { UseEntityFormRedirectOptions } from '@/types/admin/entityFormRedirectOptions'
import type { UseEntityInstanceFormReturn } from '@/types/admin/entityInstanceFormBase'

export interface BlockInstanceFormData {
  name: string
  blockShapeRef: string
  orderIndex: number
  active: boolean
}

export type UseBlockInstanceFormOptions = UseEntityFormRedirectOptions

export interface UseBlockInstanceFormReturn
  extends UseEntityInstanceFormReturn<BlockInstanceFormData> {
  blockTypeOptions: Ref<Array<{ id: string; name: string }>>
}
