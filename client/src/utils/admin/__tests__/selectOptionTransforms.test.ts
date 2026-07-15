import { describe, expect, it } from 'vitest'
import { resolveGroupEntityKey } from '@/utils/admin/selectOptionTransforms'

describe('selectOptionTransforms', () => {
  it('uses blockShape for blockShapeRef groups even when candidate parent is blockInstance', () => {
    expect(resolveGroupEntityKey('blockShapeRef', { candidateParentKey: 'blockInstance' })).toBe('blockShape')
  })
})
