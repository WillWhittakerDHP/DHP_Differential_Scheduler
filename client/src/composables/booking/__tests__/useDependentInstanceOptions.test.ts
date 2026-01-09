/**
 * USEDEPENDENTINSTANCEOPTIONS TESTS
 * 
 * Unit tests for useDependentInstanceOptions composable.
 * Tests dependent option resolution from parent block instances.
 * 
 * What it covers:
 * - dependentOptionIds: Extracting child IDs from relationships
 * - dependentOptions: Resolving IDs to full BlockInstance objects
 * - hasDependentOptions: Convenience flag for conditional rendering
 * 
 * How it works:
 * - Mocks useGlobal to provide test data
 * - Tests relationship filtering and entity lookups
 * - Verifies reactive behavior with computed refs
 * 
 * What it validates:
 * - Correct filtering of dependentInstanceOptions relationships
 * - Proper entity resolution from global data
 * - Sorting by orderIndex
 * - Empty state handling
 * 
 * Dependencies:
 * - vitest for testing and mocking
 * - vue computed/ref for reactive state
 * - useGlobal composable (mocked)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useDependentInstanceOptions } from '../useDependentInstanceOptions'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { GlobalRelationship } from '@/types/relationships'

// Mock useGlobal
const mockGetGlobalData = vi.fn()
const mockGetGlobalEntityById = vi.fn()

vi.mock('@/composables/useGlobal', () => ({
  useGlobal: () => ({
    getGlobalData: mockGetGlobalData,
    getGlobalEntityById: mockGetGlobalEntityById,
  })
}))

// Helper to create a mock BookingBlockInstance
function createBlockInstance(
  id: string,
  options: {
    name?: string
    orderIndex?: number
    dependent?: boolean
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
    dependent: options.dependent ?? false,
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

// Helper to create a mock relationship
// LEARNING: GlobalRelationship has parent/children structure (GlobalEntity objects), not flat refs
function createRelationship(
  parentId: string,
  childIds: string[]
): GlobalRelationship {
  return {
    relationshipKind: 'dependentInstanceOptions',
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

describe('useDependentInstanceOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetGlobalData.mockReturnValue(null)
    mockGetGlobalEntityById.mockReturnValue(null)
  })

  describe('dependentOptionIds', () => {
    it('should return empty array when parent is null', () => {
      const parentInstance = ref<BookingBlockInstance | null>(null)
      
      const { dependentOptionIds } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptionIds.value).toEqual([])
    })

    it('should extract child IDs from relationships', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstanceOptions: [
            createRelationship('parent-1', ['child-1', 'child-2']),
            createRelationship('other-parent', ['child-3']),
          ],
        },
      })
      
      const { dependentOptionIds } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptionIds.value).toEqual(['child-1', 'child-2'])
    })

    it('should use external relationships when provided', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      const externalRelationships = ref<GlobalRelationship[]>([
        createRelationship('parent-1', ['external-child']),
        { ...createRelationship('parent-1', ['other']), relationshipKind: 'otherKind' } as GlobalRelationship,
      ])
      
      const { dependentOptionIds } = useDependentInstanceOptions({
        parentInstance,
        relationships: externalRelationships,
      })
      
      // Should only include dependentInstanceOptions relationships
      expect(dependentOptionIds.value).toEqual(['external-child'])
    })

    it('should return empty array when no relationships exist', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstanceOptions: [],
        },
      })
      
      const { dependentOptionIds } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptionIds.value).toEqual([])
    })

    it('should return empty array when globalData has no relationships', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {},
      })
      
      const { dependentOptionIds } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptionIds.value).toEqual([])
    })
  })

  describe('dependentOptions', () => {
    it('should return empty array when no dependent IDs', () => {
      const parentInstance = ref<BookingBlockInstance | null>(null)
      
      const { dependentOptions } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptions.value).toEqual([])
    })

    it('should resolve IDs to full block instances', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstanceOptions: [
            createRelationship('parent-1', ['child-1']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockImplementation((entityKey: string, id: string) => {
        if (id === 'child-1') {
          return {
            id: 'child-1',
            name: 'Dependent Option 1',
            orderIndex: 0,
            active: true,
            dependent: true,
            description: 'Child description',
            icon: 'child-icon',
          }
        }
        return null
      })
      
      const { dependentOptions } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptions.value).toHaveLength(1)
      expect(dependentOptions.value[0].id).toBe('child-1')
      expect(dependentOptions.value[0].name).toBe('Dependent Option 1')
    })

    it('should sort by orderIndex', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstanceOptions: [
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
      
      const { dependentOptions } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptions.value).toHaveLength(3)
      expect(dependentOptions.value[0].name).toBe('First')
      expect(dependentOptions.value[1].name).toBe('Second')
      expect(dependentOptions.value[2].name).toBe('Third')
    })

    it('should skip IDs that cannot be resolved', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstanceOptions: [
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
      
      const { dependentOptions } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptions.value).toHaveLength(1)
      expect(dependentOptions.value[0].id).toBe('child-1')
    })

    it('should handle entity with null orderIndex', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstanceOptions: [
            createRelationship('parent-1', ['child-1']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockReturnValue({
        id: 'child-1',
        name: 'Child',
        orderIndex: null, // null orderIndex
      })
      
      const { dependentOptions } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptions.value).toHaveLength(1)
      expect(dependentOptions.value[0].orderIndex).toBe(0) // Should default to 0
    })
  })

  describe('hasDependentOptions', () => {
    it('should return false when no dependent options', () => {
      const parentInstance = ref<BookingBlockInstance | null>(null)
      
      const { hasDependentOptions } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(hasDependentOptions.value).toBe(false)
    })

    it('should return true when dependent options exist', () => {
      const parent = createBlockInstance('parent-1')
      const parentInstance = ref<BookingBlockInstance | null>(parent)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstanceOptions: [
            createRelationship('parent-1', ['child-1']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockReturnValue({
        id: 'child-1',
        name: 'Child',
        orderIndex: 0,
      })
      
      const { hasDependentOptions } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(hasDependentOptions.value).toBe(true)
    })
  })

  describe('reactivity', () => {
    it('should update when parent changes', async () => {
      const parentInstance = ref<BookingBlockInstance | null>(null)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstanceOptions: [
            createRelationship('parent-1', ['child-1']),
            createRelationship('parent-2', ['child-2']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockImplementation((entityKey: string, id: string) => {
        return { id, name: `Entity ${id}`, orderIndex: 0 }
      })
      
      const { dependentOptionIds, dependentOptions } = useDependentInstanceOptions({
        parentInstance,
      })
      
      // Initially null
      expect(dependentOptionIds.value).toEqual([])
      expect(dependentOptions.value).toHaveLength(0)
      
      // Change to parent-1
      parentInstance.value = createBlockInstance('parent-1')
      expect(dependentOptionIds.value).toEqual(['child-1'])
      expect(dependentOptions.value).toHaveLength(1)
      
      // Change to parent-2
      parentInstance.value = createBlockInstance('parent-2')
      expect(dependentOptionIds.value).toEqual(['child-2'])
      expect(dependentOptions.value).toHaveLength(1)
      
      // Back to null
      parentInstance.value = null
      expect(dependentOptionIds.value).toEqual([])
      expect(dependentOptions.value).toHaveLength(0)
    })

    it('should work with computed parentInstance', () => {
      const selectedParent = ref<BookingBlockInstance | null>(createBlockInstance('parent-1'))
      const parentInstance = computed(() => selectedParent.value)
      
      mockGetGlobalData.mockReturnValue({
        relationships: {
          dependentInstanceOptions: [
            createRelationship('parent-1', ['child-1']),
          ],
        },
      })
      
      mockGetGlobalEntityById.mockReturnValue({
        id: 'child-1',
        name: 'Child',
        orderIndex: 0,
      })
      
      const { dependentOptionIds } = useDependentInstanceOptions({
        parentInstance,
      })
      
      expect(dependentOptionIds.value).toEqual(['child-1'])
    })
  })
})
