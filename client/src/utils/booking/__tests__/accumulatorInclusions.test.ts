/**
 * Accumulator lateral inclusion gates — pure evaluator tests.
 */
import { describe, expect, it } from 'vitest'
import {
  isPropertyFactPresent,
  resolveAccumulatorInclusions,
  PROPERTY_FACT_KEYS,
} from '@shared/constants/accumulator'

describe('isPropertyFactPresent', () => {
  it('treats positive numbers as present', () => {
    expect(isPropertyFactPresent(2)).toBe(true)
    expect(isPropertyFactPresent(0)).toBe(false)
    expect(isPropertyFactPresent(-1)).toBe(false)
  })

  it('treats true as present and false/null/undefined as absent', () => {
    expect(isPropertyFactPresent(true)).toBe(true)
    expect(isPropertyFactPresent(false)).toBe(false)
    expect(isPropertyFactPresent(null)).toBe(false)
    expect(isPropertyFactPresent(undefined)).toBe(false)
  })

  it('treats non-empty strings as present', () => {
    expect(isPropertyFactPresent('basement')).toBe(true)
    expect(isPropertyFactPresent('')).toBe(false)
    expect(isPropertyFactPresent('  ')).toBe(false)
  })
})

describe('resolveAccumulatorInclusions', () => {
  const parents = [
    { id: 'svc-equipment-testing', accumulator: true },
    { id: 'svc-roof', accumulator: false },
  ]

  const links = [
    {
      parentId: 'svc-equipment-testing',
      childId: 'time-hvac',
      propertyFactKey: PROPERTY_FACT_KEYS.HVAC_COUNT,
    },
    {
      parentId: 'svc-equipment-testing',
      childId: 'time-water-heater',
      propertyFactKey: PROPERTY_FACT_KEYS.WATER_HEATER_COUNT,
    },
    {
      parentId: 'svc-equipment-testing',
      childId: 'time-kitchen',
      propertyFactKey: PROPERTY_FACT_KEYS.KITCHEN_APPLIANCE_COUNT,
    },
    {
      parentId: 'svc-roof',
      childId: 'time-hvac',
      propertyFactKey: PROPERTY_FACT_KEYS.HVAC_COUNT,
    },
  ]

  it('includes only facts present when accumulator service is selected (HVAC×2 + water heater)', () => {
    const ids = resolveAccumulatorInclusions({
      selectedParentIds: ['svc-equipment-testing'],
      parents,
      links,
      propertyFacts: {
        hvacCount: 2,
        waterHeaterCount: 1,
        kitchenApplianceCount: 0,
      },
    })
    expect(ids.sort()).toEqual(['time-hvac', 'time-water-heater'].sort())
  })

  it('includes only kitchen when that is the only present fact', () => {
    const ids = resolveAccumulatorInclusions({
      selectedParentIds: ['svc-equipment-testing'],
      parents,
      links,
      propertyFacts: {
        kitchenApplianceCount: 3,
      },
    })
    expect(ids).toEqual(['time-kitchen'])
  })

  it('excludes everything when the accumulator service is not selected', () => {
    const ids = resolveAccumulatorInclusions({
      selectedParentIds: ['svc-roof'],
      parents,
      links,
      propertyFacts: {
        hvacCount: 2,
        waterHeaterCount: 1,
      },
    })
    expect(ids).toEqual([])
  })

  it('ignores links from non-accumulator parents even if selected', () => {
    const ids = resolveAccumulatorInclusions({
      selectedParentIds: ['svc-roof'],
      parents,
      links,
      propertyFacts: { hvacCount: 5 },
    })
    expect(ids).toEqual([])
  })

  it('skips links with empty propertyFactKey', () => {
    const ids = resolveAccumulatorInclusions({
      selectedParentIds: ['svc-equipment-testing'],
      parents,
      links: [
        {
          parentId: 'svc-equipment-testing',
          childId: 'time-orphan',
          propertyFactKey: '',
        },
      ],
      propertyFacts: { hvacCount: 1 },
    })
    expect(ids).toEqual([])
  })
})
