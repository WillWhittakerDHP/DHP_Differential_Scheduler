/**
 * WHY: Contacts Step Data Composable
 */
import type { Ref } from 'vue'
import { ref, watch, computed } from 'vue'
import { createLogger } from '@/utils/logger'
import type { ContactInfo, UseContactsStepDataOptions, UseContactsStepDataReturn } from '@/types/booking/contactsStepData'
import type { ContactsStepData } from '@/types/wizard'
import type { WizardStateData } from '@/types/booking/wizardStateData'

const logger = createLogger('useContactsStepData')

function contactField(value: string | null | undefined, context: string): string {
  if (value === null || value === undefined) {
    logger.warn('Contact field missing', { context })
    return ''
  }
  return value
}

interface ContactRefs {
  clientInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherClientInfo: Ref<ContactInfo>
  showAnotherClient: Ref<boolean>
  transactionManagerInfo: Ref<ContactInfo>
  showTransactionManager: Ref<boolean>
  sellerInfo: Ref<ContactInfo>
  showSeller: Ref<boolean>
}

function populateContactFromAdditional(
  additionalContacts: Array<{ firstName: string; lastName: string; email: string; role: string }>,
  role: 'anotherClient' | 'transactionManager' | 'seller',
  infoRef: Ref<ContactInfo>,
  showRef: Ref<boolean>
): void {
  const contact = additionalContacts.find((c) => c.role === role)
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
  const contacts = newState.contacts

  if (contacts.client) {
    refs.clientInfo.value = {
      firstName: contactField(contacts.client.firstName, 'client.firstName'),
      lastName: contactField(contacts.client.lastName, 'client.lastName'),
      email: contactField(contacts.client.email, 'client.email'),
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
      'anotherClient',
      refs.anotherClientInfo,
      refs.showAnotherClient
    )
    populateContactFromAdditional(
      contacts.additionalContacts,
      'transactionManager',
      refs.transactionManagerInfo,
      refs.showTransactionManager
    )
    populateContactFromAdditional(
      contacts.additionalContacts,
      'seller',
      refs.sellerInfo,
      refs.showSeller
    )
  }
}

function restoreContactsFromStepData(data: ContactsStepData, refs: ContactRefs): void {
  refs.clientInfo.value = {
    firstName: contactField(data.clientInfo.firstName, 'client.firstName'),
    lastName: contactField(data.clientInfo.lastName, 'client.lastName'),
    email: contactField(data.clientInfo.email, 'client.email'),
  }
  refs.agentInfo.value = {
    firstName: contactField(data.agentInfo.firstName, 'agent.firstName'),
    lastName: contactField(data.agentInfo.lastName, 'agent.lastName'),
    email: contactField(data.agentInfo.email, 'agent.email'),
  }
  refs.anotherClientInfo.value = {
    firstName: contactField(data.anotherClientInfo.firstName, 'anotherClient.firstName'),
    lastName: contactField(data.anotherClientInfo.lastName, 'anotherClient.lastName'),
    email: contactField(data.anotherClientInfo.email, 'anotherClient.email'),
  }
  refs.transactionManagerInfo.value = {
    firstName: contactField(data.transactionManagerInfo.firstName, 'transactionManager.firstName'),
    lastName: contactField(data.transactionManagerInfo.lastName, 'transactionManager.lastName'),
    email: contactField(data.transactionManagerInfo.email, 'transactionManager.email'),
  }
  refs.sellerInfo.value = {
    firstName: contactField(data.sellerInfo.firstName, 'seller.firstName'),
    lastName: contactField(data.sellerInfo.lastName, 'seller.lastName'),
    email: contactField(data.sellerInfo.email, 'seller.email'),
  }
  refs.showAnotherClient.value = data.showAnotherClient
  refs.showTransactionManager.value = data.showTransactionManager
  refs.showSeller.value = data.showSeller
}

export function useContactsStepData(
  options: UseContactsStepDataOptions = {}
): UseContactsStepDataReturn {
  const { loadedWizardState, restoreFrom } = options

  const clientInfo = ref<ContactInfo>({ firstName: '', lastName: '', email: '' })
  const agentInfo = ref<ContactInfo>({ firstName: '', lastName: '', email: '' })
  const anotherClientInfo = ref<ContactInfo>({ firstName: '', lastName: '', email: '' })
  const transactionManagerInfo = ref<ContactInfo>({ firstName: '', lastName: '', email: '' })
  const sellerInfo = ref<ContactInfo>({ firstName: '', lastName: '', email: '' })
  const showAnotherClient = ref(false)
  const showTransactionManager = ref(false)
  const showSeller = ref(false)

  const sectionMap: Record<'anotherClient' | 'transactionManager' | 'seller', { show: Ref<boolean>; info: Ref<ContactInfo> }> = {
    anotherClient: { show: showAnotherClient, info: anotherClientInfo },
    transactionManager: { show: showTransactionManager, info: transactionManagerInfo },
    seller: { show: showSeller, info: sellerInfo },
  }

  const toggleSection = (
    section: 'anotherClient' | 'transactionManager' | 'seller',
    show: boolean
  ): void => {
    const entry = sectionMap[section]
    entry.show.value = show
    if (!show) {
      entry.info.value = { firstName: '', lastName: '', email: '' }
    }
  }

  const contactRefs: ContactRefs = {
    clientInfo,
    agentInfo,
    anotherClientInfo,
    showAnotherClient,
    transactionManagerInfo,
    showTransactionManager,
    sellerInfo,
    showSeller,
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
    clientInfo: clientInfo.value,
    agentInfo: agentInfo.value,
    anotherClientInfo: anotherClientInfo.value,
    transactionManagerInfo: transactionManagerInfo.value,
    sellerInfo: sellerInfo.value,
    showAnotherClient: showAnotherClient.value,
    showTransactionManager: showTransactionManager.value,
    showSeller: showSeller.value,
  }))

  return {
    clientInfo,
    agentInfo,
    anotherClientInfo,
    transactionManagerInfo,
    sellerInfo,
    showAnotherClient,
    showTransactionManager,
    showSeller,
    stepData,
    toggleSection,
  }
}
