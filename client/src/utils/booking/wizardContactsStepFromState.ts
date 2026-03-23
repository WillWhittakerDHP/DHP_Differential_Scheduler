/**
 * WHY: Maps persisted wizard contacts into ContactsStep form shape (pure).
 */

import type { ContactsStepData } from '@/types/wizard'
import type { WizardStateData } from '@/types/booking/wizardStateData'

export function contactsStepDataFromWizardContacts(
  contacts: WizardStateData['contacts']
): ContactsStepData {
  return {
    clientInfo: contacts.client,
    agentInfo: contacts.agent,
    anotherClientInfo:
      contacts.additionalContacts.find((c) => c.role === 'anotherClient') ?? {
        firstName: '',
        lastName: '',
        email: '',
      },
    transactionManagerInfo:
      contacts.additionalContacts.find((c) => c.role === 'transactionManager') ?? {
        firstName: '',
        lastName: '',
        email: '',
      },
    sellerInfo:
      contacts.additionalContacts.find((c) => c.role === 'seller') ?? {
        firstName: '',
        lastName: '',
        email: '',
      },
    showAnotherClient: contacts.additionalContacts.some((c) => c.role === 'anotherClient'),
    showTransactionManager: contacts.additionalContacts.some((c) => c.role === 'transactionManager'),
    showSeller: contacts.additionalContacts.some((c) => c.role === 'seller'),
  }
}
