import { describe, it, expect } from 'vitest'
import {
  bookingModeToTernary,
  rawBookingModeAllowsDependentLineItems,
  rawBookingModeIsAddOnOnly,
  ternaryToBookingMode,
} from '@shared/utils/ternaryAliasUtils'

describe('ternaryAliasUtils (shared)', () => {
  it('maps ternary to booking domain', () => {
    expect(ternaryToBookingMode('false')).toBe('standalone')
    expect(ternaryToBookingMode('true')).toBe('addOn')
    expect(ternaryToBookingMode('override')).toBe('both')
  })

  it('maps booking domain to ternary', () => {
    expect(bookingModeToTernary('standalone')).toBe('false')
    expect(bookingModeToTernary('addOn')).toBe('true')
    expect(bookingModeToTernary('both')).toBe('override')
  })

  it('detects add-on-only raw values', () => {
    expect(rawBookingModeIsAddOnOnly('true')).toBe(true)
    expect(rawBookingModeIsAddOnOnly('addOn')).toBe(true)
    expect(rawBookingModeIsAddOnOnly('false')).toBe(false)
  })

  it('detects dependent line item eligibility', () => {
    expect(rawBookingModeAllowsDependentLineItems('true')).toBe(true)
    expect(rawBookingModeAllowsDependentLineItems('override')).toBe(true)
    expect(rawBookingModeAllowsDependentLineItems('addOn')).toBe(true)
    expect(rawBookingModeAllowsDependentLineItems('both')).toBe(true)
    expect(rawBookingModeAllowsDependentLineItems('false')).toBe(false)
    expect(rawBookingModeAllowsDependentLineItems('standalone')).toBe(false)
  })
})
