import { describe, expect, it } from 'vitest'
import { relationshipIdsToPostForSave } from '@/utils/fieldContext/fieldContextSaveHelpers'

describe('fieldContextSaveHelpers', () => {
  it('posts all selected accumulator links so edge fact keys are reconciled', () => {
    expect(
      relationshipIdsToPostForSave(
        'accumulationLinks',
        ['new-child'],
        ['existing-child', 'new-child']
      )
    ).toEqual(['existing-child', 'new-child'])
  })

  it('posts only additions for ordinary relationship fields', () => {
    expect(
      relationshipIdsToPostForSave(
        'bookingCascades',
        ['new-child'],
        ['existing-child', 'new-child']
      )
    ).toEqual(['new-child'])
  })
})
