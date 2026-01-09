/**
 * USESELECTIONCARDGROUPCONFIG TESTS
 * 
 * Unit tests for useSelectionCardGroupConfig composable.
 * Tests group configuration for selection cards.
 * 
 * What it covers:
 * - configWithDefaults: Merged config with defaults
 * - useGroupWrapper: Whether to use group wrapper
 * - groupComponentName: Name of group component
 * - gridColumnProps: Grid column props for layout
 * 
 * How it works:
 * - Tests config merging
 * - Tests group wrapper determination
 * - Tests component name resolution
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { useSelectionCardGroupConfig } from '../useSelectionCardGroupConfig'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

describe('useSelectionCardGroupConfig', () => {
  describe('configWithDefaults', () => {
    it('should return config with defaults when undefined', () => {
      const config = ref<SelectionCardConfig | undefined>(undefined)
      
      const { configWithDefaults } = useSelectionCardGroupConfig({ config })
      
      expect(configWithDefaults.value).toBeDefined()
      expect(configWithDefaults.value.selectionType).toBe('radio')
    })

    it('should preserve user config values', () => {
      const config = ref<SelectionCardConfig | undefined>({
        selectionType: 'checkbox',
        layout: 'stack',
      } as SelectionCardConfig)
      
      const { configWithDefaults } = useSelectionCardGroupConfig({ config })
      
      expect(configWithDefaults.value.selectionType).toBe('checkbox')
      expect(configWithDefaults.value.layout).toBe('stack')
    })
  })

  describe('useGroupWrapper', () => {
    it('should return false for selectionGroup none', () => {
      const config = ref<SelectionCardConfig | undefined>({
        selectionGroup: 'none',
      } as SelectionCardConfig)
      
      const { useGroupWrapper } = useSelectionCardGroupConfig({ config })
      
      expect(useGroupWrapper.value).toBe(false)
    })

    it('should return true for selectionGroup v-radio-group', () => {
      const config = ref<SelectionCardConfig | undefined>({
        selectionGroup: 'v-radio-group',
      } as SelectionCardConfig)
      
      const { useGroupWrapper } = useSelectionCardGroupConfig({ config })
      
      expect(useGroupWrapper.value).toBe(true)
    })
  })

  describe('groupComponentName', () => {
    it('should return selectionGroup value', () => {
      const config = ref<SelectionCardConfig | undefined>({
        selectionGroup: 'v-radio-group',
      } as SelectionCardConfig)
      
      const { groupComponentName } = useSelectionCardGroupConfig({ config })
      
      // Returns the selectionGroup value as-is
      expect(groupComponentName.value).toBe('v-radio-group')
    })

    it('should return selectionGroup value for none', () => {
      const config = ref<SelectionCardConfig | undefined>({
        selectionGroup: 'none',
      } as SelectionCardConfig)
      
      const { groupComponentName } = useSelectionCardGroupConfig({ config })
      
      // Returns the selectionGroup value as-is (used for conditional rendering)
      expect(groupComponentName.value).toBe('none')
    })
  })

  describe('gridColumnProps', () => {
    it('should return grid column props from config', () => {
      const config = ref<SelectionCardConfig | undefined>({
        gridColumns: { cols: '6', sm: '4', md: '3' },
      } as SelectionCardConfig)
      
      const { gridColumnProps } = useSelectionCardGroupConfig({ config })
      
      expect(gridColumnProps.value.cols).toBe('6')
      expect(gridColumnProps.value.sm).toBe('4')
    })

    it('should return default grid columns when not specified', () => {
      const config = ref<SelectionCardConfig | undefined>(undefined)
      
      const { gridColumnProps } = useSelectionCardGroupConfig({ config })
      
      expect(gridColumnProps.value).toBeDefined()
    })
  })
})
