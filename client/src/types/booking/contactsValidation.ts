import type { Ref } from 'vue'
import type { ContactInfo } from '@/types/booking/contactsStepData'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

import type { UseStepValidationReturn } from '@/types/booking/stepValidation'
export interface UseContactsValidationParams {
  buyerInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherBuyerInfo: Ref<ContactInfo>
  ownerInfo: Ref<ContactInfo>
  showAnotherBuyer: ReadonlyVueRef<boolean>
  showOwner: ReadonlyVueRef<boolean>
  requiresAgent?: ReadonlyVueRef<boolean>
}

export type UseContactsValidationReturn = UseStepValidationReturn
