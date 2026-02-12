/**
 * Tests for transformerCollections (findById, findByIds, groupByParentId, immutableSort, collectIds).
 * Covers: entity lookup, ID grouping, immutable sort, ID set collection; edge cases and type safety.
 * Validates: null/undefined ids, empty arrays, order preservation, deduplication.
 * Dependencies: vitest.
 */

import { describe, it, expect } from 'vitest'
import {
  findById,
  findByIds,
  groupByParentId,
  immutableSort,
  collectIds,
} from '../transformerCollections'

type Item = { id: string; name: string }

describe('transformerCollections', () => {
  const items: Item[] = [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
    { id: 'c', name: 'C' },
  ]

  describe('findById', () => {
    it('returns entity when found', () => {
      expect(findById(items, 'b')).toEqual({ id: 'b', name: 'B' })
    })
    it('returns null for null or undefined id', () => {
      expect(findById(items, null)).toBe(null)
      expect(findById(items, undefined)).toBe(null)
    })
    it('returns null when not found', () => {
      expect(findById(items, 'z')).toBe(null)
    })
    it('handles empty array', () => {
      expect(findById([], 'a')).toBe(null)
    })
  })

  describe('findByIds', () => {
    it('returns entities in order of requested ids', () => {
      expect(findByIds(items, ['c', 'a', 'b'])).toEqual([
        { id: 'c', name: 'C' },
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
      ])
    })
    it('skips missing ids', () => {
      expect(findByIds(items, ['a', 'z', 'b'])).toEqual([
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
      ])
    })
    it('returns empty array for null or undefined ids', () => {
      expect(findByIds(items, null)).toEqual([])
      expect(findByIds(items, undefined)).toEqual([])
    })
    it('returns empty array for empty ids', () => {
      expect(findByIds(items, [])).toEqual([])
    })
    it('handles empty items', () => {
      expect(findByIds([], ['a', 'b'])).toEqual([])
    })
  })

  describe('groupByParentId', () => {
    it('groups by parent id using getters', () => {
      const rels = [
        { parentId: 'p1', childId: 'c1' },
        { parentId: 'p1', childId: 'c2' },
        { parentId: 'p2', childId: 'c3' },
      ]
      const map = groupByParentId(rels, (r) => r.parentId, (r) => r.childId)
      expect(map.get('p1')).toEqual(['c1', 'c2'])
      expect(map.get('p2')).toEqual(['c3'])
    })
    it('returns empty Map for empty array', () => {
      const map = groupByParentId([], (r: { p: string; c: string }) => r.p, (r) => r.c)
      expect(map.size).toBe(0)
    })
  })

  describe('immutableSort', () => {
    it('returns new sorted array without mutating input', () => {
      const unsorted = [3, 1, 2]
      const result = immutableSort(unsorted, (a, b) => a - b)
      expect(result).toEqual([1, 2, 3])
      expect(unsorted).toEqual([3, 1, 2])
    })
    it('sorts by custom compareFn', () => {
      const byName = (a: Item, b: Item) => a.name.localeCompare(b.name)
      expect(immutableSort(items, byName)).toEqual([
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
        { id: 'c', name: 'C' },
      ])
    })
    it('handles empty array', () => {
      expect(immutableSort([], (a: number, b: number) => a - b)).toEqual([])
    })
  })

  describe('collectIds', () => {
    it('merges arrays and deduplicates', () => {
      const set = collectIds(['a', 'b'], ['b', 'c'])
      expect(set.size).toBe(3)
      expect(set.has('a')).toBe(true)
      expect(set.has('b')).toBe(true)
      expect(set.has('c')).toBe(true)
    })
    it('accepts Set sources', () => {
      const set = collectIds(new Set(['x', 'y']), ['y', 'z'])
      expect(set.size).toBe(3)
      expect(set.has('x')).toBe(true)
      expect(set.has('y')).toBe(true)
      expect(set.has('z')).toBe(true)
    })
    it('returns empty Set when no sources', () => {
      const set = collectIds()
      expect(set.size).toBe(0)
    })
    it('handles empty arrays', () => {
      const set = collectIds([], ['a'], [])
      expect(Array.from(set)).toEqual(['a'])
    })
  })
})
