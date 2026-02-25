import type { Ref } from 'vue'
import type { ContactInfoBase } from '@shared/types/contactTypes'
import type { WizardStateData } from '@/types/booking/wizardStateData'

export type ContactInfo = ContactInfoBase

export interface UseContactsStepDataOptions {
  loadedWizardState?: Ref<WizardStateData | null>
}

export interface UseContactsStepDataReturn {
  clientInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherClientInfo: Ref<ContactInfo>
  transactionManagerInfo: Ref<ContactInfo>
  sellerInfo: Ref<ContactInfo>
  showAnotherClient: Ref<boolean>
  showTransactionManager: Ref<boolean>
  showSeller: Ref<boolean>
  stepData: Ref<{
    clientInfo: ContactInfo
    agentInfo: ContactInfo
    anotherClientInfo: ContactInfo
    transactionManagerInfo: ContactInfo
    sellerInfo: ContactInfo
    showAnotherClient: boolean
    showTransactionManager: boolean
    showSeller: boolean
  }>
  toggleSection: (section: 'anotherClient' | 'transactionManager' | 'seller', show: boolean) => void
}
