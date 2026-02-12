/**
 * Contract tests for constants/primitives.ts.
 * Covers: ValidPrimitiveValues, ValidAdminValue, GlobalFieldKey.
 * Validates: no accidental breaking changes to primitive and field-key types.
 * Dependencies: vitest.
 */

import { describe, it, expect } from 'vitest'
import type {
  ValidPrimitiveValues,
  ValidAdminValue,
  GlobalFieldKey,
} from '@/constants/primitives'

describe('primitives contract', () => {
  describe('ValidPrimitiveValues', () => {
    it('string satisfies ValidPrimitiveValues', () => {
      const v: ValidPrimitiveValues = 'hello'
      expect(v).toBe('hello')
    })

    it('number satisfies ValidPrimitiveValues', () => {
      const v: ValidPrimitiveValues = 42
      expect(v).toBe(42)
    })

    it('boolean satisfies ValidPrimitiveValues', () => {
      const v: ValidPrimitiveValues = true
      expect(v).toBe(true)
    })

    it('string[] satisfies ValidPrimitiveValues', () => {
      const v: ValidPrimitiveValues = ['a', 'b']
      expect(v).toEqual(['a', 'b'])
    })
  })

  describe('ValidAdminValue', () => {
    it('accepts undefined', () => {
      const v: ValidAdminValue = undefined
      expect(v).toBeUndefined()
    })

    it('accepts string', () => {
      const v: ValidAdminValue = 'x'
      expect(v).toBe('x')
    })

    it('accepts number', () => {
      const v: ValidAdminValue = 0
      expect(v).toBe(0)
    })
  })

  describe('GlobalFieldKey', () => {
    it('known blockInstance key is assignable to GlobalFieldKey<"blockInstance">', () => {
      const key: GlobalFieldKey<'blockInstance'> = 'id'
      expect(key).toBe('id')
    })

    it('orderIndex is assignable for blockInstance', () => {
      const key: GlobalFieldKey<'blockInstance'> = 'orderIndex'
      expect(key).toBe('orderIndex')
    })
  })
})
