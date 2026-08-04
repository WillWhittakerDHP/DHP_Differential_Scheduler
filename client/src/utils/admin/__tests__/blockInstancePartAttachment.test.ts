import { describe, expect, it } from 'vitest'
import {
  defaultPartInstanceName,
  partShapesAvailableToAttach,
} from '@/utils/admin/blockInstancePartAttachment'
import type { GlobalEntity } from '@/types/entities'

function partShape(id: string, name: string, active = true): GlobalEntity<'partShape'> {
  return { id, entityKey: 'partShape', name, orderIndex: 0, active } as GlobalEntity<'partShape'>
}

describe('blockInstancePartAttachment', () => {
  it('offers active shapes not already attached', () => {
    const options = partShapesAvailableToAttach({
      partShapes: [
        partShape('ps-data', 'Data Collection'),
        partShape('ps-report', 'Report Writing'),
        partShape('ps-hidden', 'Hidden', false),
      ],
      attachedPartShapeIds: new Set(['ps-data']),
    })
    expect(options.map((o) => o.id)).toEqual(['ps-report'])
  })

  it('respects validPartCascades allow-list when present', () => {
    const options = partShapesAvailableToAttach({
      partShapes: [
        partShape('ps-data', 'Data Collection'),
        partShape('ps-report', 'Report Writing'),
        partShape('ps-early', 'Early Arrival'),
      ],
      attachedPartShapeIds: new Set(),
      allowedPartShapeIds: new Set(['ps-data', 'ps-report']),
    })
    expect(options.map((o) => o.id).sort()).toEqual(['ps-data', 'ps-report'])
  })

  it('falls back to all active shapes when allow-list is empty', () => {
    const options = partShapesAvailableToAttach({
      partShapes: [partShape('ps-data', 'Data Collection'), partShape('ps-report', 'Report Writing')],
      attachedPartShapeIds: new Set(),
      allowedPartShapeIds: [],
    })
    expect(options).toHaveLength(2)
  })

  it('builds a default work-item name from block and shape', () => {
    expect(defaultPartInstanceName("Buyer's Inspection", 'Data Collection')).toBe(
      "Buyer's Inspection-Data Collection"
    )
  })
})
