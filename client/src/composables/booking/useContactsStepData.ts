/**
 * Contacts Step Data Composable
 * 
 * LEARNING: Extracts contact form data management and loaded wizard state handling from ContactsStep component
 * WHY: Moves business logic out of component into reusable composable
 * PATTERN: Composable that manages contact form state and watches loaded wizard state
 * 
 * This composable handles:
 * - Contact form data state (client, agent, optional contacts)
 * - Optional section visibility state
 * - Loading contact data from loaded wizard state
 */

import { ref, watch, computed, type Ref } from 'vue'
import { createLogger } from '@/utils/logger'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

const logger = createLogger('useContactsStepData')

/**
 * Use contact field value or empty string; log when value is unexpectedly null/undefined.
 * WHY: Avoid silent fallbacks that mask missing data (per explicit-error-handling rule).
 */
function contactField(value: string | null | undefined, context: string): string {
  if (value === null || value === undefined) {
    logger.warn('Contact field missing', { context })
    return ''
  }
  return value
}

export interface ContactInfo {
  firstName: string
  lastName: string
  email: string
}

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

/**
 * Contacts Step Data Composable
 * 
 * LEARNING: Manages contact form data and loaded wizard state handling
 * WHY: Extracts contact form state management from component to composable
 * PATTERN: Composable with refs for state and watcher for loaded wizard state
 */
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

  /**
   * LEARNING: Toggle optional section visibility
   * WHY: Shows/hides optional contact forms
   * PATTERN: Function that sets visibility ref and clears form data when hiding
   */
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
   * WHY: Enables loading appointment data into contacts step
   * PATTERN: Watch loadedWizardState and update local refs when data is available
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

  /**
   * LEARNING: Step data computed property
   * WHY: Exposes all contact form data for parent wizard
   * PATTERN: Computed ref that aggregates all contact refs
   */
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

