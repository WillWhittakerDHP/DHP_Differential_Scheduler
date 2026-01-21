/**
 * USEWIZARDDISPLAY TESTS
 * 
 * Unit tests for useWizardDisplay composable.
 * Tests step subtitle generation and loaded data display.
 * 
 * What it covers:
 * - stepSubtitles: Dynamic subtitle generation based on selected services
 * - loadedServiceName: Service name from loaded state or selections
 * - loadedPropertyAddress: Property address from loaded state
 * 
 * How it works:
 * - Tests subtitle updates when services selected
 * - Tests loaded data extraction from wizard state
 * - Tests computed reactivity
 * 
 * What it validates:
 * - Step 0 subtitle updates with service name
 * - Multiple services show count
 * - Property address formatting
 * - Null handling for empty state
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { useWizardDisplay, type StepDefinition } from '../useWizardDisplay'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { WizardStateData } from '@/utils/transformers/appointmentToWizardTransformer'

// Mock steps
const mockSteps: StepDefinition[] = [
  { icon: 'wrench', title: 'Services', subtitle: 'Identifying your needs' },
  { icon: 'home', title: 'Property', subtitle: 'About your property' },
  { icon: 'calendar', title: 'Availability', subtitle: 'Pick a time' },
  { icon: 'user', title: 'Contacts', subtitle: 'Your information' },
  { icon: 'check', title: 'Confirm', subtitle: 'Review and confirm' },
]

// Helper to create mock service
function createService(id: string, name: string): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name,
    description: 'Test service',
    icon: 'star',
    baseSqFt: 0,
    active: true,
    isDependentInstance: false,
    differential: false,
    orderIndex: 0,
    blockShape: 'Service',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

describe('useWizardDisplay', () => {
  describe('stepSubtitles', () => {
    it('should return base subtitles when no services selected', () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { stepSubtitles } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(stepSubtitles.value[0]).toBe('Identifying your needs')
      expect(stepSubtitles.value[1]).toBe('About your property')
    })

    it('should update step 0 subtitle with single service name', () => {
      const selectedServices = ref<BookingBlockInstance[]>([
        createService('s1', 'Home Inspection'),
      ])
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { stepSubtitles } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(stepSubtitles.value[0]).toBe('Identifying your needs - Home Inspection')
    })

    it('should show count for multiple services', () => {
      const selectedServices = ref<BookingBlockInstance[]>([
        createService('s1', 'Home Inspection'),
        createService('s2', 'Radon Test'),
        createService('s3', 'Termite Inspection'),
      ])
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { stepSubtitles } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(stepSubtitles.value[0]).toBe('Identifying your needs - Home Inspection + 2 more')
    })

    it('should be reactive to service selection changes', async () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { stepSubtitles } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(stepSubtitles.value[0]).toBe('Identifying your needs')
      
      selectedServices.value = [createService('s1', 'Mold Test')]
      await nextTick()
      
      expect(stepSubtitles.value[0]).toBe('Identifying your needs - Mold Test')
    })
  })

  describe('loadedServiceName', () => {
    it('should return null when no loaded state or selections', () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { loadedServiceName } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedServiceName.value).toBeNull()
    })

    it('should return service name from loaded state', () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>({
        services: [{ id: 's1', name: 'Loaded Service' }],
      } as WizardStateData)
      
      const { loadedServiceName } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedServiceName.value).toBe('Loaded Service')
    })

    it('should show count for multiple loaded services', () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>({
        services: [
          { id: 's1', name: 'Service 1' },
          { id: 's2', name: 'Service 2' },
        ],
      } as WizardStateData)
      
      const { loadedServiceName } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedServiceName.value).toBe('Service 1 + 1 more')
    })

    it('should fall back to selected services when no loaded state', () => {
      const selectedServices = ref<BookingBlockInstance[]>([
        createService('s1', 'Selected Service'),
      ])
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { loadedServiceName } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedServiceName.value).toBe('Selected Service')
    })

    it('should show count for multiple selected services', () => {
      const selectedServices = ref<BookingBlockInstance[]>([
        createService('s1', 'Service A'),
        createService('s2', 'Service B'),
        createService('s3', 'Service C'),
      ])
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { loadedServiceName } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedServiceName.value).toBe('Service A + 2 more')
    })
  })

  describe('loadedPropertyAddress', () => {
    it('should return null when no loaded state', () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>(null)
      
      const { loadedPropertyAddress } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedPropertyAddress.value).toBeNull()
    })

    it('should return null when no property details', () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>({
        services: [],
      } as WizardStateData)
      
      const { loadedPropertyAddress } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedPropertyAddress.value).toBeNull()
    })

    it('should format full address with all parts', () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>({
        propertyDetails: {
          address: '123 Main St',
          unit: '4B',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
        },
      } as WizardStateData)
      
      const { loadedPropertyAddress } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedPropertyAddress.value).toBe('123 Main St, Unit 4B, Springfield, IL, 62701')
    })

    it('should handle missing parts gracefully', () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>({
        propertyDetails: {
          address: '456 Oak Ave',
          city: 'Chicago',
          state: 'IL',
        },
      } as WizardStateData)
      
      const { loadedPropertyAddress } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedPropertyAddress.value).toBe('456 Oak Ave, Chicago, IL')
    })

    it('should return just address when only address provided', () => {
      const selectedServices = ref<BookingBlockInstance[]>([])
      const loadedWizardState = ref<WizardStateData | null>({
        propertyDetails: {
          address: '789 Pine Rd',
        },
      } as WizardStateData)
      
      const { loadedPropertyAddress } = useWizardDisplay({
        steps: mockSteps,
        selectedServices,
        loadedWizardState,
      })
      
      expect(loadedPropertyAddress.value).toBe('789 Pine Rd')
    })
  })
})
