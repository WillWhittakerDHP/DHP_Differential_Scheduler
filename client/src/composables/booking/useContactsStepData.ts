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
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

/**
 * Contact form data structure
 */
export interface ContactInfo {
  firstName: string
  lastName: string
  email: string
}

/**
 * Contacts Step Data Composable Options
 */
export interface UseContactsStepDataOptions {
  /**
   * Loaded wizard state (for populating form fields)
   */
  loadedWizardState?: Ref<WizardStateData | null>
}

/**
 * Contacts Step Data Composable Return Type
 */
export interface UseContactsStepDataReturn {
  // Contact form data
  clientInfo: Ref<ContactInfo>
  agentInfo: Ref<ContactInfo>
  anotherClientInfo: Ref<ContactInfo>
  transactionManagerInfo: Ref<ContactInfo>
  sellerInfo: Ref<ContactInfo>
  
  // Optional section visibility
  showAnotherClient: Ref<boolean>
  showTransactionManager: Ref<boolean>
  showSeller: Ref<boolean>
  
  // Step data
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
  
  // Toggle section helper
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
  // WHY: Tracks form values for all contact types
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
  // WHY: Controls which optional contact sections are shown
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
        
        // Populate client info
        if (contacts.client) {
          clientInfo.value = {
            firstName: contacts.client.firstName || '',
            lastName: contacts.client.lastName || '',
            email: contacts.client.email || ''
          }
        }
        
        // Populate agent info
        if (contacts.agent) {
          agentInfo.value = {
            firstName: contacts.agent.firstName || '',
            lastName: contacts.agent.lastName || '',
            email: contacts.agent.email || ''
          }
        }
        
        // Populate additional contacts
        // LEARNING: Use find to locate contacts by role instead of forEach with mutations
        // WHY: Functional approach avoids forEach with property assignments
        // PATTERN: Find contacts by role and update refs conditionally
        if (contacts.additionalContacts && contacts.additionalContacts.length > 0) {
          const anotherClientContact = contacts.additionalContacts.find(c => c.role === 'anotherClient')
          if (anotherClientContact) {
            anotherClientInfo.value = {
              firstName: anotherClientContact.firstName || '',
              lastName: anotherClientContact.lastName || '',
              email: anotherClientContact.email || ''
            }
            showAnotherClient.value = true
          }
          
          const transactionManagerContact = contacts.additionalContacts.find(c => c.role === 'transactionManager')
          if (transactionManagerContact) {
            transactionManagerInfo.value = {
              firstName: transactionManagerContact.firstName || '',
              lastName: transactionManagerContact.lastName || '',
              email: transactionManagerContact.email || ''
            }
            showTransactionManager.value = true
          }
          
          const sellerContact = contacts.additionalContacts.find(c => c.role === 'seller')
          if (sellerContact) {
            sellerInfo.value = {
              firstName: sellerContact.firstName || '',
              lastName: sellerContact.lastName || '',
              email: sellerContact.email || ''
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

