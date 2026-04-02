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
    ownerInfo:
      contacts.additionalContacts.find((c) => c.role === 'owner') ?? {
        firstName: '',
        lastName: '',
        email: '',
      },
    showAnotherClient: contacts.additionalContacts.some((c) => c.role === 'anotherClient'),
    showTransactionManager: contacts.additionalContacts.some((c) => c.role === 'transactionManager'),
    showOwner: contacts.additionalContacts.some((c) => c.role === 'owner'),
  }
}
