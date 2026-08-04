/**
 * WHY: Contacts Step Data Composable
 */
import type { Ref } from 'vue'
import { ref, watch, computed } from 'vue'
import { createLogger } from '@/utils/logger'
import type {
  ContactInfo,
  ContactRefs,
  UseContactsStepDataOptions,
  UseContactsStepDataReturn,
} from '@/types/booking/contactsStepData'
import type { ContactsStepData } from '@/types/wizard'
import type { WizardStateData } from '@/types/booking/wizardStateData'

const logger = createLogger('useContactsStepData')

/** Persisted wizard JSON may still use pre-rename keys (`client`, `anotherClient`). */
type LegacyWizardContacts = WizardStateData['contacts'] & {
  client?: { firstName: string; lastName: string; email: string }
  additionalContacts?: Array<{
    firstName: string
    lastName: string
    email: string
    role: string
  }>
}

function contactField(value: string | null | undefined, context: string): string {
  if (value === null || value === undefined) {
    logger.warn('Contact field missing', { context })
    return ''
  }
  return value
}

function isAnotherBuyerRole(role: string): boolean {
  return role === 'anotherBuyer' || role === 'anotherClient'
}

function populateContactFromAdditional(
  additionalContacts: Array<{ firstName: string; lastName: string; email: string; role: string }>,
  role: 'anotherBuyer' | 'owner',
  infoRef: Ref<ContactInfo>,
  showRef: Ref<boolean>
): void {
  const contact = additionalContacts.find((c) =>
    role === 'anotherBuyer' ? isAnotherBuyerRole(c.role) : c.role === 'owner'
  )
  if (!contact) return
  infoRef.value = {
    firstName: contactField(contact.firstName, `${role}.firstName`),
    lastName: contactField(contact.lastName, `${role}.lastName`),
    email: contactField(contact.email, `${role}.email`),
  }
  showRef.value = true
}

function loadContactsFromWizardState(newState: WizardStateData | null, refs: ContactRefs): void {
  if (!newState?.contacts) return
  const contacts = newState.contacts as LegacyWizardContacts

  const buyerBlock = contacts.buyer ?? contacts.client
  if (buyerBlock) {
    refs.buyerInfo.value = {
      firstName: contactField(buyerBlock.firstName, 'buyer.firstName'),
      lastName: contactField(buyerBlock.lastName, 'buyer.lastName'),
      email: contactField(buyerBlock.email, 'buyer.email'),
    }
  }

  if (contacts.agent) {
    refs.agentInfo.value = {
      firstName: contactField(contacts.agent.firstName, 'agent.firstName'),
      lastName: contactField(contacts.agent.lastName, 'agent.lastName'),
      email: contactField(contacts.agent.email, 'agent.email'),
    }
  }

  if (contacts.additionalContacts && contacts.additionalContacts.length > 0) {
    populateContactFromAdditional(
      contacts.additionalContacts,
      'anotherBuyer',
      refs.anotherBuyerInfo,
      refs.showAnotherBuyer
    )
    populateContactFromAdditional(
      contacts.additionalContacts,
      'owner',
      refs.ownerInfo,
      refs.showOwner
    )
  }
}

function restoreContactsFromStepData(data: ContactsStepData, refs: ContactRefs): void {
  refs.buyerInfo.value = {
    firstName: contactField(data.buyerInfo.firstName, 'buyer.firstName'),
    lastName: contactField(data.buyerInfo.lastName, 'buyer.lastName'),
    email: contactField(data.buyerInfo.email, 'buyer.email'),
  }
  refs.agentInfo.value = {
    firstName: contactField(data.agentInfo.firstName, 'agent.firstName'),
    lastName: contactField(data.agentInfo.lastName, 'agent.lastName'),
    email: contactField(data.agentInfo.email, 'agent.email'),
  }
  refs.anotherBuyerInfo.value = {
    firstName: contactField(data.anotherBuyerInfo.firstName, 'anotherBuyer.firstName'),
    lastName: contactField(data.anotherBuyerInfo.lastName, 'anotherBuyer.lastName'),
    email: contactField(data.anotherBuyerInfo.email, 'anotherBuyer.email'),
  }
  refs.ownerInfo.value = {
    firstName: contactField(data.ownerInfo.firstName, 'owner.firstName'),
    lastName: contactField(data.ownerInfo.lastName, 'owner.lastName'),
    email: contactField(data.ownerInfo.email, 'owner.email'),
  }
  refs.showAnotherBuyer.value = data.showAnotherBuyer
  refs.showOwner.value = data.showOwner
}

export function useContactsStepData(
  options: UseContactsStepDataOptions = {}
): UseContactsStepDataReturn {
  const { loadedWizardState, restoreFrom } = options

  const buyerInfo = ref<ContactInfo>({ firstName: '', lastName: '', email: '' })
  const agentInfo = ref<ContactInfo>({ firstName: '', lastName: '', email: '' })
  const anotherBuyerInfo = ref<ContactInfo>({ firstName: '', lastName: '', email: '' })
  const ownerInfo = ref<ContactInfo>({ firstName: '', lastName: '', email: '' })
  const showAnotherBuyer = ref(false)
  const showOwner = ref(false)

  const sectionMap: Record<'anotherBuyer' | 'owner', { show: Ref<boolean>; info: Ref<ContactInfo> }> = {
    anotherBuyer: { show: showAnotherBuyer, info: anotherBuyerInfo },
    owner: { show: showOwner, info: ownerInfo },
  }

  const toggleSection = (section: 'anotherBuyer' | 'owner', show: boolean): void => {
    const entry = sectionMap[section]
    entry.show.value = show
    if (!show) {
      entry.info.value = { firstName: '', lastName: '', email: '' }
    }
  }

  const contactRefs: ContactRefs = {
    buyerInfo,
    agentInfo,
    anotherBuyerInfo,
    showAnotherBuyer,
    ownerInfo,
    showOwner,
  }

  if (loadedWizardState) {
    watch(loadedWizardState, (newState) => loadContactsFromWizardState(newState ?? null, contactRefs), {
      immediate: true,
    })
  }

  let contactsRestored = false
  if (restoreFrom) {
    watch(restoreFrom, (data) => {
      if (!contactsRestored && data) {
        restoreContactsFromStepData(data, contactRefs)
        contactsRestored = true
      }
    }, { immediate: true })
  }

  const stepData = computed(() => ({
    buyerInfo: buyerInfo.value,
    agentInfo: agentInfo.value,
    anotherBuyerInfo: anotherBuyerInfo.value,
    ownerInfo: ownerInfo.value,
    showAnotherBuyer: showAnotherBuyer.value,
    showOwner: showOwner.value,
  }))

  return {
    buyerInfo,
    agentInfo,
    anotherBuyerInfo,
    ownerInfo,
    showAnotherBuyer,
    showOwner,
    stepData,
    toggleSection,
  }
}
