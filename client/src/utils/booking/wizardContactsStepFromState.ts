/**
 * WHY: Maps persisted wizard contacts into ContactsStep form shape (pure).
 */

import type { ContactsStepData } from '@/types/wizard'
import type { WizardStateData } from '@/types/booking/wizardStateData'

/** Legacy persisted wizard JSON may use `client` / `anotherClient` (pre-rename). */
type ContactsWithLegacy = WizardStateData['contacts'] & {
  client?: { firstName: string; lastName: string; email: string }
  additionalContacts?: Array<{
    firstName: string
    lastName: string
    email: string
    role: string
  }>
}

function isAnotherBuyerRole(role: string): boolean {
  return role === 'anotherBuyer' || role === 'anotherClient'
}

export function contactsStepDataFromWizardContacts(
  contacts: WizardStateData['contacts']
): ContactsStepData {
  const c = contacts as ContactsWithLegacy
  const additional = c.additionalContacts ?? []
  const anotherFromRole = additional.find((ac) => isAnotherBuyerRole(ac.role))
  const anotherBuyerInfo =
    anotherFromRole ?? {
      firstName: '',
      lastName: '',
      email: '',
    }
  const buyerBlock = c.buyer ?? c.client ?? { firstName: '', lastName: '', email: '' }
  return {
    buyerInfo: buyerBlock,
    agentInfo: c.agent,
    anotherBuyerInfo,
    ownerInfo:
      additional.find((ac) => ac.role === 'owner') ?? {
        firstName: '',
        lastName: '',
        email: '',
      },
    showAnotherBuyer: additional.some((ac) => isAnotherBuyerRole(ac.role)),
    showOwner: additional.some((ac) => ac.role === 'owner'),
  }
}
