import { describe, expect, it, vi } from 'vitest'
import { BLOCK_SHAPE_TYPES } from '@/constants/blockShapeTypes'
import {
  buildServiceBlockActivationState,
  syncActiveBlockRelationships,
} from '@/utils/admin/serviceBlockActivation'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalRelationship } from '@/types/relationships'

function shape(id: string, name: string, semanticType: string, validBookingCascades: string[] = []): GlobalEntity<'blockShape'> {
  return { id, entityKey: 'blockShape', name, orderIndex: 0, semanticType, validBookingCascades } as GlobalEntity<'blockShape'>
}

function block(id: string, name: string, blockShapeRef: string, wizardPlacement = 'topLine'): GlobalEntity<'blockInstance'> {
  return {
    id,
    entityKey: 'blockInstance',
    name,
    orderIndex: 0,
    blockShapeRef,
    icon: '',
    isMultiFamily: false,
    requiresAgent: false,
    wizardPlacement,
    active: true,
  } as GlobalEntity<'blockInstance'>
}

function rel(parent: GlobalEntity<'blockInstance'>, children: GlobalEntity<'blockInstance'>[]): GlobalRelationship {
  return { relationshipKind: 'bookingCascades', parent, children } as GlobalRelationship
}

describe('serviceBlockActivation', () => {
  it('splits active time and fee block options for a service', () => {
    const serviceShape = shape('shape-service', 'Service', BLOCK_SHAPE_TYPES.SERVICE, ['shape-time', 'shape-price'])
    const timeShape = shape('shape-time', 'Inspection Time', BLOCK_SHAPE_TYPES.TIME)
    const priceShape = shape('shape-price', 'Fee', BLOCK_SHAPE_TYPES.PRICE)
    const service = block('service-1', 'Buyer Inspection', 'shape-service')
    const time = block('time-1', 'Exterior Observations', 'shape-time')
    const fee = block('fee-1', 'Rush Fee', 'shape-price')

    const state = buildServiceBlockActivationState({
      serviceBlockId: 'service-1',
      blockInstances: [service, time, fee],
      blockShapes: [serviceShape, timeShape, priceShape],
      bookingCascades: [rel(service, [time, fee])],
    })

    expect(state.timeOptions.map((option) => option.id)).toEqual(['time-1'])
    expect(state.feeOptions.map((option) => option.id)).toEqual(['fee-1'])
    expect(state.selectedTimeIds).toEqual(['time-1'])
    expect(state.selectedFeeIds).toEqual(['fee-1'])
  })

  it('keeps selected linked blocks in options so chips show names instead of ids', () => {
    const serviceShape = shape('shape-service', 'Service', BLOCK_SHAPE_TYPES.SERVICE, ['shape-time'])
    const timeShape = shape('shape-time', 'Inspection Time', BLOCK_SHAPE_TYPES.TIME)
    const service = block('service-1', 'Buyer Inspection', 'shape-service')
    const additionalTime = block('time-additional', 'Water Heater Time', 'shape-time', 'additional')

    const state = buildServiceBlockActivationState({
      serviceBlockId: 'service-1',
      blockInstances: [service, additionalTime],
      blockShapes: [serviceShape, timeShape],
      bookingCascades: [rel(service, [additionalTime])],
    })

    expect(state.selectedTimeIds).toEqual(['time-additional'])
    expect(state.timeOptions).toContainEqual({
      id: 'time-additional',
      title: 'Water Heater Time',
      shapeName: 'Inspection Time',
    })
  })

  it('syncs only the selected semantic ids passed to it', async () => {
    const createBookingCascade = vi.fn().mockResolvedValue({ id: 'created' })
    const removeBookingCascade = vi.fn().mockResolvedValue(undefined)

    await syncActiveBlockRelationships({
      serviceBlockId: 'service-1',
      oldIds: ['time-a', 'time-b'],
      newIds: ['time-b', 'time-c'],
      createBookingCascade,
      removeBookingCascade,
    })

    expect(createBookingCascade).toHaveBeenCalledWith({
      parentId: 'service-1',
      childId: 'time-c',
    })
    expect(removeBookingCascade).toHaveBeenCalledWith('service-1', 'time-a')
  })
})
