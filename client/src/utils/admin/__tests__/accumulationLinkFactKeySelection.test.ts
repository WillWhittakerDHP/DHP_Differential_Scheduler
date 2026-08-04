import { describe, expect, it } from 'vitest'
import {
  getAccumulationLinkChildFactKey,
  setAccumulationLinkChildFactKey,
} from '@/utils/admin/accumulationLinkFactKeySelection'

describe('accumulationLinkFactKeySelection', () => {
  it('stores fact keys per parent-child link', () => {
    setAccumulationLinkChildFactKey('service-equipment', 'time-furnace', 'hvacCount')
    setAccumulationLinkChildFactKey('service-equipment', 'time-water-heater', 'waterHeaterCount')

    expect(getAccumulationLinkChildFactKey('service-equipment', 'time-furnace')).toBe('hvacCount')
    expect(getAccumulationLinkChildFactKey('service-equipment', 'time-water-heater')).toBe('waterHeaterCount')
  })

  it('uses an empty fact key when no child fact was registered', () => {
    expect(getAccumulationLinkChildFactKey('service-equipment', 'time-unconfigured')).toBe('')
  })
})
