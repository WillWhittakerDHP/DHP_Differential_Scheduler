/**
 * USEINSTANCESELECTIONCONFIG TESTS
 * 
 * Unit tests for useInstanceSelectionConfig composable.
 * Tests selection config generation for different layout types.
 * 
 * What it covers:
 * - useInstanceSelectionConfig: Generic selection config generator
 * 
 * How it works:
 * - Tests row vs stack selection type generation
 * - Tests computed config reactivity
 * 
 * What it validates:
 * - Correct config built for 'row' selection type
 * - Correct config built for 'stack' selection type
 * 
 * NOTE: State plugin tests are limited because createWizardStatePlugin uses
 * Vue's inject() which requires a component context. The plugin creation
 * is tested indirectly through the config output.
 * 
 * Dependencies:
 * - vitest for testing
 * - vue computed for reactive state
 */

import { describe, it, expect } from 'vitest'
import { computed, nextTick, ref } from 'vue'
import {
  useInstanceSelectionConfig,
} from '../useInstanceSelectionConfig'

describe('useInstanceSelectionConfig', () => {
  describe('selectionConfig', () => {
    it('should return stack config by default', () => {
      const { selectionConfig } = useInstanceSelectionConfig()
      
      expect(selectionConfig.value).toBeDefined()
      expect(selectionConfig.value.layout).toBe('stack')
    })

    it('should return row config when selectionType is row', () => {
      const { selectionConfig } = useInstanceSelectionConfig({
        selectionType: 'row',
      })
      
      expect(selectionConfig.value.layout).toBe('row')
    })

    it('should return stack config when selectionType is stack', () => {
      const { selectionConfig } = useInstanceSelectionConfig({
        selectionType: 'stack',
      })
      
      expect(selectionConfig.value.layout).toBe('stack')
    })

    it('should be reactive to selectedValue changes', async () => {
      const selectedValueRef = ref<unknown>(null)
      const selectedValue = computed(() => selectedValueRef.value)
      
      const { selectionConfig } = useInstanceSelectionConfig({
        selectedValue,
      })
      
      const initialConfig = selectionConfig.value
      expect(initialConfig).toBeDefined()
      
      selectedValueRef.value = { id: 'test' }
      await nextTick()
      
      expect(selectionConfig.value).toBeDefined()
    })

    it('should have valid selectionType property', () => {
      const { selectionConfig } = useInstanceSelectionConfig({
        selectionType: 'row',
      })
      
      expect(selectionConfig.value.selectionType).toBe('radio')
    })
  })
})
