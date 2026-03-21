import { describe, it, expect } from 'vitest'
import type { DriveTimeFeeConfig } from '@shared/types/availabilityTypes'
import { computeDriveTimeFee, roundBillableDriveMinutesToNearest } from '../computeDriveTimeFee'

function settings(over: Partial<DriveTimeFeeConfig> = {}): DriveTimeFeeConfig {
  return {
    complimentaryDriveMinutes: 0,
    drivingRatePerHour: 60,
    driveTimeRoundingMinutes: 15,
    ...over,
  }
}

describe('roundBillableDriveMinutesToNearest', () => {
  it('returns 0 for zero billable', () => {
    expect(roundBillableDriveMinutesToNearest(0, 15)).toBe(0)
  })

  it('rounds to nearest increment (15)', () => {
    expect(roundBillableDriveMinutesToNearest(7, 15)).toBe(0)
    expect(roundBillableDriveMinutesToNearest(8, 15)).toBe(15)
    expect(roundBillableDriveMinutesToNearest(20, 15)).toBe(15)
    expect(roundBillableDriveMinutesToNearest(23, 15)).toBe(30)
  })

  it('rejects non-positive increment', () => {
    expect(() => roundBillableDriveMinutesToNearest(10, 0)).toThrow(/driveTimeRoundingMinutes/)
    expect(() => roundBillableDriveMinutesToNearest(10, -5)).toThrow(/driveTimeRoundingMinutes/)
  })
})

describe('computeDriveTimeFee', () => {
  it('returns zero fee when total is within complimentary', () => {
    const r = computeDriveTimeFee(10, settings({ complimentaryDriveMinutes: 15 }))
    expect(r.billableMinutesRaw).toBe(0)
    expect(r.billableMinutesRounded).toBe(0)
    expect(r.fee).toBe(0)
  })

  it('applies complimentary then nearest rounding then hourly rate', () => {
    /* total 40, comp 10 → raw 30; nearest 15 → 30; fee = 30/60 * 60 = 30 */
    const r = computeDriveTimeFee(40, settings({ complimentaryDriveMinutes: 10, drivingRatePerHour: 60 }))
    expect(r.billableMinutesRaw).toBe(30)
    expect(r.billableMinutesRounded).toBe(30)
    expect(r.fee).toBe(30)
  })

  it('handles zero total', () => {
    const r = computeDriveTimeFee(0, settings())
    expect(r.fee).toBe(0)
    expect(r.billableMinutesRaw).toBe(0)
  })

  it('uses fractional rate per hour', () => {
    /* raw 60, round 60 with increment 15 → 60; fee = 60/60 * 12.5 = 12.5 */
    const r = computeDriveTimeFee(60, settings({ drivingRatePerHour: 12.5, driveTimeRoundingMinutes: 15 }))
    expect(r.billableMinutesRounded).toBe(60)
    expect(r.fee).toBe(12.5)
  })

  it('throws on negative total', () => {
    expect(() => computeDriveTimeFee(-1, settings())).toThrow(/totalDriveMinutes/)
  })

  it('throws on invalid rounding increment in settings', () => {
    expect(() => computeDriveTimeFee(10, settings({ driveTimeRoundingMinutes: 0 }))).toThrow(
      /driveTimeRoundingMinutes/
    )
  })
})
