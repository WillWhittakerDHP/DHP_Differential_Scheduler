/**
 * USECONTACTSVALIDATION TESTS
 * 
 * Unit tests for useContactsValidation composable.
 * Tests contacts step validation logic.
 * 
 * What it covers:
 * - isFormValid: Overall step validity
 * - validateForm: Validation function
 * - fieldErrors: Field-level error messages
 * 
 * How it works:
 * - Tests required client/agent fields
 * - Tests optional contact fields based on visibility
 * - Tests email validation
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { useContactsValidation } from '../useContactsValidation'
import type { ContactInfo } from '../useContactsStepData'

function createContactInfo(data: Partial<ContactInfo> = {}): ContactInfo {
  return {
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
  }
}

describe('useContactsValidation', () => {
  function createContactRefs() {
    return {
      clientInfo: ref(createContactInfo()),
      agentInfo: ref(createContactInfo()),
      anotherClientInfo: ref(createContactInfo()),
      transactionManagerInfo: ref(createContactInfo()),
      sellerInfo: ref(createContactInfo()),
    }
  }

  describe('isFormValid', () => {
    it('should return false when required fields are empty', () => {
      const contacts = createContactRefs()
      
      const { isFormValid } = useContactsValidation({
        ...contacts,
        showAnotherClient: computed(() => false),
        showTransactionManager: computed(() => false),
        showSeller: computed(() => false),
      })
      
      expect(isFormValid.value).toBe(false)
    })

    it('should return true when client and agent info is valid', () => {
      const contacts = createContactRefs()
      contacts.clientInfo.value = createContactInfo({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      })
      contacts.agentInfo.value = createContactInfo({
        firstName: 'Jane',
        lastName: 'Agent',
        email: 'jane@realty.com',
      })
      
      const { isFormValid } = useContactsValidation({
        ...contacts,
        showAnotherClient: computed(() => false),
        showTransactionManager: computed(() => false),
        showSeller: computed(() => false),
      })
      
      expect(isFormValid.value).toBe(true)
    })

    it('should require another client info when visible', () => {
      const contacts = createContactRefs()
      contacts.clientInfo.value = createContactInfo({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      })
      contacts.agentInfo.value = createContactInfo({
        firstName: 'Jane',
        lastName: 'Agent',
        email: 'jane@realty.com',
      })
      
      const { isFormValid } = useContactsValidation({
        ...contacts,
        showAnotherClient: computed(() => true),
        showTransactionManager: computed(() => false),
        showSeller: computed(() => false),
      })
      
      expect(isFormValid.value).toBe(false)
    })

    it('should not require another client info when hidden', () => {
      const contacts = createContactRefs()
      contacts.clientInfo.value = createContactInfo({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      })
      contacts.agentInfo.value = createContactInfo({
        firstName: 'Jane',
        lastName: 'Agent',
        email: 'jane@realty.com',
      })
      
      const { isFormValid } = useContactsValidation({
        ...contacts,
        showAnotherClient: computed(() => false),
        showTransactionManager: computed(() => false),
        showSeller: computed(() => false),
      })
      
      expect(isFormValid.value).toBe(true)
    })
  })

  describe('fieldErrors', () => {
    it('should have email error for invalid email', () => {
      const contacts = createContactRefs()
      contacts.clientInfo.value = createContactInfo({
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
      })
      contacts.agentInfo.value = createContactInfo({
        firstName: 'Jane',
        lastName: 'Agent',
        email: 'jane@realty.com',
      })
      
      const { fieldErrors, validateForm } = useContactsValidation({
        ...contacts,
        showAnotherClient: computed(() => false),
        showTransactionManager: computed(() => false),
        showSeller: computed(() => false),
      })
      
      validateForm()
      expect(fieldErrors.value.clientEmail).toBeDefined()
    })

    it('should have first name error when empty', () => {
      const contacts = createContactRefs()
      contacts.clientInfo.value = createContactInfo({
        firstName: '', // Empty
        lastName: 'Doe',
        email: 'john@example.com',
      })
      
      const { fieldErrors, validateForm } = useContactsValidation({
        ...contacts,
        showAnotherClient: computed(() => false),
        showTransactionManager: computed(() => false),
        showSeller: computed(() => false),
      })
      
      validateForm()
      expect(fieldErrors.value.clientFirstName).toBeDefined()
    })
  })
})
