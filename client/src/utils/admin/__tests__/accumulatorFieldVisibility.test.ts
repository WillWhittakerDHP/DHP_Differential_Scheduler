import { describe, expect, it } from 'vitest'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import { isAtomicAccumulatorServiceForm } from '@/utils/admin/accumulatorFieldVisibility'

describe('isAtomicAccumulatorServiceForm', () => {
  it('allows only non-composite service instances', () => {
    expect(
      isAtomicAccumulatorServiceForm({
        semanticType: BLOCK_SHAPE_TYPES.SERVICE,
        composite: false,
      })
    ).toBe(true)
    expect(
      isAtomicAccumulatorServiceForm({
        semanticType: BLOCK_SHAPE_TYPES.SERVICE,
        composite: true,
      })
    ).toBe(false)
    expect(
      isAtomicAccumulatorServiceForm({
        semanticType: BLOCK_SHAPE_TYPES.TIME,
        composite: false,
      })
    ).toBe(false)
  })
})
