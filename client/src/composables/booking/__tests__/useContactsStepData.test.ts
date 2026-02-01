/**
 * USECONTACTSSTEPDATA TESTS
 * 
 * Unit tests for useContactsStepData composable.
 * Tests contact form data management and loaded wizard state handling.
 * 
 * What it covers:
 * - Initial state: Default contact values
 * - toggleSection: Show/hide optional contact sections
 * - Loaded wizard state: Populating form from appointment data
 * - stepData: Aggregated contact form data
 * 
 * How it works:
 * - Tests refs and computed properties
 * - Tests watcher behavior with loadedWizardState
 * - Tests section toggle logic (show/hide and data clearing)
 * 
 * What it validates:
 * - Default client/agent info populated
 * - Optional sections hidden by default with empty data
 * - Section toggle shows/hides and clears data when hiding
 * - Loaded wizard state populates all contact fields correctly
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/nextTick for reactive state testing
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useContactsStepData, type ContactInfo } from '../useContactsStepData'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

describe('useContactsStepData', () => {
  describe('initial state', () => {
    it('should have default client info populated', () => {
      const { clientInfo } = useContactsStepData()
      
      expect(clientInfo.value.firstName).toBe('John')
      expect(clientInfo.value.lastName).toBe('Doe')
      expect(clientInfo.value.email).toBe('john.doe@example.com')
    })

    it('should have default agent info populated', () => {
      const { agentInfo } = useContactsStepData()
      
      expect(agentInfo.value.firstName).toBe('Jane')
      expect(agentInfo.value.lastName).toBe('Smith')
      expect(agentInfo.value.email).toBe('jane.smith@realty.com')
    })

    it('should have empty optional contact info', () => {
      const { anotherClientInfo, transactionManagerInfo, sellerInfo } = useContactsStepData()
      
      expect(anotherClientInfo.value).toEqual({ firstName: '', lastName: '', email: '' })
      expect(transactionManagerInfo.value).toEqual({ firstName: '', lastName: '', email: '' })
      expect(sellerInfo.value).toEqual({ firstName: '', lastName: '', email: '' })
    })

    it('should have optional sections hidden by default', () => {
      const { showAnotherClient, showTransactionManager, showSeller } = useContactsStepData()
      
      expect(showAnotherClient.value).toBe(false)
      expect(showTransactionManager.value).toBe(false)
      expect(showSeller.value).toBe(false)
    })
  })

  describe('toggleSection', () => {
    it('should show anotherClient section', () => {
      const { showAnotherClient, toggleSection } = useContactsStepData()
      
      toggleSection('anotherClient', true)
      
      expect(showAnotherClient.value).toBe(true)
    })

    it('should hide and clear anotherClient section', () => {
      const { showAnotherClient, anotherClientInfo, toggleSection } = useContactsStepData()
      
      toggleSection('anotherClient', true)
      anotherClientInfo.value = { firstName: 'Test', lastName: 'User', email: 'test@example.com' }
      
      toggleSection('anotherClient', false)
      
      expect(showAnotherClient.value).toBe(false)
      expect(anotherClientInfo.value).toEqual({ firstName: '', lastName: '', email: '' })
    })

    it('should show transactionManager section', () => {
      const { showTransactionManager, toggleSection } = useContactsStepData()
      
      toggleSection('transactionManager', true)
      
      expect(showTransactionManager.value).toBe(true)
    })

    it('should hide and clear transactionManager section', () => {
      const { showTransactionManager, transactionManagerInfo, toggleSection } = useContactsStepData()
      
      toggleSection('transactionManager', true)
      transactionManagerInfo.value = { firstName: 'Trans', lastName: 'Manager', email: 'tm@example.com' }
      
      toggleSection('transactionManager', false)
      
      expect(showTransactionManager.value).toBe(false)
      expect(transactionManagerInfo.value).toEqual({ firstName: '', lastName: '', email: '' })
    })

    it('should show seller section', () => {
      const { showSeller, toggleSection } = useContactsStepData()
      
      toggleSection('seller', true)
      
      expect(showSeller.value).toBe(true)
    })

    it('should hide and clear seller section', () => {
      const { showSeller, sellerInfo, toggleSection } = useContactsStepData()
      
      toggleSection('seller', true)
      sellerInfo.value = { firstName: 'Seller', lastName: 'Name', email: 'seller@example.com' }
      
      toggleSection('seller', false)
      
      expect(showSeller.value).toBe(false)
      expect(sellerInfo.value).toEqual({ firstName: '', lastName: '', email: '' })
    })

    it('should not clear data when showing section', () => {
      const { anotherClientInfo, toggleSection } = useContactsStepData()
      
      anotherClientInfo.value = { firstName: 'Existing', lastName: 'Data', email: 'existing@example.com' }
      
      toggleSection('anotherClient', true)
      
      expect(anotherClientInfo.value.firstName).toBe('Existing')
    })
  })

  describe('stepData computed', () => {
    it('should aggregate all contact form data', () => {
      const { stepData, clientInfo, agentInfo, toggleSection } = useContactsStepData()
      
      clientInfo.value.firstName = 'Modified'
      toggleSection('anotherClient', true)
      
      expect(stepData.value.clientInfo.firstName).toBe('Modified')
      expect(stepData.value.showAnotherClient).toBe(true)
    })

    it('should include all required fields', () => {
      const { stepData } = useContactsStepData()
      
      expect(stepData.value).toHaveProperty('clientInfo')
      expect(stepData.value).toHaveProperty('agentInfo')
      expect(stepData.value).toHaveProperty('anotherClientInfo')
      expect(stepData.value).toHaveProperty('transactionManagerInfo')
      expect(stepData.value).toHaveProperty('sellerInfo')
      expect(stepData.value).toHaveProperty('showAnotherClient')
      expect(stepData.value).toHaveProperty('showTransactionManager')
      expect(stepData.value).toHaveProperty('showSeller')
    })

    it('should be reactive to ref changes', async () => {
      const { stepData, clientInfo } = useContactsStepData()
      
      const originalFirstName = stepData.value.clientInfo.firstName
      clientInfo.value.firstName = 'NewFirstName'
      
      await nextTick()
      
      expect(stepData.value.clientInfo.firstName).toBe('NewFirstName')
      expect(stepData.value.clientInfo.firstName).not.toBe(originalFirstName)
    })
  })

  describe('loadedWizardState', () => {
    function createWizardState(contacts: WizardStateData['contacts']): WizardStateData {
      return {
        contacts,
        selectedServices: [],
        selectedPropertyTypeBlocks: [],
        selectedOptionTypeBlocks: [],
        selectedUserTypeBlock: null,
        propertyDetails: null,
        availability: null,
      } as WizardStateData
    }

    it('should populate client info from loaded state', async () => {
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { clientInfo } = useContactsStepData({ loadedWizardState })
      
      loadedWizardState.value = createWizardState({
        client: { firstName: 'Loaded', lastName: 'Client', email: 'loaded@client.com' },
        agent: null,
        additionalContacts: [],
      })
      
      await nextTick()
      
      expect(clientInfo.value.firstName).toBe('Loaded')
      expect(clientInfo.value.lastName).toBe('Client')
      expect(clientInfo.value.email).toBe('loaded@client.com')
    })

    it('should populate agent info from loaded state', async () => {
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { agentInfo } = useContactsStepData({ loadedWizardState })
      
      loadedWizardState.value = createWizardState({
        client: null,
        agent: { firstName: 'Loaded', lastName: 'Agent', email: 'loaded@agent.com' },
        additionalContacts: [],
      })
      
      await nextTick()
      
      expect(agentInfo.value.firstName).toBe('Loaded')
      expect(agentInfo.value.lastName).toBe('Agent')
      expect(agentInfo.value.email).toBe('loaded@agent.com')
    })

    it('should populate anotherClient from additional contacts and show section', async () => {
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { anotherClientInfo, showAnotherClient } = useContactsStepData({ loadedWizardState })
      
      loadedWizardState.value = createWizardState({
        client: null,
        agent: null,
        additionalContacts: [
          { role: 'anotherClient', firstName: 'Another', lastName: 'Client', email: 'another@client.com' },
        ],
      })
      
      await nextTick()
      
      expect(anotherClientInfo.value.firstName).toBe('Another')
      expect(anotherClientInfo.value.lastName).toBe('Client')
      expect(showAnotherClient.value).toBe(true)
    })

    it('should populate transactionManager from additional contacts and show section', async () => {
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { transactionManagerInfo, showTransactionManager } = useContactsStepData({ loadedWizardState })
      
      loadedWizardState.value = createWizardState({
        client: null,
        agent: null,
        additionalContacts: [
          { role: 'transactionManager', firstName: 'Trans', lastName: 'Manager', email: 'tm@company.com' },
        ],
      })
      
      await nextTick()
      
      expect(transactionManagerInfo.value.firstName).toBe('Trans')
      expect(transactionManagerInfo.value.lastName).toBe('Manager')
      expect(showTransactionManager.value).toBe(true)
    })

    it('should populate seller from additional contacts and show section', async () => {
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { sellerInfo, showSeller } = useContactsStepData({ loadedWizardState })
      
      loadedWizardState.value = createWizardState({
        client: null,
        agent: null,
        additionalContacts: [
          { role: 'seller', firstName: 'Seller', lastName: 'Person', email: 'seller@home.com' },
        ],
      })
      
      await nextTick()
      
      expect(sellerInfo.value.firstName).toBe('Seller')
      expect(sellerInfo.value.lastName).toBe('Person')
      expect(showSeller.value).toBe(true)
    })

    it('should populate all contacts from loaded state', async () => {
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const {
        clientInfo,
        agentInfo,
        anotherClientInfo,
        transactionManagerInfo,
        sellerInfo,
        showAnotherClient,
        showTransactionManager,
        showSeller,
      } = useContactsStepData({ loadedWizardState })
      
      loadedWizardState.value = createWizardState({
        client: { firstName: 'Client', lastName: 'One', email: 'client@one.com' },
        agent: { firstName: 'Agent', lastName: 'Two', email: 'agent@two.com' },
        additionalContacts: [
          { role: 'anotherClient', firstName: 'Another', lastName: 'Three', email: 'another@three.com' },
          { role: 'transactionManager', firstName: 'Trans', lastName: 'Four', email: 'trans@four.com' },
          { role: 'seller', firstName: 'Seller', lastName: 'Five', email: 'seller@five.com' },
        ],
      })
      
      await nextTick()
      
      expect(clientInfo.value.firstName).toBe('Client')
      expect(agentInfo.value.firstName).toBe('Agent')
      expect(anotherClientInfo.value.firstName).toBe('Another')
      expect(transactionManagerInfo.value.firstName).toBe('Trans')
      expect(sellerInfo.value.firstName).toBe('Seller')
      expect(showAnotherClient.value).toBe(true)
      expect(showTransactionManager.value).toBe(true)
      expect(showSeller.value).toBe(true)
    })

    it('should handle null/undefined values gracefully', async () => {
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { clientInfo } = useContactsStepData({ loadedWizardState })
      
      loadedWizardState.value = createWizardState({
        client: { firstName: null as unknown as string, lastName: undefined as unknown as string, email: '' },
        agent: null,
        additionalContacts: [],
      })
      
      await nextTick()
      
      expect(clientInfo.value.firstName).toBe('')
      expect(clientInfo.value.lastName).toBe('')
      expect(clientInfo.value.email).toBe('')
    })

    it('should not modify state when loadedWizardState has no contacts', async () => {
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { clientInfo } = useContactsStepData({ loadedWizardState })
      const originalFirstName = clientInfo.value.firstName
      
      loadedWizardState.value = createWizardState({
        client: null,
        agent: null,
        additionalContacts: [],
      })
      
      await nextTick()
      
      expect(clientInfo.value.firstName).toBe(originalFirstName)
    })

    it('should populate immediately if loadedWizardState has initial value', () => {
      const loadedWizardState = ref<WizardStateData | null>(createWizardState({
        client: { firstName: 'Immediate', lastName: 'Load', email: 'immediate@load.com' },
        agent: null,
        additionalContacts: [],
      }))
      
      const { clientInfo } = useContactsStepData({ loadedWizardState })
      
      // Should populate immediately due to { immediate: true } on watcher
      expect(clientInfo.value.firstName).toBe('Immediate')
    })
  })

  describe('without loadedWizardState option', () => {
    it('should work without loadedWizardState option', () => {
      const result = useContactsStepData()
      
      expect(result.clientInfo.value).toBeDefined()
      expect(result.toggleSection).toBeDefined()
    })

    it('should work with empty options', () => {
      const result = useContactsStepData({})
      
      expect(result.clientInfo.value).toBeDefined()
    })
  })
})
