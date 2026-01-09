/**
 * BLOCKINSTANCETOSNAPSHOT TESTS
 * 
 * Unit tests for blockInstanceToSnapshot.
 * Priority Score: 8.4 (Reliability: 10, ROI: 8, Independence: 10, Cognitive Load: 0)
 * 
 * Tests verify that block instances are correctly transformed to snapshot format,
 * preserving only critical fields needed for historical accuracy.
 */

import { describe, it, expect } from 'vitest'
import { blockInstanceToSnapshot } from '@/utils/transformers/blockInstanceToSnapshot'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

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
    name: options.name || `Block ${id}`,
    baseSqFt: options.baseSqFt ?? 1000,
    description: 'Test description',
    icon: options.icon || 'icon-test',
    active: true,
    dependent: false,
    differential: options.differential ?? false,
    orderIndex: 0,
    blockShape: 'Test Shape',
    blockShapeRef: 'shape-1',
    activeBlockIds: [],
    partInstances: options.partInstances || [],
    allowMultiple: options.allowMultiple ?? false,
    requiresUnitNumber: null,
  }
}

/**
 * Helper to create a BookingPartInstance for testing
 */
function createBookingPartInstance(
  id: string,
  options: {
    name?: string
    baseFee?: number
    baseTime?: number
    rateOverBaseFee?: number
    rateOverBaseTime?: number
  } = {}
): BookingBlockInstance['partInstances'][0] {
  return {
    id,
    entityKey: 'partInstance',
    name: options.name || `Part ${id}`,
    partShape: 'part-shape-1',
    disabled: false,
    onSite: false,
    clientPresent: false,
    moveable: false,
    baseTime: options.baseTime ?? 60,
    rateOverBaseTime: options.rateOverBaseTime ?? 0,
    baseFee: options.baseFee ?? 100,
    rateOverBaseFee: options.rateOverBaseFee ?? 0,
    orderIndex: 0,
    active: true,
  }
}

describe('blockInstanceToSnapshot', () => {
  it('should transform block instance to snapshot correctly', () => {
    // Arrange
    const blockInstance = createBookingBlockInstance('block-1', {
      name: 'Test Block',
      icon: 'test-icon',
      baseSqFt: 1500,
      allowMultiple: true,
      differential: true,
      partInstances: [
        createBookingPartInstance('part-1', {
          name: 'Test Part',
          baseFee: 200,
          baseTime: 90,
          rateOverBaseFee: 50,
          rateOverBaseTime: 30,
        }),
      ],
    })
    
    // Act
    const result = blockInstanceToSnapshot(blockInstance)
    
    // Assert
    expect(result).toBeDefined()
    expect(result.id).toBe('block-1')
    expect(result.name).toBe('Test Block')
    expect(result.icon).toBe('test-icon')
    expect(result.baseSqFt).toBe(1500)
    expect(result.allowMultiple).toBe(true)
    expect(result.differential).toBe(true)
    expect(result.partInstances).toHaveLength(1)
    expect(result.partInstances[0]).toEqual({
      id: 'part-1',
      name: 'Test Part',
      baseFee: 200,
      baseTime: 90,
      rateOverBaseFee: 50,
      rateOverBaseTime: 30,
    })
  })

  it('should capture snapshot of block instance data at booking time', () => {
    // Arrange
    const blockInstance = createBookingBlockInstance('block-2', {
      name: 'Historical Block',
      icon: 'historical-icon',
      baseSqFt: 2000,
    })
    
    // Act
    const result = blockInstanceToSnapshot(blockInstance)
    
    // Assert
    // Verify that critical fields are preserved for historical accuracy
    expect(result.id).toBe('block-2')
    expect(result.name).toBe('Historical Block')
    expect(result.icon).toBe('historical-icon')
    expect(result.baseSqFt).toBe(2000)
    // Verify snapshot preserves pricing/configuration at booking time
    expect(result.allowMultiple).toBe(blockInstance.allowMultiple)
    expect(result.differential).toBe(blockInstance.differential)
  })

  it('should capture only critical fields needed for historical accuracy', () => {
    // Arrange
    const blockInstance = createBookingBlockInstance('block-3', {
      name: 'Critical Fields Block',
      partInstances: [
        createBookingPartInstance('part-1', {
          baseFee: 150,
          baseTime: 45,
        }),
      ],
    })
    
    // Act
    const result = blockInstanceToSnapshot(blockInstance)
    
    // Assert
    // Verify only snapshot fields are present (not all BookingBlockInstance fields)
    expect(result).not.toHaveProperty('entityKey')
    expect(result).not.toHaveProperty('description')
    expect(result).not.toHaveProperty('active')
    expect(result).not.toHaveProperty('orderIndex')
    expect(result).not.toHaveProperty('blockShape')
    expect(result).not.toHaveProperty('blockShapeRef')
    
    // Verify part instances only have snapshot fields
    expect(result.partInstances[0]).not.toHaveProperty('entityKey')
    expect(result.partInstances[0]).not.toHaveProperty('partShape')
    expect(result.partInstances[0]).not.toHaveProperty('disabled')
    expect(result.partInstances[0]).not.toHaveProperty('onSite')
    expect(result.partInstances[0]).not.toHaveProperty('clientPresent')
    expect(result.partInstances[0]).not.toHaveProperty('moveable')
    expect(result.partInstances[0]).not.toHaveProperty('orderIndex')
    expect(result.partInstances[0]).not.toHaveProperty('active')
    
    // Verify critical fields are present
    expect(result.partInstances[0]).toHaveProperty('id')
    expect(result.partInstances[0]).toHaveProperty('name')
    expect(result.partInstances[0]).toHaveProperty('baseFee')
    expect(result.partInstances[0]).toHaveProperty('baseTime')
    expect(result.partInstances[0]).toHaveProperty('rateOverBaseFee')
    expect(result.partInstances[0]).toHaveProperty('rateOverBaseTime')
  })

  it('should handle empty part instances array', () => {
    // Arrange
    const blockInstance = createBookingBlockInstance('block-4', {
      name: 'Empty Parts Block',
      partInstances: [],
    })
    
    // Act
    const result = blockInstanceToSnapshot(blockInstance)
    
    // Assert
    expect(result).toBeDefined()
    expect(result.partInstances).toEqual([])
    expect(result.partInstances).toHaveLength(0)
    // Verify block instance fields are still captured
    expect(result.id).toBe('block-4')
    expect(result.name).toBe('Empty Parts Block')
  })

  it('should transform multiple part instances correctly', () => {
    // Arrange
    const blockInstance = createBookingBlockInstance('block-5', {
      partInstances: [
        createBookingPartInstance('part-1', {
          name: 'Part One',
          baseFee: 100,
          baseTime: 60,
        }),
        createBookingPartInstance('part-2', {
          name: 'Part Two',
          baseFee: 200,
          baseTime: 120,
          rateOverBaseFee: 50,
          rateOverBaseTime: 30,
        }),
      ],
    })
    
    // Act
    const result = blockInstanceToSnapshot(blockInstance)
    
    // Assert
    expect(result.partInstances).toHaveLength(2)
    expect(result.partInstances[0]).toEqual({
      id: 'part-1',
      name: 'Part One',
      baseFee: 100,
      baseTime: 60,
      rateOverBaseFee: 0,
      rateOverBaseTime: 0,
    })
    expect(result.partInstances[1]).toEqual({
      id: 'part-2',
      name: 'Part Two',
      baseFee: 200,
      baseTime: 120,
      rateOverBaseFee: 50,
      rateOverBaseTime: 30,
    })
  })
})
