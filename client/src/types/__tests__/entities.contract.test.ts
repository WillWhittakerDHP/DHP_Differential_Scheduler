/**
 * Contract tests for foundation entity types and constants.
 * Covers: ENTITY_KEYS and GlobalEntityKey shape; minimal shape of BlockInstanceEntity and PartInstanceEntity.
 * Validates: no accidental breaking changes to types/entities.ts and constants/entities.ts.
 * Dependencies: vitest.
 */

import { describe, it, expect } from 'vitest'
import { ENTITY_KEYS } from '@/constants/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { BlockInstanceEntity, PartInstanceEntity } from '@/types/entities'

describe('entities contract', () => {
  describe('ENTITY_KEYS and GlobalEntityKey', () => {
    const EXPECTED_ENTITY_KEYS = [
      'blockInstance',
      'blockShape',
      'partInstance',
      'partShape',
      'eventShape',
      'eventInstance',
      'annotationShape',
      'annotationInstance',
    ] as const

    it('ENTITY_KEYS has expected length', () => {
      expect(ENTITY_KEYS).toHaveLength(EXPECTED_ENTITY_KEYS.length)
    })

    it('each ENTITY_KEYS entry is a string', () => {
      ENTITY_KEYS.forEach((key) => {
        expect(typeof key).toBe('string')
        expect(key.length).toBeGreaterThan(0)
      })
    })

    it('ENTITY_KEYS matches expected set', () => {
      expect([...ENTITY_KEYS].sort()).toEqual([...EXPECTED_ENTITY_KEYS].sort())
    })

    it('GlobalEntityKey is assignable from ENTITY_KEYS entries', () => {
      const key: GlobalEntityKey = ENTITY_KEYS[0]
      expect(key).toBeDefined()
    })
  })

  describe('BlockInstanceEntity minimal shape', () => {
    it('dummy object satisfies required fields', () => {
      const minimal: BlockInstanceEntity = {
        id: 'test-id',
        entityKey: 'blockInstance',
        name: 'Test',
        orderIndex: 0,
        active: true,
        blockShapeRef: 'shape-1',
        baseSqFt: 0,
        icon: '',
        allowMultiple: false,
        isMultiFamily: false,
        requiresAgent: false,
      }
      expect(minimal.id).toBe('test-id')
      expect(minimal.entityKey).toBe('blockInstance')
      expect(minimal.name).toBe('Test')
      expect(minimal.orderIndex).toBe(0)
      expect(minimal.active).toBe(true)
    })
  })

  describe('PartInstanceEntity minimal shape', () => {
    it('dummy object satisfies required fields', () => {
      const minimal: PartInstanceEntity = {
        id: 'part-1',
        entityKey: 'partInstance',
        name: 'Part',
        orderIndex: 0,
        active: true,
        partShapeRef: 'ps-1',
        baseTime: 0,
        rateOverBaseTime: 0,
        baseFee: 0,
        rateOverBaseFee: 0,
        zeroOutPart: false,
      }
      expect(minimal.entityKey).toBe('partInstance')
      expect(minimal.name).toBe('Part')
      expect(minimal.orderIndex).toBe(0)
    })
  })
})
