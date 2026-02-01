
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { computed } from 'vue'
import type { BookingBlockInstance } from '@/utils/transformers/globalToBookingTransformer'

vi.mock('../../useGlobal', () => ({
  useGlobal: () => ({
    getGlobalEntityById: vi.fn(() => null),
    getGlobalData: vi.fn(() => ({})),
  }),
}))

vi.mock('../../useComponentEntity', () => ({
  useComponentEntity: () => ({
    getComponents: vi.fn(() => []),
  }),
}))

import { useInstanceComponents } from '../useInstanceComponents'

function createService(id: string, options: Partial<BookingBlockInstance> = {}): BookingBlockInstance {
  return {
    id,
    name: `Service ${id}`,
    description: 'Default description',
    ...options,
  } as BookingBlockInstance
}

describe('useInstanceComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('return structure', () => {
    it('should return isComposable computed', () => {
      const service = computed(() => createService('service-1'))
      const selectedUserTypeBlock = computed(() => null)
      
      const { isComposable } = useInstanceComponents({
        service,
        selectedUserTypeBlock,
      })
      
      expect(isComposable).toBeDefined()
      expect(typeof isComposable.value).toBe('boolean')
    })

    it('should return instanceComponents computed', () => {
      const service = computed(() => createService('service-1'))
      const selectedUserTypeBlock = computed(() => null)
      
      const { instanceComponents } = useInstanceComponents({
        service,
        selectedUserTypeBlock,
      })
      
      expect(instanceComponents).toBeDefined()
      expect(Array.isArray(instanceComponents.value)).toBe(true)
    })

    it('should return componentCount computed', () => {
      const service = computed(() => createService('service-1'))
      const selectedUserTypeBlock = computed(() => null)
      
      const { componentCount } = useInstanceComponents({
        service,
        selectedUserTypeBlock,
      })
      
      expect(componentCount).toBeDefined()
      expect(typeof componentCount.value).toBe('number')
    })
  })

  describe('isComposable', () => {
    it('should return false when service is null', () => {
      const service = computed(() => null)
      const selectedUserTypeBlock = computed(() => null)
      
      const { isComposable } = useInstanceComponents({
        service,
        selectedUserTypeBlock,
      })
      
      expect(isComposable.value).toBe(false)
    })
  })

  describe('instanceComponents', () => {
    it('should return empty array when not composable', () => {
      const service = computed(() => createService('service-1'))
      const selectedUserTypeBlock = computed(() => null)
      
      const { instanceComponents } = useInstanceComponents({
        service,
        selectedUserTypeBlock,
      })
      
      expect(instanceComponents.value).toEqual([])
    })

    it('should return empty array when service is null', () => {
      const service = computed(() => null)
      const selectedUserTypeBlock = computed(() => null)
      
      const { instanceComponents } = useInstanceComponents({
        service,
        selectedUserTypeBlock,
      })
      
      expect(instanceComponents.value).toEqual([])
    })
  })

  describe('componentCount', () => {
    it('should return 0 when no components', () => {
      const service = computed(() => createService('service-1'))
      const selectedUserTypeBlock = computed(() => null)
      
      const { componentCount } = useInstanceComponents({
        service,
        selectedUserTypeBlock,
      })
      
      expect(componentCount.value).toBe(0)
    })
  })
})
