import { describe, it, expect } from 'vitest'
import {
  parseDifferentialRole,
  sanitizeDifferentialRoleInput,
  toApiDifferentialRole,
} from '@shared/utils/differentialRoleUtils'

describe('differentialRoleUtils (shared)', () => {
  it('parseDifferentialRole maps storage and null', () => {
    expect(parseDifferentialRole(null)).toBe('none')
    expect(parseDifferentialRole('major')).toBe('major')
    expect(parseDifferentialRole('none')).toBe('none')
    expect(parseDifferentialRole('invalid')).toBe('none')
  })

  it('sanitizeDifferentialRoleInput for API write', () => {
    expect(sanitizeDifferentialRoleInput(null)).toBe(null)
    expect(sanitizeDifferentialRoleInput('none')).toBe(null)
    expect(sanitizeDifferentialRoleInput('major')).toBe('major')
    expect(sanitizeDifferentialRoleInput('bogus')).toBe(null)
  })

  it('toApiDifferentialRole', () => {
    expect(toApiDifferentialRole('none')).toBe(null)
    expect(toApiDifferentialRole('minor')).toBe('minor')
  })
})
