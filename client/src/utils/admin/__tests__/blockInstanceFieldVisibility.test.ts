import { describe, expect, it } from 'vitest'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { shouldShowBlockInstanceField } from '@/utils/admin/blockInstanceFieldVisibility'

describe('blockInstanceFieldVisibility', () => {
  it('hides dropped grab-bag fields everywhere', () => {
    expect(shouldShowBlockInstanceField('baseSqFt', BLOCK_SHAPE_TYPES.SERVICE)).toBe(false)
    expect(shouldShowBlockInstanceField('agentPermissions', BLOCK_SHAPE_TYPES.TIME)).toBe(false)
  })

  it('shows time-only fields on time shapes only', () => {
    expect(shouldShowBlockInstanceField('requiresUnitNumber', BLOCK_SHAPE_TYPES.TIME)).toBe(true)
    expect(shouldShowBlockInstanceField('isMultiFamily', BLOCK_SHAPE_TYPES.TIME)).toBe(true)
    expect(shouldShowBlockInstanceField('requiresUnitNumber', BLOCK_SHAPE_TYPES.SERVICE)).toBe(false)
    expect(shouldShowBlockInstanceField('preClosing', BLOCK_SHAPE_TYPES.EVENT)).toBe(false)
  })

  it('shows service-only fields on service shapes only', () => {
    expect(shouldShowBlockInstanceField('requiresAgent', BLOCK_SHAPE_TYPES.SERVICE)).toBe(true)
    expect(shouldShowBlockInstanceField('preClosing', BLOCK_SHAPE_TYPES.SERVICE)).toBe(true)
    expect(shouldShowBlockInstanceField('requiresAgent', BLOCK_SHAPE_TYPES.TIME)).toBe(false)
  })

  it('shows user semantic type only on user shapes', () => {
    expect(shouldShowBlockInstanceField('semanticType', BLOCK_SHAPE_TYPES.USER)).toBe(true)
    expect(shouldShowBlockInstanceField('semanticType', BLOCK_SHAPE_TYPES.SERVICE)).toBe(false)
  })

  it('keeps universal instance flags visible on every shape', () => {
    for (const semanticType of Object.values(BLOCK_SHAPE_TYPES)) {
      expect(shouldShowBlockInstanceField('composite', semanticType)).toBe(true)
      expect(shouldShowBlockInstanceField('orchestrator', semanticType)).toBe(true)
      expect(shouldShowBlockInstanceField('wizardPlacement', semanticType)).toBe(true)
    }
  })
})
