import { describe, expect, it } from 'vitest'
import { resolveRelationshipOptionsFieldKey } from '@/utils/admin/relationshipCollectionFieldConfig'

describe('resolveRelationshipOptionsFieldKey', () => {
  it('maps partAssignments to validPartCascades (not validParts)', () => {
    expect(resolveRelationshipOptionsFieldKey('test', {}, 'partAssignments')).toBe(
      'validPartCascades'
    )
  })

  it('maps booking and event cascade relationships to renamed validity fields', () => {
    expect(resolveRelationshipOptionsFieldKey('test', {}, 'bookingCascades')).toBe(
      'validBookingCascades'
    )
    expect(resolveRelationshipOptionsFieldKey('test', {}, 'eventAssignments')).toBe(
      'validEventCascades'
    )
  })
})
