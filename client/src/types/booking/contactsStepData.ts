import type { Ref } from 'vue'
import type { ContactInfoBase } from '@shared/types/contactTypes'
import type { WizardStateData } from '@/types/booking/wizardStateData'
import type { ContactsStepData } from '@/types/wizard'

export type ContactInfo = ContactInfoBase

/** Ref bundle for contact step fields (composable internals + inject context base). */
export interface ContactRefs {
  clientInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherClientInfo: Ref<ContactInfo>
  showAnotherClient: Ref<boolean>
  transactionManagerInfo: Ref<ContactInfo>
  showTransactionManager: Ref<boolean>
  ownerInfo: Ref<ContactInfo>
  showOwner: Ref<boolean>
}

export interface UseContactsStepDataOptions {
  loadedWizardState?: Ref<WizardStateData | null>
  /** Restore contacts from parent step data when returning to step (wizard persistence). */
  restoreFrom?: Ref<ContactsStepData | null>
}

export interface UseContactsStepDataReturn {
  clientInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherClientInfo: Ref<ContactInfo>
  transactionManagerInfo: Ref<ContactInfo>
  ownerInfo: Ref<ContactInfo>
  showAnotherClient: Ref<boolean>
  showTransactionManager: Ref<boolean>
  showOwner: Ref<boolean>
  stepData: Ref<{
    clientInfo: ContactInfo
    agentInfo: ContactInfo
    anotherClientInfo: ContactInfo
    transactionManagerInfo: ContactInfo
    ownerInfo: ContactInfo
    showAnotherClient: boolean
    showTransactionManager: boolean
    showOwner: boolean
  }>
  toggleSection: (section: 'anotherClient' | 'transactionManager' | 'owner', show: boolean) => void
}
