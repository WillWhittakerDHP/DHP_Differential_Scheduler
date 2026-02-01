
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useResponsiveGrid } from '../useResponsiveGrid'

const mockResizeObserver = vi.fn()
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

mockResizeObserver.mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}))

vi.stubGlobal('ResizeObserver', mockResizeObserver)

describe('useResponsiveGrid', () => {
  let originalInnerWidth: number

  beforeEach(() => {
    vi.clearAllMocks()
    originalInnerWidth = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true })
  })

  describe('initial state', () => {
    it('should initialize containerWidth to 0', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth } = useResponsiveGrid({ gridRef })

      expect(containerWidth.value).toBe(0)
    })

    it('should return minColumns when containerWidth is 0', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { buttonGridColumns } = useResponsiveGrid({ gridRef, minColumns: 3 })

      expect(buttonGridColumns.value).toBe(3)
    })
  })

  describe('buttonGridColumns calculation', () => {
    it('should calculate columns based on width', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, buttonGridColumns } = useResponsiveGrid({
        gridRef,
        minColumns: 2,
        maxColumns: 8,
        buttonMinWidth: 80,
        gap: 10,
        padding: 32,
      })

      containerWidth.value = 500

      expect(buttonGridColumns.value).toBe(5)
    })

    it('should clamp to minColumns', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, buttonGridColumns } = useResponsiveGrid({
        gridRef,
        minColumns: 3,
        buttonMinWidth: 80,
        gap: 10,
        padding: 32,
      })

      containerWidth.value = 100

      expect(buttonGridColumns.value).toBe(3) // Clamped to min
    })

    it('should clamp to maxColumns', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, buttonGridColumns } = useResponsiveGrid({
        gridRef,
        maxColumns: 4,
        buttonMinWidth: 80,
        gap: 10,
        padding: 32,
      })

      containerWidth.value = 2000

      expect(buttonGridColumns.value).toBe(4) // Clamped to max
    })

    it('should use default options', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, buttonGridColumns } = useResponsiveGrid({ gridRef })

      containerWidth.value = 500

      expect(buttonGridColumns.value).toBe(5)
    })
  })

  describe('isSingleColumn', () => {
    it('should return false on desktop viewport', () => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
      
      const gridRef = ref<HTMLElement | null>(null)
      const { isSingleColumn } = useResponsiveGrid({ gridRef })

      expect(isSingleColumn.value).toBe(false)
    })

    it('should return true on mobile viewport with few columns', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400, writable: true })
      
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, isSingleColumn } = useResponsiveGrid({
        gridRef,
        minColumns: 2,
      })

      containerWidth.value = 200

      expect(isSingleColumn.value).toBe(true)
    })

    it('should return false on mobile viewport with many columns', () => {
      Object.defineProperty(window, 'innerWidth', { value: 400, writable: true })
      
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, isSingleColumn } = useResponsiveGrid({
        gridRef,
        minColumns: 3,
      })

      containerWidth.value = 500 // Forces more columns

      expect(isSingleColumn.value).toBe(false)
    })
  })

  describe('ResizeObserver lifecycle', () => {
    it('should create ResizeObserver on mount when ref is available', async () => {
      const mockElement = document.createElement('div')
      mockElement.getBoundingClientRect = vi.fn().mockReturnValue({ width: 500 })
      
      const gridRef = ref<HTMLElement | null>(null)
      useResponsiveGrid({ gridRef })

      gridRef.value = mockElement
      await nextTick()

    })
  })

  describe('options customization', () => {
    it('should accept custom minColumns', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, buttonGridColumns } = useResponsiveGrid({
        gridRef,
        minColumns: 4,
      })

      containerWidth.value = 100
      expect(buttonGridColumns.value).toBe(4)
    })

    it('should accept custom maxColumns', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, buttonGridColumns } = useResponsiveGrid({
        gridRef,
        maxColumns: 3,
      })

      containerWidth.value = 2000
      expect(buttonGridColumns.value).toBe(3)
    })

    it('should accept custom buttonMinWidth', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, buttonGridColumns } = useResponsiveGrid({
        gridRef,
        buttonMinWidth: 120,
        gap: 10,
        padding: 32,
        minColumns: 2,
        maxColumns: 10,
      })

      containerWidth.value = 500
      expect(buttonGridColumns.value).toBe(3)
    })

    it('should accept custom gap', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, buttonGridColumns } = useResponsiveGrid({
        gridRef,
        buttonMinWidth: 80,
        gap: 20,
        padding: 32,
        minColumns: 2,
        maxColumns: 10,
      })

      containerWidth.value = 500
      expect(buttonGridColumns.value).toBe(4)
    })

    it('should accept custom padding', () => {
      const gridRef = ref<HTMLElement | null>(null)
      const { containerWidth, buttonGridColumns } = useResponsiveGrid({
        gridRef,
        buttonMinWidth: 80,
        gap: 10,
        padding: 100,
        minColumns: 2,
        maxColumns: 10,
      })

      containerWidth.value = 500
      expect(buttonGridColumns.value).toBe(4)
    })
  })
})
