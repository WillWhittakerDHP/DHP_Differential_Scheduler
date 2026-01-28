/**
 * USECASCADEINSTANCES TESTS
 * 
 * Unit tests for useCascadeInstances composable.
 * Tests cascade instance resolution from parent block instances.
 * 
 * What it covers:
 * - cascadeInstanceIds: Extract IDs from parent's activeBlockIds
 * - cascadeInstances: Resolve IDs to full instances
 * - hasCascades: Convenience flag for cascade existence
 * 
 * How it works:
 * - Tests ID extraction from parent block
 * - Tests instance resolution from booking data
 * - Tests filtering by target block shape
 * 
 * What it validates:
 * - IDs correctly extracted from activeBlockIds
 * - Instances resolved from bookingData
 * - Shape filtering works correctly
 * - Empty states handled properly
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useCascadeInstances } from '../useCascadeInstances'
import type { BookingData, BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

// Helper to create mock block instance
function createInstance(
  id: string,
  options: {
    name?: string
    activeBlockIds?: string[]
    blockShapeRef?: string
    orderIndex?: number
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Instance ${id}`,
    description: 'Test instance',
    icon: 'star',
    baseSqFt: 0,
    active: true,
    bookingMode: 'standalone',
    differential: false,
    orderIndex: options.orderIndex ?? 0,
    blockShape: 'Test Shape',
    blockShapeRef: options.blockShapeRef || 'shape-default',
    activeBlockIds: options.activeBlockIds || [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
  }
}

// Helper to create mock booking data
function createBookingData(
  instances: BookingBlockInstance[],
  shapes: Array<{ id: string; name: string }> = []
): BookingData {
  return {
    blockInstances: instances,
    blockShapes: shapes.map(s => ({
      id: s.id,
      entityKey: 'blockShape',
      name: s.name,
      description: '',
      icon: 'default',
      orderIndex: 0,
    })),
    partInstances: [],
    partShapes: [],
    relationships: [],
  }
}

describe('useCascadeInstances', () => {
  describe('cascadeInstanceIds', () => {
    it('should return empty array when no parent', () => {
      const parentInstance = computed(() => null)
      const bookingData = ref<BookingData | null>(null)
      
      const { cascadeInstanceIds } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(cascadeInstanceIds.value).toEqual([])
    })

    it('should return activeBlockIds from parent', () => {
      const parent = createInstance('parent', {
        activeBlockIds: ['child-1', 'child-2', 'child-3'],
      })
      const parentInstance = computed(() => parent)
      const bookingData = ref<BookingData | null>(null)
      
      const { cascadeInstanceIds } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(cascadeInstanceIds.value).toEqual(['child-1', 'child-2', 'child-3'])
    })

    it('should return empty array when parent has no activeBlockIds', () => {
      const parent = createInstance('parent', { activeBlockIds: [] })
      const parentInstance = computed(() => parent)
      const bookingData = ref<BookingData | null>(null)
      
      const { cascadeInstanceIds } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(cascadeInstanceIds.value).toEqual([])
    })

    it('should be reactive to parent changes', async () => {
      const parentRef = ref<BookingBlockInstance | null>(null)
      const parentInstance = computed(() => parentRef.value)
      const bookingData = ref<BookingData | null>(null)
      
      const { cascadeInstanceIds } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(cascadeInstanceIds.value).toEqual([])
      
      parentRef.value = createInstance('parent', {
        activeBlockIds: ['new-child'],
      })
      await nextTick()
      
      expect(cascadeInstanceIds.value).toEqual(['new-child'])
    })
  })

  describe('cascadeInstances', () => {
    it('should return empty array when no booking data', () => {
      const parent = createInstance('parent', {
        activeBlockIds: ['child-1'],
      })
      const parentInstance = computed(() => parent)
      const bookingData = ref<BookingData | null>(null)
      
      const { cascadeInstances } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(cascadeInstances.value).toEqual([])
    })

    it('should resolve instances from booking data', () => {
      const parent = createInstance('parent', {
        activeBlockIds: ['child-1', 'child-2'],
      })
      const child1 = createInstance('child-1', { name: 'Child 1' })
      const child2 = createInstance('child-2', { name: 'Child 2' })
      const other = createInstance('other', { name: 'Other' })
      
      const parentInstance = computed(() => parent)
      const bookingData = ref<BookingData | null>(
        createBookingData([child1, child2, other])
      )
      
      const { cascadeInstances } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(cascadeInstances.value).toHaveLength(2)
      expect(cascadeInstances.value.map(i => i.id)).toEqual(['child-1', 'child-2'])
    })

    it('should filter by target block shape', () => {
      const parent = createInstance('parent', {
        activeBlockIds: ['child-1', 'child-2', 'child-3'],
      })
      const child1 = createInstance('child-1', {
        name: 'Service 1',
        blockShapeRef: 'shape-service',
      })
      const child2 = createInstance('child-2', {
        name: 'Service 2',
        blockShapeRef: 'shape-service',
      })
      const child3 = createInstance('child-3', {
        name: 'Option 1',
        blockShapeRef: 'shape-option',
      })
      
      const parentInstance = computed(() => parent)
      const bookingData = ref<BookingData | null>(
        createBookingData(
          [child1, child2, child3],
          [
            { id: 'shape-service', name: 'Base Service' },
            { id: 'shape-option', name: 'Option' },
          ]
        )
      )
      
      const { cascadeInstances } = useCascadeInstances({
        parentInstance,
        bookingData,
        targetBlockShapeName: 'Base Service',
      })
      
      expect(cascadeInstances.value).toHaveLength(2)
      expect(cascadeInstances.value.map(i => i.name)).toEqual(['Service 1', 'Service 2'])
    })

    it('should sort by orderIndex', () => {
      const parent = createInstance('parent', {
        activeBlockIds: ['child-3', 'child-1', 'child-2'],
      })
      const child1 = createInstance('child-1', { name: 'First', orderIndex: 1 })
      const child2 = createInstance('child-2', { name: 'Second', orderIndex: 2 })
      const child3 = createInstance('child-3', { name: 'Third', orderIndex: 3 })
      
      const parentInstance = computed(() => parent)
      const bookingData = ref<BookingData | null>(
        createBookingData([child3, child1, child2])
      )
      
      const { cascadeInstances } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(cascadeInstances.value.map(i => i.name)).toEqual(['First', 'Second', 'Third'])
    })
  })

  describe('hasCascades', () => {
    it('should return false when no cascades', () => {
      const parent = createInstance('parent', { activeBlockIds: [] })
      const parentInstance = computed(() => parent)
      const bookingData = ref<BookingData | null>(createBookingData([]))
      
      const { hasCascades } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(hasCascades.value).toBe(false)
    })

    it('should return true when cascades exist', () => {
      const parent = createInstance('parent', {
        activeBlockIds: ['child-1'],
      })
      const child1 = createInstance('child-1')
      
      const parentInstance = computed(() => parent)
      const bookingData = ref<BookingData | null>(createBookingData([child1]))
      
      const { hasCascades } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(hasCascades.value).toBe(true)
    })

    it('should return false when IDs exist but no matching instances', () => {
      const parent = createInstance('parent', {
        activeBlockIds: ['non-existent'],
      })
      
      const parentInstance = computed(() => parent)
      const bookingData = ref<BookingData | null>(createBookingData([]))
      
      const { hasCascades } = useCascadeInstances({
        parentInstance,
        bookingData,
      })
      
      expect(hasCascades.value).toBe(false)
    })
  })
})
