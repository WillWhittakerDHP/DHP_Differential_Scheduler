import type { Ref } from 'vue'
import type { UseEntityInstanceFormReturn } from '@/types/admin/entityInstanceFormBase'

export interface BlockInstanceFormData {
  name: string
  blockShapeRef: string
  orderIndex: number
  wizardVisible: boolean
}

export interface UseBlockInstanceFormReturn
  extends UseEntityInstanceFormReturn<BlockInstanceFormData> {
  blockTypeOptions: Ref<Array<{ id: string; name: string }>>
}
