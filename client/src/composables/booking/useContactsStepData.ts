/**
 * WHY: Contacts Step Data Composable

LEARNING: Extracts contact form data mana...
 */
import { ref, watch, computed } from 'vue'
import { createLogger } from '@/utils/logger'
import type { ContactInfo, UseContactsStepDataOptions, UseContactsStepDataReturn } from '@/types/booking/contactsStepData'

export type { ContactInfo, UseContactsStepDataOptions, UseContactsStepDataReturn } from '@/types/booking/contactsStepData'

const logger = createLogger('useContactsStepData')

function contactField(value: string | null | undefined, context: string): string {
  if (value === null || value === undefined) {
    logger.warn('Contact field missing', { context })
    return ''
  }
  return value
}

export function useContactsStepData(
  options: UseContactsStepDataOptions = {}
): UseContactsStepDataReturn {
  const { loadedWizardState } = options
  
  // LEARNING: Reactive state for contact information
  // PATTERN: Refs for always-visible contacts, reactive object for optional sections
  const clientInfo = ref<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
  })

  const agentInfo = ref<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
  })

  const anotherClientInfo = ref<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
  })

  const transactionManagerInfo = ref<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
  })

  const sellerInfo = ref<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
  })

  // LEARNING: Reactive state for optional section visibility
  // PATTERN: Refs for boolean visibility flags
  const showAnotherClient = ref(false)
  const showTransactionManager = ref(false)
  const showSeller = ref(false)

  const toggleSection = (
    section: 'anotherClient' | 'transactionManager' | 'seller',
    show: boolean
  ): void => {
    if (section === 'anotherClient') {
      showAnotherClient.value = show
      if (!show) {
        anotherClientInfo.value = { firstName: '', lastName: '', email: '' }
      }
    } else if (section === 'transactionManager') {
      showTransactionManager.value = show
      if (!show) {
        transactionManagerInfo.value = { firstName: '', lastName: '', email: '' }
      }
    } else if (section === 'seller') {
      showSeller.value = show
      if (!show) {
        sellerInfo.value = { firstName: '', lastName: '', email: '' }
      }
    }
  }

  /**
   * LEARNING: Watch loaded wizard state and populate contact form fields
   */
  if (loadedWizardState) {
    watch(loadedWizardState, (newState) => {
      if (newState?.contacts) {
        const contacts = newState.contacts
        
        if (contacts.client) {
          clientInfo.value = {
            firstName: contactField(contacts.client.firstName, 'client.firstName'),
            lastName: contactField(contacts.client.lastName, 'client.lastName'),
            email: contactField(contacts.client.email, 'client.email')
          }
        }

        if (contacts.agent) {
          agentInfo.value = {
            firstName: contactField(contacts.agent.firstName, 'agent.firstName'),
            lastName: contactField(contacts.agent.lastName, 'agent.lastName'),
            email: contactField(contacts.agent.email, 'agent.email')
          }
        }
        
        // WHY: Functional approach avoids forEach with property assignments
        // PATTERN: Find contacts by role and update refs conditionally
        if (contacts.additionalContacts && contacts.additionalContacts.length > 0) {
          const anotherClientContact = contacts.additionalContacts.find(c => c.role === 'anotherClient')
          if (anotherClientContact) {
            anotherClientInfo.value = {
              firstName: contactField(anotherClientContact.firstName, 'anotherClient.firstName'),
              lastName: contactField(anotherClientContact.lastName, 'anotherClient.lastName'),
              email: contactField(anotherClientContact.email, 'anotherClient.email')
            }
            showAnotherClient.value = true
          }

          const transactionManagerContact = contacts.additionalContacts.find(c => c.role === 'transactionManager')
          if (transactionManagerContact) {
            transactionManagerInfo.value = {
              firstName: contactField(transactionManagerContact.firstName, 'transactionManager.firstName'),
              lastName: contactField(transactionManagerContact.lastName, 'transactionManager.lastName'),
              email: contactField(transactionManagerContact.email, 'transactionManager.email')
            }
            showTransactionManager.value = true
          }

          const sellerContact = contacts.additionalContacts.find(c => c.role === 'seller')
          if (sellerContact) {
            sellerInfo.value = {
              firstName: contactField(sellerContact.firstName, 'seller.firstName'),
              lastName: contactField(sellerContact.lastName, 'seller.lastName'),
              email: contactField(sellerContact.email, 'seller.email')
            }
            showSeller.value = true
          }
        }
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
    showSeller: showSeller.value
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
    toggleSection
  }
}

