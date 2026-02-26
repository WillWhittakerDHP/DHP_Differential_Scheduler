import type { Ref } from 'vue'
import type { ContactInfo } from '@/types/booking/contactsStepData'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

import type { UseStepValidationReturn } from '@/types/booking/stepValidation'
export interface UseContactsValidationParams {
  clientInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherClientInfo: Ref<ContactInfo>
  transactionManagerInfo: Ref<ContactInfo>
  sellerInfo: Ref<ContactInfo>
  showAnotherClient: ReadonlyVueRef<boolean>
  showTransactionManager: ReadonlyVueRef<boolean>
  showSeller: ReadonlyVueRef<boolean>
  requiresAgent?: ReadonlyVueRef<boolean>
}

export type UseContactsValidationReturn = UseStepValidationReturn
