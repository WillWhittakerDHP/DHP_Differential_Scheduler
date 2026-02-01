
import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { usePropertyFormWatchers, type PropertyFormData } from '../usePropertyFormWatchers'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

function createFormData(): PropertyFormData {
  return {
    address: ref(''),
    unit: ref(''),
    city: ref(''),
    state: ref(''),
    zipCode: ref(''),
    propertySize: ref<number | null>(null),
    numberOfUnits: ref<number | null>(null),
    mlsNumber: ref(''),
    squareFootage: ref<number | null>(null),
    bedrooms: ref<number | null>(null),
    bathrooms: ref<number | null>(null),
    foundationAccess: ref<'basement' | 'crawlspace' | 'slab' | null>(null),
    additionalUnits: ref<number | null>(null),
  }
}

describe('usePropertyFormWatchers', () => {
  describe('MLS data syncing', () => {
    it('should sync squareFootage to propertySize when propertySize is null', async () => {
      const formData = createFormData()
      
      usePropertyFormWatchers({
        formData,
        loadedWizardState: null,
      })
      
      formData.squareFootage.value = 2500
      await nextTick()
      
      expect(formData.propertySize.value).toBe(2500)
    })

    it('should not overwrite existing propertySize when squareFootage changes', async () => {
      const formData = createFormData()
      formData.propertySize.value = 3000
      
      usePropertyFormWatchers({
        formData,
        loadedWizardState: null,
      })
      
      formData.squareFootage.value = 2500
      await nextTick()
      
      expect(formData.propertySize.value).toBe(3000)
    })

    it('should sync additionalUnits to numberOfUnits when numberOfUnits is null', async () => {
      const formData = createFormData()
      
      usePropertyFormWatchers({
        formData,
        loadedWizardState: null,
      })
      
      formData.additionalUnits.value = 4
      await nextTick()
      
      expect(formData.numberOfUnits.value).toBe(4)
    })

    it('should not overwrite existing numberOfUnits when additionalUnits changes', async () => {
      const formData = createFormData()
      formData.numberOfUnits.value = 6
      
      usePropertyFormWatchers({
        formData,
        loadedWizardState: null,
      })
      
      formData.additionalUnits.value = 4
      await nextTick()
      
      expect(formData.numberOfUnits.value).toBe(6)
    })
  })

  describe('loaded wizard state population', () => {
    it('should populate form fields from loaded wizard state', async () => {
      const formData = createFormData()
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      usePropertyFormWatchers({
        formData,
        loadedWizardState,
      })
      
      loadedWizardState.value = {
        propertyDetails: {
          address: '123 Main St',
          unit: 'A',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          propertySize: 2500,
          numberOfUnits: 4,
          mlsNumber: 'MLS123',
          squareFootage: 2500,
          bedrooms: 3,
          bathrooms: 2,
          foundationAccess: 'basement',
          additionalUnits: 3,
        },
      } as WizardStateData
      await nextTick()
      
      expect(formData.address.value).toBe('123 Main St')
      expect(formData.unit.value).toBe('A')
      expect(formData.city.value).toBe('Chicago')
      expect(formData.state.value).toBe('IL')
      expect(formData.zipCode.value).toBe('60601')
      expect(formData.propertySize.value).toBe(2500)
      expect(formData.numberOfUnits.value).toBe(4)
    })

    it('should handle null loaded wizard state', async () => {
      const formData = createFormData()
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      usePropertyFormWatchers({
        formData,
        loadedWizardState,
      })
      
      await nextTick()
      
      expect(formData.address.value).toBe('')
    })

    it('should handle invalid foundation access values', async () => {
      const formData = createFormData()
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      usePropertyFormWatchers({
        formData,
        loadedWizardState,
      })
      
      loadedWizardState.value = {
        propertyDetails: {
          address: '123 Main St',
          foundationAccess: 'invalid' as unknown,
        },
      } as WizardStateData
      await nextTick()
      
      expect(formData.foundationAccess.value).toBeNull()
    })
  })
})
