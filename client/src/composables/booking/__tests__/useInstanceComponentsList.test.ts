/**
 * USEINSTANCECOMPONENTSLIST TESTS
 * 
 * Unit tests for useInstanceComponentsList composable.
 * Tests component aggregation for multiple services.
 * 
 * What it covers:
 * - servicesWithComponents: Services enhanced with component data
 * - getInstanceComponents: Helper to get components for a service
 * 
 * How it works:
 * - Tests with mocked global state
 * - Tests computed properties
 * 
 * Dependencies:
 * - vitest for testing
 * - vue computed for reactive state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed, ref, nextTick } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Mock useGlobal
vi.mock('../../useGlobal', () => ({
  useGlobal: () => ({
    getGlobalEntityById: vi.fn(() => null),
    getGlobalData: vi.fn(() => ({})),
  }),
}))

// Mock useComponentEntity
vi.mock('../../useComponentEntity', () => ({
  useComponentEntity: () => ({
    getComponents: vi.fn(() => []),
  }),
}))

import { useInstanceComponentsList } from '../useInstanceComponentsList'

// Helper to create mock service
function createService(id: string, options: Partial<BookingBlockInstance> = {}): BookingBlockInstance {
  return {
    id,
    name: `Service ${id}`,
    description: 'Default description',
    ...options,
  } as BookingBlockInstance
}

describe('useInstanceComponentsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('return structure', () => {
    it('should return servicesWithComponents computed', () => {
      const services = computed(() => [createService('service-1')])
      const selectedUserTypeBlock = computed(() => null)
      
      const { servicesWithComponents } = useInstanceComponentsList({
        services,
        selectedUserTypeBlock,
      })
      
      expect(servicesWithComponents).toBeDefined()
      expect(Array.isArray(servicesWithComponents.value)).toBe(true)
    })

    it('should return getInstanceComponents function', () => {
      const services = computed(() => [])
      const selectedUserTypeBlock = computed(() => null)
      
      const { getInstanceComponents } = useInstanceComponentsList({
        services,
        selectedUserTypeBlock,
      })
      
      expect(typeof getInstanceComponents).toBe('function')
    })
  })

  describe('servicesWithComponents', () => {
    it('should return empty array when no services', () => {
      const services = computed(() => [])
      const selectedUserTypeBlock = computed(() => null)
      
      const { servicesWithComponents } = useInstanceComponentsList({
        services,
        selectedUserTypeBlock,
      })
      
      expect(servicesWithComponents.value).toEqual([])
    })

    it('should return services mapped to SelectionCardItem format', () => {
      const services = computed(() => [
        createService('service-1', { name: 'Test Service' }),
      ])
      const selectedUserTypeBlock = computed(() => null)
      
      const { servicesWithComponents } = useInstanceComponentsList({
        services,
        selectedUserTypeBlock,
      })
      
      expect(servicesWithComponents.value).toHaveLength(1)
      expect(servicesWithComponents.value[0].id).toBe('service-1')
      expect(servicesWithComponents.value[0].name).toBe('Test Service')
    })

    it('should be reactive to services changes', async () => {
      const servicesRef = ref<BookingBlockInstance[]>([createService('service-1')])
      const services = computed(() => servicesRef.value)
      const selectedUserTypeBlock = computed(() => null)
      
      const { servicesWithComponents } = useInstanceComponentsList({
        services,
        selectedUserTypeBlock,
      })
      
      expect(servicesWithComponents.value).toHaveLength(1)
      
      servicesRef.value = [
        createService('service-1'),
        createService('service-2'),
      ]
      await nextTick()
      
      expect(servicesWithComponents.value).toHaveLength(2)
    })
  })

  describe('getInstanceComponents', () => {
    it('should return empty array for non-composable service', () => {
      const services = computed(() => [createService('service-1')])
      const selectedUserTypeBlock = computed(() => null)
      
      const { getInstanceComponents } = useInstanceComponentsList({
        services,
        selectedUserTypeBlock,
      })
      
      const result = getInstanceComponents(createService('service-1'))
      
      expect(result).toEqual([])
    })
  })
})
