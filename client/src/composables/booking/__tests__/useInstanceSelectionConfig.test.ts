/**
 * USEINSTANCESELECTIONCONFIG TESTS
 * 
 * Unit tests for useInstanceSelectionConfig composable.
 * Tests selection config generation for different layout types.
 * 
 * What it covers:
 * - useInstanceSelectionConfig: Generic selection config generator
 * - useServiceSelectionConfig: Legacy backward-compatible export
 * 
 * How it works:
 * - Tests row vs stack selection type generation
 * - Tests computed config reactivity
 * 
 * What it validates:
 * - Correct config built for 'row' selection type
 * - Correct config built for 'stack' selection type
 * - Legacy export provides same functionality
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
  useServiceSelectionConfig,
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
      
      // Access initial config
      const initialConfig = selectionConfig.value
      expect(initialConfig).toBeDefined()
      
      // Change selected value
      selectedValueRef.value = { id: 'test' }
      await nextTick()
      
      // Config should still be valid
      expect(selectionConfig.value).toBeDefined()
    })

    it('should have valid selectionType property', () => {
      const { selectionConfig } = useInstanceSelectionConfig({
        selectionType: 'row',
      })
      
      // Row configs use radio selection
      expect(selectionConfig.value.selectionType).toBe('radio')
    })
  })
})

describe('useServiceSelectionConfig (legacy)', () => {
  it('should return rowSelectionConfig and stackSelectionConfig', () => {
    const selectedUserTypeBlock = computed(() => null)
    const selectedServices = computed(() => [] as unknown[])
    
    const {
      rowSelectionConfig,
      stackSelectionConfig,
    } = useServiceSelectionConfig({
      selectedUserTypeBlock,
      selectedServices,
    })
    
    expect(rowSelectionConfig.value).toBeDefined()
    expect(stackSelectionConfig.value).toBeDefined()
  })

  it('should have row layout for rowSelectionConfig', () => {
    const selectedUserTypeBlock = computed(() => null)
    const selectedServices = computed(() => [] as unknown[])
    
    const { rowSelectionConfig } = useServiceSelectionConfig({
      selectedUserTypeBlock,
      selectedServices,
    })
    
    expect(rowSelectionConfig.value.layout).toBe('row')
  })

  it('should have stack layout for stackSelectionConfig', () => {
    const selectedUserTypeBlock = computed(() => null)
    const selectedServices = computed(() => [] as unknown[])
    
    const { stackSelectionConfig } = useServiceSelectionConfig({
      selectedUserTypeBlock,
      selectedServices,
    })
    
    expect(stackSelectionConfig.value.layout).toBe('stack')
  })
})
