/**
 * USEDEPENDENTINSTANCES TESTS
 * 
 * Unit tests for useDependentInstances composable.
 * Tests dependent instance resolution from parent block instances.
 * 
 * What it covers:
 * - dependentInstanceIds: Extracting child IDs from relationships
 * - dependentInstances: Resolving IDs to full BlockInstance objects
 * - hasDependentInstances: Convenience flag for conditional rendering
 * 
 * How it works:
 * - Mocks useGlobal to provide test data
 * - Tests relationship filtering and entity lookups
 * - Verifies reactive behavior with computed refs
 * 
 * What it validates:
 * - Correct filtering of dependentInstances relationships
 * - Proper entity resolution from global data
 * - Sorting by orderIndex
 * - Empty state handling
 * 
 * Dependencies:
 * - vitest for testing and mocking
 * - vue computed/ref for reactive state
 * - useGlobal composable (mocked)
 * 
 * NOTE: Renamed from useDependentInstanceOptions to useDependentInstances (2026-01-20)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useDependentInstances } from '../useDependentInstances'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { GlobalRelationship } from '@/types/relationships'

const mockGetGlobalData = vi.fn()
const mockGetGlobalEntityById = vi.fn()

vi.mock('@/composables/useGlobal', () => ({
  useGlobal: () => ({
    getGlobalData: mockGetGlobalData,
    getGlobalEntityById: mockGetGlobalEntityById,
  })
}))

function createBlockInstance(
  id: string,
  options: {
    name?: string
    orderIndex?: number
    bookingMode?: import('@/constants/bookingMode').BookingMode
    description?: string
    icon?: string
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Block ${id}`,
    baseSqFt: 1000,
    description: options.description || 'Test description',
    icon: options.icon || 'icon-test',
    active: true,
    bookingMode: options.bookingMode ?? 'standalone',
    differential: false,
    orderIndex: options.orderIndex ?? 0,
    blockShape: 'Test Shape',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

function createRelationship(
  parentId: string,
  childIds: string[]
): GlobalRelationship {
  return {
    relationshipKind: 'dependentInstances',
    parent: {
      id: parentId,
      entityKey: 'blockInstance',
      name: `Parent ${parentId}`,
      orderIndex: 0,
    },
    children: childIds.map(childId => ({
      id: childId,
      entityKey: 'blockInstance',
      name: `Child ${childId}`,
      orderIndex: 0,
    })),
  } as GlobalRelationship
}

describe('useDependentInstances', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetGlobalData.mockReturnValue(null)
    mockGetGlobalEntityById.mockReturnValue(null)
  })

  describe('dependentInstanceIds', () => {
    it('should return empty array when parent is null', () => {
      const parentInstance = ref<BookingBlockInstance | null>(null)
      
      const { dependentInstanceIds } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstanceIds.value).toEqual([])
    })

    it('should extract child IDs from relationships', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstances: [
            createRelationship('parent-1', ['child-1', 'child-2']),
            createRelationship('other-parent', ['child-3']),
          ],
        },
      })
      
      const { dependentInstanceIds } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstanceIds.value).toEqual(['child-1', 'child-2'])
    })

    it('should use external relationships when provided', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      const externalRelationships = ref<GlobalRelationship[]>([
        createRelationship('parent-1', ['external-child']),
        { ...createRelationship('parent-1', ['other']), relationshipKind: 'otherKind' } as GlobalRelationship,
      ])
      
      const { dependentInstanceIds } = useDependentInstances({
        parentInstance,
        relationships: externalRelationships,
      })
      
      expect(dependentInstanceIds.value).toEqual(['external-child'])
    })

    it('should return empty array when no relationships exist', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstances: [],
        },
      })
      
      const { dependentInstanceIds } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstanceIds.value).toEqual([])
    })

    it('should return empty array when globalData has no relationships', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {},
      })
      
      const { dependentInstanceIds } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstanceIds.value).toEqual([])
    })
  })

  describe('dependentInstances', () => {
    it('should return empty array when no dependent IDs', () => {
      const parentInstance = ref<BookingBlockInstance | null>(null)
      
      const { dependentInstances } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstances.value).toEqual([])
    })

    it('should resolve IDs to full block instances', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstances: [
            createRelationship('parent-1', ['child-1']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockImplementation((entityKey: string, id: string) => {
        if (id === 'child-1') {
          return {
            id: 'child-1',
            name: 'Dependent Instance 1',
            orderIndex: 0,
            active: true,
            bookingMode: 'addOn',
            description: 'Child description',
            icon: 'child-icon',
          }
        }
        return null
      })
      
      const { dependentInstances } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstances.value).toHaveLength(1)
      expect(dependentInstances.value[0].id).toBe('child-1')
      expect(dependentInstances.value[0].name).toBe('Dependent Instance 1')
    })

    it('should sort by orderIndex', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstances: [
            createRelationship('parent-1', ['child-1', 'child-2', 'child-3']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockImplementation((entityKey: string, id: string) => {
        const entities: Record<string, object> = {
          'child-1': { id: 'child-1', name: 'Third', orderIndex: 2 },
          'child-2': { id: 'child-2', name: 'First', orderIndex: 0 },
          'child-3': { id: 'child-3', name: 'Second', orderIndex: 1 },
        }
        return entities[id] || null
      })
      
      const { dependentInstances } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstances.value).toHaveLength(3)
      expect(dependentInstances.value[0].name).toBe('First')
      expect(dependentInstances.value[1].name).toBe('Second')
      expect(dependentInstances.value[2].name).toBe('Third')
    })

    it('should skip IDs that cannot be resolved', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstances: [
            createRelationship('parent-1', ['child-1', 'missing-child']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockImplementation((entityKey: string, id: string) => {
        if (id === 'child-1') {
          return { id: 'child-1', name: 'Found Child', orderIndex: 0 }
        }
        return null // missing-child not found
      })
      
      const { dependentInstances } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstances.value).toHaveLength(1)
      expect(dependentInstances.value[0].id).toBe('child-1')
    })

    it('should handle entity with null orderIndex', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstances: [
            createRelationship('parent-1', ['child-1']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockReturnValue({
        id: 'child-1',
        name: 'Child',
        orderIndex: null, // null orderIndex
      })
      
      const { dependentInstances } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstances.value).toHaveLength(1)
      expect(dependentInstances.value[0].orderIndex).toBe(0) // Should default to 0
    })
  })

  describe('hasDependentInstances', () => {
    it('should return false when no dependent instances', () => {
      const parentInstance = ref<BookingBlockInstance | null>(null)
      
      const { hasDependentInstances } = useDependentInstances({
        parentInstance,
      })
      
      expect(hasDependentInstances.value).toBe(false)
    })

    it('should return true when dependent instances exist', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstances: [
            createRelationship('parent-1', ['child-1']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockReturnValue({
        id: 'child-1',
        name: 'Child',
        orderIndex: 0,
      })
      
      const { hasDependentInstances } = useDependentInstances({
        parentInstance,
      })
      
      expect(hasDependentInstances.value).toBe(true)
    })
  })

  describe('reactivity', () => {
    it('should update when parent changes', async () => {
      const parentInstance = ref<BookingBlockInstance | null>(null)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstances: [
            createRelationship('parent-1', ['child-1']),
            createRelationship('parent-2', ['child-2']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockImplementation((entityKey: string, id: string) => {
        return { id, name: `Entity ${id}`, orderIndex: 0 }
      })
      
      const { dependentInstanceIds, dependentInstances } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstanceIds.value).toEqual([])
      expect(dependentInstances.value).toHaveLength(0)
      
      parentInstance.value = createBlockInstance('parent-1')
      expect(dependentInstanceIds.value).toEqual(['child-1'])
      expect(dependentInstances.value).toHaveLength(1)
      
      parentInstance.value = createBlockInstance('parent-2')
      expect(dependentInstanceIds.value).toEqual(['child-2'])
      expect(dependentInstances.value).toHaveLength(1)
      
      parentInstance.value = null
      expect(dependentInstanceIds.value).toEqual([])
      expect(dependentInstances.value).toHaveLength(0)
    })

    it('should work with computed parentInstance', () => {
      const selectedParent = ref<BookingBlockInstance | null>(createBlockInstance('parent-1'))
      const parentInstance = computed(() => selectedParent.value)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstances: [
            createRelationship('parent-1', ['child-1']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockReturnValue({
        id: 'child-1',
        name: 'Child',
        orderIndex: 0,
      })
      
      const { dependentInstanceIds } = useDependentInstances({
        parentInstance,
      })
      
      expect(dependentInstanceIds.value).toEqual(['child-1'])
    })
  })
})
