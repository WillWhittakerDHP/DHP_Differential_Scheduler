import type { Ref } from 'vue'
import type { UseEntityInstanceFormReturn } from '@/types/admin/entityInstanceFormBase'
import type { WizardPlacement } from '@shared/constants/wizardPlacement'

export interface BlockInstanceFormData {
  name: string
  blockShapeRef: string
  orderIndex: number
  wizardPlacement: WizardPlacement
}

export interface UseBlockInstanceFormReturn
  extends UseEntityInstanceFormReturn<BlockInstanceFormData> {
  blockTypeOptions: Ref<Array<{ id: string; name: string }>>
}
