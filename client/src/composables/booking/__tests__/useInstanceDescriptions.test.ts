/**
 * USEINSTANCEDESCRIPTIONS TESTS
 * 
 * Unit tests for useInstanceDescriptions composable.
 * Tests description filtering based on user type context.
 * 
 * What it covers:
 * - getFilteredDescription: Helper function for filtering descriptions
 * - instancesWithDescriptions: Computed instances with filtered descriptions
 * 
 * How it works:
 * - Tests computed property reactivity with user type changes
 * - Tests description filtering delegation to utility functions
 * 
 * What it validates:
 * - Descriptions are filtered by selected user type name (lowercase)
 * - Computed property updates when instances or user type changes
 * - Legacy export provides same functionality
 * 
 * Dependencies:
 * - vitest for testing
 * - vue computed/ref for reactive state
 * - serviceDescriptions utilities (tested separately)
 */

import { describe, it, expect } from 'vitest'
import { computed, ref, nextTick } from 'vue'
import {
  useInstanceDescriptions,
} from '../useInstanceDescriptions'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Helper to create mock instance
function createInstance(
  id: string,
  options: {
    name?: string
    description?: string
    descriptions?: Array<{
      text: string
      userTypeBlock: string | null
      isDefault?: boolean
    }>
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Instance ${id}`,
    description: options.description ?? 'Default description',
    descriptions: options.descriptions as BookingBlockInstance['descriptions'],
    baseSqFt: 1000,
    icon: 'home',
    active: true,
    isDependentInstance: false,
    differential: false,
    orderIndex: 0,
    blockShape: 'Test Shape',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

// Helper to create user type block
function createUserTypeBlock(name: string): BookingBlockInstance {
  return createInstance(`user-type-${name.toLowerCase()}`, { name })
}

describe('useInstanceDescriptions', () => {
  describe('getFilteredDescription', () => {
    it('should delegate to getFilteredServiceDescription utility', () => {
      const instances = computed(() => [
        createInstance('i1', {
          descriptions: [
            { text: 'Buyer desc', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Generic desc', userTypeBlock: null, isDefault: true },
          ],
        }),
      ])
      const selectedUserTypeBlock = computed(() => null)
      
      const { getFilteredDescription } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      // Should return buyer-specific description
      const result = getFilteredDescription(instances.value[0], 'buyer')
      expect(result).toBe('Buyer desc')
    })

    it('should return default description when no user type match', () => {
      const instances = computed(() => [
        createInstance('i1', {
          descriptions: [
            { text: 'Buyer desc', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Default desc', userTypeBlock: null, isDefault: true },
          ],
        }),
      ])
      const selectedUserTypeBlock = computed(() => null)
      
      const { getFilteredDescription } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      const result = getFilteredDescription(instances.value[0], 'seller')
      expect(result).toBe('Default desc')
    })

    it('should return instance description when no descriptions array', () => {
      const instances = computed(() => [
        createInstance('i1', {
          description: 'Fallback description',
          descriptions: undefined,
        }),
      ])
      const selectedUserTypeBlock = computed(() => null)
      
      const { getFilteredDescription } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      const result = getFilteredDescription(instances.value[0], 'buyer')
      expect(result).toBe('Fallback description')
    })
  })

  describe('instancesWithDescriptions', () => {
    it('should filter descriptions based on selected user type', () => {
      const instances = computed(() => [
        createInstance('i1', {
          descriptions: [
            { text: 'Buyer Service 1', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Seller Service 1', userTypeBlock: 'seller', isDefault: false },
          ],
        }),
      ])
      const selectedUserTypeBlock = computed(() => createUserTypeBlock('Buyer'))
      
      const { instancesWithDescriptions } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      expect(instancesWithDescriptions.value[0].description).toBe('Buyer Service 1')
    })

    it('should use lowercase user type name for matching', () => {
      const instances = computed(() => [
        createInstance('i1', {
          descriptions: [
            { text: 'Buyer desc', userTypeBlock: 'buyer', isDefault: false },
          ],
        }),
      ])
      // User type name is "BUYER" (uppercase)
      const selectedUserTypeBlock = computed(() => createUserTypeBlock('BUYER'))
      
      const { instancesWithDescriptions } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      // Should still match because we lowercase the name
      expect(instancesWithDescriptions.value[0].description).toBe('Buyer desc')
    })

    it('should handle null selected user type', () => {
      const instances = computed(() => [
        createInstance('i1', {
          descriptions: [
            { text: 'Buyer desc', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Default', userTypeBlock: null, isDefault: true },
          ],
        }),
      ])
      const selectedUserTypeBlock = computed(() => null)
      
      const { instancesWithDescriptions } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      expect(instancesWithDescriptions.value[0].description).toBe('Default')
    })

    it('should preserve other instance properties', () => {
      const instances = computed(() => [
        createInstance('i1', {
          name: 'Test Service',
          descriptions: [
            { text: 'Filtered desc', userTypeBlock: null, isDefault: true },
          ],
        }),
      ])
      const selectedUserTypeBlock = computed(() => null)
      
      const { instancesWithDescriptions } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      expect(instancesWithDescriptions.value[0].id).toBe('i1')
      expect(instancesWithDescriptions.value[0].name).toBe('Test Service')
    })

    it('should be reactive to instances changes', async () => {
      const instancesRef = ref<BookingBlockInstance[]>([
        createInstance('i1', {
          descriptions: [
            { text: 'First desc', userTypeBlock: null, isDefault: true },
          ],
        }),
      ])
      const instances = computed(() => instancesRef.value)
      const selectedUserTypeBlock = computed(() => null)
      
      const { instancesWithDescriptions } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      expect(instancesWithDescriptions.value).toHaveLength(1)
      
      // Add another instance
      instancesRef.value = [
        ...instancesRef.value,
        createInstance('i2', {
          descriptions: [
            { text: 'Second desc', userTypeBlock: null, isDefault: true },
          ],
        }),
      ]
      
      await nextTick()
      
      expect(instancesWithDescriptions.value).toHaveLength(2)
    })

    it('should be reactive to user type changes', async () => {
      const instances = computed(() => [
        createInstance('i1', {
          descriptions: [
            { text: 'Buyer desc', userTypeBlock: 'buyer', isDefault: false },
            { text: 'Seller desc', userTypeBlock: 'seller', isDefault: false },
          ],
        }),
      ])
      const userTypeRef = ref<BookingBlockInstance | null>(createUserTypeBlock('Buyer'))
      const selectedUserTypeBlock = computed(() => userTypeRef.value)
      
      const { instancesWithDescriptions } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      expect(instancesWithDescriptions.value[0].description).toBe('Buyer desc')
      
      // Change user type
      userTypeRef.value = createUserTypeBlock('Seller')
      
      await nextTick()
      
      expect(instancesWithDescriptions.value[0].description).toBe('Seller desc')
    })

    it('should handle empty instances array', () => {
      const instances = computed(() => [] as BookingBlockInstance[])
      const selectedUserTypeBlock = computed(() => null)
      
      const { instancesWithDescriptions } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      expect(instancesWithDescriptions.value).toEqual([])
    })

    it('should handle multiple instances', () => {
      const instances = computed(() => [
        createInstance('i1', {
          descriptions: [
            { text: 'Service 1 Buyer', userTypeBlock: 'buyer', isDefault: false },
          ],
        }),
        createInstance('i2', {
          descriptions: [
            { text: 'Service 2 Buyer', userTypeBlock: 'buyer', isDefault: false },
          ],
        }),
      ])
      const selectedUserTypeBlock = computed(() => createUserTypeBlock('Buyer'))
      
      const { instancesWithDescriptions } = useInstanceDescriptions({
        instances,
        selectedUserTypeBlock,
      })
      
      expect(instancesWithDescriptions.value[0].description).toBe('Service 1 Buyer')
      expect(instancesWithDescriptions.value[1].description).toBe('Service 2 Buyer')
    })
  })
})
