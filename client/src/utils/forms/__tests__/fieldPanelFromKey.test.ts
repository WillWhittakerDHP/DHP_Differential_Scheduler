import { describe, expect, it } from 'vitest'
import { determinePanelFromFieldKey } from '@/utils/forms/fieldPanelFromKey'

describe('determinePanelFromFieldKey', () => {
  it('puts annotation assignments in the Annotations collapse', () => {
    expect(determinePanelFromFieldKey('annotationAssignments')).toBe('annotations')
  })

  it('puts instanceComponents in composition (Composite packaging, not Orchestrator)', () => {
    expect(determinePanelFromFieldKey('instanceComponents')).toBe('composition')
  })

  it('keeps part and event assignment panels', () => {
    expect(determinePanelFromFieldKey('partAssignments')).toBe('parts')
    expect(determinePanelFromFieldKey('eventAssignments')).toBe('events')
  })
})
