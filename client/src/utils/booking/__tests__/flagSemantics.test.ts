/**
 * Locks in instance-flag semantics audited in Phase 1 (2026-07-12).
 * WHY: Prove orchestrator/composite flags drive real booking behavior — not just column presence.
 */
import { describe, expect, it } from 'vitest'
import { isDifferentialFromSelectedBlocks } from '@/composables/booking/useAvailabilityLogic'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

function stubBlock(overrides: Partial<BookingBlockInstance> = {}): BookingBlockInstance {
  return {
    id: 'block-1',
    entityKey: 'blockInstance',
    name: 'stub',
    active: true,
    orchestrator: false,
    wizardPlacement: 'topLine',
    preClosing: false,
    orderIndex: 0,
    blockShape: 'service',
    blockShapeRef: 'shape-service',
    activeBlockIds: [],
    partInstances: [],
    allowMultiple: false,
    requiresUnitNumber: null,
    isMultiFamily: false,
    requiresAgent: false,
    ...overrides,
  } as BookingBlockInstance
}

describe('orchestrator flag — differential scheduling', () => {
  it('treats booking as differential when any selected block has orchestrator=true', () => {
    expect(isDifferentialFromSelectedBlocks([stubBlock({ orchestrator: true })])).toBe(true)
  })

  it('treats booking as non-differential when no selected block has orchestrator=true', () => {
    expect(isDifferentialFromSelectedBlocks([stubBlock({ orchestrator: false })])).toBe(false)
    expect(isDifferentialFromSelectedBlocks([])).toBe(false)
  })

  it('mixed selection is differential if at least one orchestrator block is selected', () => {
    expect(
      isDifferentialFromSelectedBlocks([
        stubBlock({ id: 'a', orchestrator: false }),
        stubBlock({ id: 'b', orchestrator: true }),
      ])
    ).toBe(true)
  })
})
