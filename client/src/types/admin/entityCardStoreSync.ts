import type { Ref, ComputedRef } from 'vue'
import type { FormContext } from 'vee-validate'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseEntityCardStoreSyncOptions<GE extends GlobalEntityKey> {
  entityKey: GE
  entityId: Ref<string> | ComputedRef<string>
  form: FormContext
  isNew: boolean
  getStoreEntity: () => GlobalEntity<GE> | undefined
  initialEntity: GlobalEntity<GE>
}

export interface UseEntityCardStoreSyncReturn<GE extends GlobalEntityKey> {
  storeEntity: ComputedRef<GlobalEntity<GE> | undefined>
}
