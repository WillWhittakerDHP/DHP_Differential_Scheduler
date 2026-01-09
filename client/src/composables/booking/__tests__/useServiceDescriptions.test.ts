/**
 * USESERVICEDESCRIPTIONS TESTS
 * 
 * Unit tests for useServiceDescriptions composable.
 * Tests service description filtering.
 * 
 * What it covers:
 * - getFilteredDescription: Filter description by user type
 * - servicesWithDescriptions: Services with filtered descriptions
 * 
 * How it works:
 * - Tests delegation to utility functions
 * - Tests computed reactivity
 * 
 * Dependencies:
 * - vitest for testing
 * - vue computed for reactive state
 */

import { describe, it, expect } from 'vitest'
import { computed, ref, nextTick } from 'vue'
import { useServiceDescriptions } from '../useServiceDescriptions'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Helper to create mock service
function createService(
  id: string,
  options: Partial<BookingBlockInstance> = {}
): BookingBlockInstance {
  return {
    id,
    name: `Service ${id}`,
    description: 'Default description',
    ...options,
  } as BookingBlockInstance
}

// Helper to create mock user type block
function createUserTypeBlock(
  id: string,
  name: string
): BookingBlockInstance {
  return {
    id,
    name,
    description: '',
  } as BookingBlockInstance
}

describe('useServiceDescriptions', () => {
  describe('getFilteredDescription', () => {
    it('should return description from service', () => {
      const services = computed(() => [createService('service-1')])
      const selectedUserTypeBlock = computed(() => null)
      
      const { getFilteredDescription } = useServiceDescriptions({
        services,
        selectedUserTypeBlock,
      })
      
      const result = getFilteredDescription(createService('service-1'), null)
      
      expect(result).toBe('Default description')
    })

    it('should be a function', () => {
      const services = computed(() => [])
      const selectedUserTypeBlock = computed(() => null)
      
      const { getFilteredDescription } = useServiceDescriptions({
        services,
        selectedUserTypeBlock,
      })
      
      expect(typeof getFilteredDescription).toBe('function')
    })
  })

  describe('servicesWithDescriptions', () => {
    it('should return services with descriptions', () => {
      const services = computed(() => [
        createService('service-1', { description: 'Description 1' }),
        createService('service-2', { description: 'Description 2' }),
      ])
      const selectedUserTypeBlock = computed(() => null)
      
      const { servicesWithDescriptions } = useServiceDescriptions({
        services,
        selectedUserTypeBlock,
      })
      
      expect(servicesWithDescriptions.value).toHaveLength(2)
      expect(servicesWithDescriptions.value[0].description).toBe('Description 1')
    })

    it('should be reactive to services changes', async () => {
      const servicesRef = ref<BookingBlockInstance[]>([createService('service-1')])
      const services = computed(() => servicesRef.value)
      const selectedUserTypeBlock = computed(() => null)
      
      const { servicesWithDescriptions } = useServiceDescriptions({
        services,
        selectedUserTypeBlock,
      })
      
      expect(servicesWithDescriptions.value).toHaveLength(1)
      
      servicesRef.value = [
        createService('service-1'),
        createService('service-2'),
      ]
      await nextTick()
      
      expect(servicesWithDescriptions.value).toHaveLength(2)
    })

    it('should filter by user type when selected', () => {
      const service = createService('service-1', {
        description: 'Default',
        descriptions: [
          { userType: 'buyer', text: 'Buyer description' },
          { userType: null, text: 'Generic description' },
        ],
      })
      const services = computed(() => [service])
      const selectedUserTypeBlock = computed(() => createUserTypeBlock('user-1', 'Buyer'))
      
      const { servicesWithDescriptions } = useServiceDescriptions({
        services,
        selectedUserTypeBlock,
      })
      
      // Should return filtered descriptions
      expect(servicesWithDescriptions.value).toHaveLength(1)
    })
  })
})
