/**
 * SNAPSHOTTOBOOKINGINSTANCE TESTS
 * 
 * Unit tests for snapshotToBookingInstance.
 * Priority Score: 8.0 (Reliability: 10, ROI: 8, Independence: 8, Cognitive Load: 0)
 * 
 * Tests verify that snapshot data is correctly merged with current block instance,
 * preserving historical accuracy while allowing structure updates.
 */

import { describe, it, expect } from 'vitest'
import { mergeSnapshotWithCurrent } from '@/utils/transformers/snapshotToBookingInstance'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'
import type { BlockInstanceSnapshot } from '@/types/appointment'

/**
 * Helper to create a BookingBlockInstance for testing
 */
function createBookingBlockInstance(
  id: string,
  options: {
    name?: string
    icon?: string
    baseSqFt?: number
    allowMultiple?: boolean
    differential?: boolean
    partInstances?: BookingBlockInstance['partInstances']
  } = {}
): BookingBlockInstance {
  return {
    id,
    entityKey: 'blockInstance',
    name: options.name || `Current Block ${id}`,
    baseSqFt: options.baseSqFt ?? 1000,
    description: 'Current description',
    icon: options.icon || 'current-icon',
    active: true,
    dependent: false,
    differential: options.differential ?? false,
    orderIndex: 0,
    blockShape: 'Current Shape',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: options.partInstances || [],
    allowMultiple: options.allowMultiple ?? false,
    requiresUnitNumber: null,
  }
}

/**
 * Helper to create a BlockInstanceSnapshot for testing
 */
function createSnapshot(
  id: string,
  options: {
    name?: string
    icon?: string
    baseSqFt?: number
    allowMultiple?: boolean
    differential?: boolean
    partInstances?: BlockInstanceSnapshot['partInstances']
  } = {}
): BlockInstanceSnapshot {
  return {
    id,
    name: options.name || `Snapshot ${id}`,
    icon: options.icon || 'snapshot-icon',
    baseSqFt: options.baseSqFt ?? 2000,
    allowMultiple: options.allowMultiple ?? true,
    differential: options.differential ?? true,
    partInstances: options.partInstances || [],
  }
}

describe('snapshotToBookingInstance', () => {
  describe('mergeSnapshotWithCurrent', () => {
    it('should merge snapshot data with current block instance', () => {
      // Arrange
      const currentInstance = createBookingBlockInstance('block-1', {
        name: 'Current Name',
        icon: 'current-icon',
        baseSqFt: 1000,
        allowMultiple: false,
      })
      
      const snapshot = createSnapshot('block-1', {
        name: 'Historical Name',
        icon: 'historical-icon',
        baseSqFt: 1500,
        allowMultiple: true,
      })
      
      // Act
      const result = mergeSnapshotWithCurrent(currentInstance, snapshot)
      
      // Assert
      expect(result).toBeDefined()
      // Snapshot values should override current values
      expect(result.name).toBe('Historical Name')
      expect(result.icon).toBe('historical-icon')
      expect(result.baseSqFt).toBe(1500)
      expect(result.allowMultiple).toBe(true)
      // Current instance fields should be preserved
      expect(result.id).toBe('block-1')
      expect(result.entityKey).toBe('blockInstance')
      expect(result.description).toBe('Current description')
    })

    it('should use snapshot for historical accuracy, fall back to current for missing data', () => {
      // Arrange
      const currentInstance = createBookingBlockInstance('block-2', {
        name: 'Current Name',
        baseSqFt: 1000,
      })
      
      const snapshot = createSnapshot('block-2', {
        name: 'Historical Name',
        // baseSqFt not provided in snapshot
      })
      
      // Act
      const result = mergeSnapshotWithCurrent(currentInstance, snapshot)
      
      // Assert
      // Snapshot name should be used
      expect(result.name).toBe('Historical Name')
      // Current baseSqFt should be preserved (snapshot has it, so it overrides)
      expect(result.baseSqFt).toBe(snapshot.baseSqFt)
      // Other current fields should be preserved
      expect(result.description).toBe('Current description')
      expect(result.blockShape).toBe('Current Shape')
    })

    it('should not override differential from snapshot - it\'s a configuration flag, not historical data', () => {
      // Arrange
      const currentInstance = createBookingBlockInstance('block-3', {
        differential: false, // Current configuration
      })
      
      const snapshot = createSnapshot('block-3', {
        differential: true, // Historical value (should be ignored)
      })
      
      // Act
      const result = mergeSnapshotWithCurrent(currentInstance, snapshot)
      
      // Assert
      // Current differential should be preserved, not overridden by snapshot
      expect(result.differential).toBe(false)
      expect(result.differential).not.toBe(snapshot.differential)
    })

    it('should merge part instances by matching IDs', () => {
      // Arrange
      const currentInstance = createBookingBlockInstance('block-4', {
        partInstances: [
          {
            id: 'part-1',
            entityKey: 'partInstance',
            name: 'Current Part 1',
            partShape: 'shape-1',
            disabled: false,
            onSite: false,
            clientPresent: false,
            moveable: false,
            baseTime: 60,
            rateOverBaseTime: 0,
            baseFee: 100,
            rateOverBaseFee: 0,
            orderIndex: 0,
            active: true,
          },
          {
            id: 'part-2',
            entityKey: 'partInstance',
            name: 'Current Part 2',
            partShape: 'shape-2',
            disabled: false,
            onSite: false,
            clientPresent: false,
            moveable: false,
            baseTime: 90,
            rateOverBaseTime: 0,
            baseFee: 200,
            rateOverBaseFee: 0,
            orderIndex: 1,
            active: true,
          },
        ],
      })
      
      const snapshot = createSnapshot('block-4', {
        partInstances: [
          {
            id: 'part-1',
            name: 'Historical Part 1',
            baseFee: 150,
            baseTime: 75,
            rateOverBaseFee: 25,
            rateOverBaseTime: 15,
          },
          // part-2 not in snapshot, should keep current
        ],
      })
      
      // Act
      const result = mergeSnapshotWithCurrent(currentInstance, snapshot)
      
      // Assert
      expect(result.partInstances).toHaveLength(2)
      
      // part-1 should be merged with snapshot values
      const part1 = result.partInstances.find(p => p.id === 'part-1')!
      expect(part1.name).toBe('Historical Part 1')
      expect(part1.baseFee).toBe(150)
      expect(part1.baseTime).toBe(75)
      expect(part1.rateOverBaseFee).toBe(25)
      expect(part1.rateOverBaseTime).toBe(15)
      // Current fields should be preserved
      expect(part1.entityKey).toBe('partInstance')
      expect(part1.partShape).toBe('shape-1')
      
      // part-2 should keep current values (not in snapshot)
      const part2 = result.partInstances.find(p => p.id === 'part-2')!
      expect(part2.name).toBe('Current Part 2')
      expect(part2.baseFee).toBe(200)
      expect(part2.baseTime).toBe(90)
    })

    it('should return current instance when snapshot is null', () => {
      // Arrange
      const currentInstance = createBookingBlockInstance('block-5', {
        name: 'Current Name',
      })
      
      // Act
      const result = mergeSnapshotWithCurrent(currentInstance, null)
      
      // Assert
      expect(result).toBe(currentInstance)
      expect(result.name).toBe('Current Name')
    })

    it('should return current instance when snapshot is undefined', () => {
      // Arrange
      const currentInstance = createBookingBlockInstance('block-6', {
        name: 'Current Name',
      })
      
      // Act
      const result = mergeSnapshotWithCurrent(currentInstance, undefined)
      
      // Assert
      expect(result).toBe(currentInstance)
      expect(result.name).toBe('Current Name')
    })

    it('should handle empty part instances array', () => {
      // Arrange
      const currentInstance = createBookingBlockInstance('block-7', {
        partInstances: [],
      })
      
      const snapshot = createSnapshot('block-7', {
        partInstances: [],
      })
      
      // Act
      const result = mergeSnapshotWithCurrent(currentInstance, snapshot)
      
      // Assert
      expect(result.partInstances).toEqual([])
      expect(result.partInstances).toHaveLength(0)
    })

    it('should handle snapshot with part instances not in current instance', () => {
      // Arrange
      const currentInstance = createBookingBlockInstance('block-8', {
        partInstances: [
          {
            id: 'part-1',
            entityKey: 'partInstance',
            name: 'Current Part',
            partShape: 'shape-1',
            disabled: false,
            onSite: false,
            clientPresent: false,
            moveable: false,
            baseTime: 60,
            rateOverBaseTime: 0,
            baseFee: 100,
            rateOverBaseFee: 0,
            orderIndex: 0,
            active: true,
          },
        ],
      })
      
      const snapshot = createSnapshot('block-8', {
        partInstances: [
          {
            id: 'part-1',
            name: 'Historical Part 1',
            baseFee: 150,
            baseTime: 75,
            rateOverBaseFee: 0,
            rateOverBaseTime: 0,
          },
          {
            id: 'part-2',
            name: 'Historical Part 2',
            baseFee: 200,
            baseTime: 90,
            rateOverBaseFee: 0,
            rateOverBaseTime: 0,
          },
        ],
      })
      
      // Act
      const result = mergeSnapshotWithCurrent(currentInstance, snapshot)
      
      // Assert
      // part-2 in snapshot but not in current should not appear in result
      // (only parts in current instance are processed)
      expect(result.partInstances).toHaveLength(1)
      expect(result.partInstances[0].id).toBe('part-1')
      expect(result.partInstances[0].name).toBe('Historical Part 1')
    })
  })
})
