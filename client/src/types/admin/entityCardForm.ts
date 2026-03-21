import type { Ref, ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

export interface UseEntityCardFormOptions<GE extends GlobalEntityKey = GlobalEntityKey> {
  entityKey: GE
  entity: Ref<GlobalEntity<GE>> | GlobalEntity<GE>
  entityId: Ref<string> | ComputedRef<string>
  isNew: boolean
  form?: FormContext
}

export interface UseEntityCardFormReturn {
  form: Ref<FormContext | undefined>
}
