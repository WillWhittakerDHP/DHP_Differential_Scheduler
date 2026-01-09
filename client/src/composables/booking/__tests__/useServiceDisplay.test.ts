/**
 * USESERVICEDISPLAY TESTS
 * 
 * Unit tests for useServiceDisplay composable.
 * Tests service display transformations.
 * 
 * What it covers:
 * - wizardStateSelector: User types with icons
 * - baseServicesWithIcons: Services with icons and descriptions
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
import { useServiceDisplay } from '../useServiceDisplay'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Helper to create mock block instance
function createInstance(
  id: string,
  options: Partial<BookingBlockInstance> = {}
): BookingBlockInstance {
  return {
    id,
    name: `Instance ${id}`,
    description: 'Default description',
    icon: 'mdi-star',
    ...options,
  } as BookingBlockInstance
}

// Default getFilteredDescription helper
const defaultGetFilteredDescription = (
  service: BookingBlockInstance,
  _userTypeBlockName: string | null
): string => {
  return service.description || ''
}

describe('useServiceDisplay', () => {
  describe('wizardStateSelector', () => {
    it('should return user types with icons', () => {
      const userTypeBlocks = computed(() => [
        createInstance('user-1', { icon: 'mdi-account' }),
        createInstance('user-2', { icon: 'mdi-briefcase' }),
      ])
      const services = computed(() => [])
      const selectedUserTypeBlock = computed(() => null)
      
      const { wizardStateSelector } = useServiceDisplay({
        userTypeBlocks,
        services,
        selectedUserTypeBlock,
        getFilteredDescription: defaultGetFilteredDescription,
      })
      
      expect(wizardStateSelector.value).toHaveLength(2)
      // Icons are mapped through getIcon utility, so just verify they exist
      expect(wizardStateSelector.value[0].icon).toBeDefined()
    })

    it('should be reactive to user type changes', async () => {
      const userTypeBlocksRef = ref<BookingBlockInstance[]>([createInstance('user-1')])
      const userTypeBlocks = computed(() => userTypeBlocksRef.value)
      const services = computed(() => [])
      const selectedUserTypeBlock = computed(() => null)
      
      const { wizardStateSelector } = useServiceDisplay({
        userTypeBlocks,
        services,
        selectedUserTypeBlock,
        getFilteredDescription: defaultGetFilteredDescription,
      })
      
      expect(wizardStateSelector.value).toHaveLength(1)
      
      userTypeBlocksRef.value = [
        createInstance('user-1'),
        createInstance('user-2'),
      ]
      await nextTick()
      
      expect(wizardStateSelector.value).toHaveLength(2)
    })
  })

  describe('baseServicesWithIcons', () => {
    it('should return services with icons', () => {
      const userTypeBlocks = computed(() => [])
      const services = computed(() => [
        createInstance('service-1', { icon: 'mdi-home' }),
        createInstance('service-2', { icon: 'mdi-hammer' }),
      ])
      const selectedUserTypeBlock = computed(() => null)
      
      const { baseServicesWithIcons } = useServiceDisplay({
        userTypeBlocks,
        services,
        selectedUserTypeBlock,
        getFilteredDescription: defaultGetFilteredDescription,
      })
      
      expect(baseServicesWithIcons.value).toHaveLength(2)
      // Icons are mapped through getIcon utility, so just verify they exist
      expect(baseServicesWithIcons.value[0].icon).toBeDefined()
    })

    it('should pass selected user type to getFilteredDescription', () => {
      const userTypeBlocks = computed(() => [])
      const services = computed(() => [createInstance('service-1')])
      const selectedUserTypeBlock = computed(() => createInstance('user-1', { name: 'Buyer' }))
      
      const mockGetFilteredDescription = (
        service: BookingBlockInstance,
        userTypeBlockName: string | null
      ): string => {
        return `${service.description} - ${userTypeBlockName}`
      }
      
      const { baseServicesWithIcons } = useServiceDisplay({
        userTypeBlocks,
        services,
        selectedUserTypeBlock,
        getFilteredDescription: mockGetFilteredDescription,
      })
      
      expect(baseServicesWithIcons.value[0].description).toContain('buyer')
    })

    it('should be reactive to services changes', async () => {
      const userTypeBlocks = computed(() => [])
      const servicesRef = ref<BookingBlockInstance[]>([createInstance('service-1')])
      const services = computed(() => servicesRef.value)
      const selectedUserTypeBlock = computed(() => null)
      
      const { baseServicesWithIcons } = useServiceDisplay({
        userTypeBlocks,
        services,
        selectedUserTypeBlock,
        getFilteredDescription: defaultGetFilteredDescription,
      })
      
      expect(baseServicesWithIcons.value).toHaveLength(1)
      
      servicesRef.value = [
        createInstance('service-1'),
        createInstance('service-2'),
      ]
      await nextTick()
      
      expect(baseServicesWithIcons.value).toHaveLength(2)
    })
  })
})
