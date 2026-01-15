/**
 * USEINSTANCEDISPLAY TESTS
 * 
 * Unit tests for useInstanceDisplay composable.
 * Tests display transformation logic for block instances.
 * 
 * What it covers:
 * - instancesWithDisplay: Computed instances with icons and descriptions
 * - Custom getFilteredDescription: Description filtering callback
 * 
 * How it works:
 * - Tests icon mapping delegation to utility function
 * - Tests description filtering with user type context
 * - Tests computed property reactivity
 * 
 * What it validates:
 * - Icons are mapped correctly
 * - Descriptions are filtered by user type when callback provided
 * - Default description used when no callback
 * - Computed updates when dependencies change
 * 
 * Dependencies:
 * - vitest for testing
 * - vue computed/ref for reactive state
 * - selectionCardItemDisplay utilities (tested separately)
 */

import { describe, it, expect, vi } from 'vitest'
import { computed, ref, nextTick } from 'vue'
import {
  useInstanceDisplay,
} from '../useInstanceDisplay'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Helper to create mock instance
function createInstance(
  id: string,
  options: {
    name?: string
    description?: string
    icon?: string
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Instance ${id}`,
    description: options.description ?? 'Default description',
    icon: options.icon ?? 'home',
    baseSqFt: 1000,
    active: true,
    dependent: false,
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

describe('useInstanceDisplay', () => {
  describe('instancesWithDisplay', () => {
    it('should return instances with display transformations', () => {
      const instances = computed(() => [
        createInstance('i1', { icon: 'home' }),
      ])
      
      const { instancesWithDisplay } = useInstanceDisplay({ instances })
      
      expect(instancesWithDisplay.value).toHaveLength(1)
      expect(instancesWithDisplay.value[0].id).toBe('i1')
    })

    it('should apply icon mapping through utility', () => {
      const instances = computed(() => [
        createInstance('i1', { icon: 'custom-icon' }),
      ])
      
      const { instancesWithDisplay } = useInstanceDisplay({ instances })
      
      // Icon should be preserved/mapped
      expect(instancesWithDisplay.value[0].icon).toBeTruthy()
    })

    it('should use default description when no callback provided', () => {
      const instances = computed(() => [
        createInstance('i1', { description: 'Original desc' }),
      ])
      
      const { instancesWithDisplay } = useInstanceDisplay({ instances })
      
      expect(instancesWithDisplay.value[0].description).toBe('Original desc')
    })

    it('should handle instance with empty description', () => {
      const instances = computed(() => [
        createInstance('i1', { description: '' }),
      ])
      
      const { instancesWithDisplay } = useInstanceDisplay({ instances })
      
      expect(instancesWithDisplay.value[0].description).toBe('')
    })

    it('should call getFilteredDescription with user type name', () => {
      const mockGetFilteredDescription = vi.fn((instance, userTypeName) => {
        return `Filtered for ${userTypeName}: ${instance.name}`
      })
      
      const instances = computed(() => [
        createInstance('i1', { name: 'Test Instance' }),
      ])
      const selectedUserTypeBlock = computed(() => createUserTypeBlock('Buyer'))
      
      const { instancesWithDisplay } = useInstanceDisplay({
        instances,
        selectedUserTypeBlock,
        getFilteredDescription: mockGetFilteredDescription,
      })
      
      expect(instancesWithDisplay.value[0].description).toBe('Filtered for buyer: Test Instance')
      expect(mockGetFilteredDescription).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'i1' }),
        'buyer'
      )
    })

    it('should pass null user type name when no user type selected', () => {
      const mockGetFilteredDescription = vi.fn((instance, userTypeName) => {
        return userTypeName ? `${userTypeName} desc` : 'No user type'
      })
      
      const instances = computed(() => [
        createInstance('i1'),
      ])
      const selectedUserTypeBlock = computed(() => null)
      
      const { instancesWithDisplay } = useInstanceDisplay({
        instances,
        selectedUserTypeBlock,
        getFilteredDescription: mockGetFilteredDescription,
      })
      
      expect(instancesWithDisplay.value[0].description).toBe('No user type')
      expect(mockGetFilteredDescription).toHaveBeenCalledWith(
        expect.anything(),
        null
      )
    })

    it('should be reactive to instances changes', async () => {
      const instancesRef = ref<BookingBlockInstance[]>([
        createInstance('i1'),
      ])
      const instances = computed(() => instancesRef.value)
      
      const { instancesWithDisplay } = useInstanceDisplay({ instances })
      
      expect(instancesWithDisplay.value).toHaveLength(1)
      
      instancesRef.value = [...instancesRef.value, createInstance('i2')]
      
      await nextTick()
      
      expect(instancesWithDisplay.value).toHaveLength(2)
    })

    it('should be reactive to user type changes', async () => {
      const mockGetFilteredDescription = vi.fn((_, userTypeName) => {
        return userTypeName ? `For ${userTypeName}` : 'Default'
      })
      
      const instances = computed(() => [createInstance('i1')])
      const userTypeRef = ref<BookingBlockInstance | null>(null)
      const selectedUserTypeBlock = computed(() => userTypeRef.value)
      
      const { instancesWithDisplay } = useInstanceDisplay({
        instances,
        selectedUserTypeBlock,
        getFilteredDescription: mockGetFilteredDescription,
      })
      
      expect(instancesWithDisplay.value[0].description).toBe('Default')
      
      userTypeRef.value = createUserTypeBlock('Seller')
      
      await nextTick()
      
      expect(instancesWithDisplay.value[0].description).toBe('For seller')
    })

    it('should handle empty instances array', () => {
      const instances = computed(() => [] as BookingBlockInstance[])
      
      const { instancesWithDisplay } = useInstanceDisplay({ instances })
      
      expect(instancesWithDisplay.value).toEqual([])
    })

    it('should handle multiple instances', () => {
      const instances = computed(() => [
        createInstance('i1', { name: 'First' }),
        createInstance('i2', { name: 'Second' }),
        createInstance('i3', { name: 'Third' }),
      ])
      
      const { instancesWithDisplay } = useInstanceDisplay({ instances })
      
      expect(instancesWithDisplay.value).toHaveLength(3)
    })
  })
})
