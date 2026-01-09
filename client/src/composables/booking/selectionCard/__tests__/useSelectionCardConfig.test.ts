/**
 * USESELECTIONCARDCONFIG TESTS
 * 
 * Unit tests for useSelectionCardConfig composable.
 * Tests config merging with defaults.
 * 
 * What it covers:
 * - configWithDefaults: Merge user config with defaults
 * 
 * How it works:
 * - Tests delegation to mergeSelectionCardConfigWithDefaults
 * - Tests computed reactivity
 * 
 * Dependencies:
 * - vitest for testing
 * - vue ref/computed for reactive state
 */

import { describe, it, expect } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useSelectionCardConfig } from '../useSelectionCardConfig'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

describe('useSelectionCardConfig', () => {
  describe('configWithDefaults', () => {
    it('should return defaults when config is undefined', () => {
      const config = ref<SelectionCardConfig | undefined>(undefined)
      
      const { configWithDefaults } = useSelectionCardConfig({ config })
      
      expect(configWithDefaults.value).toBeDefined()
      expect(configWithDefaults.value.selectionType).toBe('radio')
      expect(configWithDefaults.value.layout).toBe('row')
    })

    it('should preserve user config values', () => {
      const config = ref<SelectionCardConfig | undefined>({
        selectionType: 'checkbox',
        layout: 'stack',
      } as SelectionCardConfig)
      
      const { configWithDefaults } = useSelectionCardConfig({ config })
      
      expect(configWithDefaults.value.selectionType).toBe('checkbox')
      expect(configWithDefaults.value.layout).toBe('stack')
    })

    it('should fill missing values with defaults', () => {
      const config = ref<SelectionCardConfig | undefined>({
        selectionType: 'checkbox',
      } as SelectionCardConfig)
      
      const { configWithDefaults } = useSelectionCardConfig({ config })
      
      expect(configWithDefaults.value.selectionType).toBe('checkbox')
      expect(configWithDefaults.value.selectionComponent).toBe('VRadio') // Default
      expect(configWithDefaults.value.controlPosition).toBe('bottom') // Default
    })

    it('should be reactive to config changes', async () => {
      const config = ref<SelectionCardConfig | undefined>(undefined)
      
      const { configWithDefaults } = useSelectionCardConfig({ config })
      
      expect(configWithDefaults.value.selectionType).toBe('radio')
      
      config.value = { selectionType: 'checkbox' } as SelectionCardConfig
      await nextTick()
      
      expect(configWithDefaults.value.selectionType).toBe('checkbox')
    })

    it('should work with computed config', () => {
      const baseConfig = ref<SelectionCardConfig | undefined>({
        layout: 'column',
      } as SelectionCardConfig)
      const config = computed(() => baseConfig.value)
      
      const { configWithDefaults } = useSelectionCardConfig({ config })
      
      expect(configWithDefaults.value.layout).toBe('column')
    })
  })
})
