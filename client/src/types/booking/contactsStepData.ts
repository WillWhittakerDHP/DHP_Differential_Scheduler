import type { Ref } from 'vue'
import type { ContactInfoBase } from '@shared/types/contactTypes'
import type { WizardStateData } from '@/types/booking/wizardStateData'
import type { ContactsStepData } from '@/types/wizard'

export type ContactInfo = ContactInfoBase

/** Ref bundle for contact step fields (composable internals + inject context base). */
export interface ContactRefs {
  buyerInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherBuyerInfo: Ref<ContactInfo>
  showAnotherBuyer: Ref<boolean>
  ownerInfo: Ref<ContactInfo>
  showOwner: Ref<boolean>
}

export interface UseContactsStepDataOptions {
  loadedWizardState?: Ref<WizardStateData | null>
  /** Restore contacts from parent step data when returning to step (wizard persistence). */
  restoreFrom?: Ref<ContactsStepData | null>
}

export interface UseContactsStepDataReturn {
  buyerInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherBuyerInfo: Ref<ContactInfo>
  ownerInfo: Ref<ContactInfo>
  showAnotherBuyer: Ref<boolean>
  showOwner: Ref<boolean>
  stepData: Ref<{
    buyerInfo: ContactInfo
    agentInfo: ContactInfo
    anotherBuyerInfo: ContactInfo
    ownerInfo: ContactInfo
    showAnotherBuyer: boolean
    showOwner: boolean
  }>
  toggleSection: (section: 'anotherBuyer' | 'owner', show: boolean) => void
}
