/**
 * SELECTION CARD STYLES TESTS
 * 
 * Unit tests for selectionCardStyles utility functions.
 * Tests CSS class building for selection cards.
 * 
 * What it covers:
 * - buildSelectionCardClasses: Build card CSS classes
 * - buildSelectionControlClasses: Build control position classes
 * - buildSelectionContentContainerClasses: Build content container classes
 * 
 * How it works:
 * - Tests class generation based on config options
 * - Tests selected state class toggling
 * - Tests layout-specific class variations
 * 
 * What it validates:
 * - Base classes always present
 * - Conditional classes based on config
 * - Selected state adds 'active' class
 * - Layout affects alignment classes
 * 
 * Dependencies:
 * - vitest for testing
 * - SelectionCardConfig type
 */

import { describe, it, expect } from 'vitest'
import {
  buildSelectionCardClasses,
  buildSelectionControlClasses,
  buildSelectionContentContainerClasses,
} from '../selectionCardStyles'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

// Helper to create minimal config
function createConfig(overrides: Partial<SelectionCardConfig> = {}): SelectionCardConfig {
  return {
    selectionType: 'radio',
    selectionComponent: 'VRadio',
    selectionGroup: 'VRadioGroup',
    stateSource: 'local',
    statePlugins: [],
    layout: 'row',
    controlPosition: 'bottom',
    gridColumns: { cols: '12', sm: '6', md: '4' },
    appearance: {
      showIcon: true,
      showDescription: true,
      showBorder: true,
      cardPadding: 'pa-6',
      minHeight: 'auto',
    },
    ...overrides,
  }
}

describe('selectionCardStyles', () => {
  describe('buildSelectionCardClasses', () => {
    it('should include base classes', () => {
      const config = createConfig()
      
      const result = buildSelectionCardClasses(config, false)
      
      expect(result).toContain('selection-card')
      expect(result).toContain('rounded')
      expect(result).toContain('cursor-pointer')
    })

    it('should add bordered class when showBorder is true', () => {
      const config = createConfig({
        appearance: { showIcon: true, showDescription: true, showBorder: true, cardPadding: 'pa-6', minHeight: 'auto' },
      })
      
      const result = buildSelectionCardClasses(config, false)
      
      expect(result).toContain('selection-card-bordered')
    })

    it('should not add bordered class when showBorder is false', () => {
      const config = createConfig({
        appearance: { showIcon: true, showDescription: true, showBorder: false, cardPadding: 'pa-6', minHeight: 'auto' },
      })
      
      const result = buildSelectionCardClasses(config, false)
      
      expect(result).not.toContain('selection-card-bordered')
    })

    it('should add cardPadding class', () => {
      const config = createConfig({
        appearance: { showIcon: true, showDescription: true, showBorder: true, cardPadding: 'pa-4', minHeight: 'auto' },
      })
      
      const result = buildSelectionCardClasses(config, false)
      
      expect(result).toContain('pa-4')
    })

    it('should add active class when selected', () => {
      const config = createConfig()
      
      const result = buildSelectionCardClasses(config, true)
      
      expect(result).toContain('active')
    })

    it('should not add active class when not selected', () => {
      const config = createConfig()
      
      const result = buildSelectionCardClasses(config, false)
      
      expect(result).not.toContain('active')
    })

    it('should add left-radio class for stack layout with left control', () => {
      const config = createConfig({
        layout: 'stack',
        controlPosition: 'left',
      })
      
      const result = buildSelectionCardClasses(config, false)
      
      expect(result).toContain('selection-card-left-radio')
    })

    it('should not add left-radio class for row layout', () => {
      const config = createConfig({
        layout: 'row',
        controlPosition: 'left',
      })
      
      const result = buildSelectionCardClasses(config, false)
      
      expect(result).not.toContain('selection-card-left-radio')
    })

    it('should not add left-radio class for stack layout with bottom control', () => {
      const config = createConfig({
        layout: 'stack',
        controlPosition: 'bottom',
      })
      
      const result = buildSelectionCardClasses(config, false)
      
      expect(result).not.toContain('selection-card-left-radio')
    })

    it('should handle missing appearance gracefully', () => {
      const config = createConfig({
        appearance: undefined,
      })
      
      // Should not throw
      const result = buildSelectionCardClasses(config, false)
      
      expect(result).toContain('selection-card')
    })
  })

  describe('buildSelectionControlClasses', () => {
    it('should return mb-4 for top position', () => {
      const result = buildSelectionControlClasses('top')
      
      expect(result['mb-4']).toBe(true)
      expect(result['mt-4']).toBe(false)
      expect(result['mr-4']).toBe(false)
    })

    it('should return mt-4 for bottom position', () => {
      const result = buildSelectionControlClasses('bottom')
      
      expect(result['mt-4']).toBe(true)
      expect(result['mb-4']).toBe(false)
      expect(result['mr-4']).toBe(false)
    })

    it('should return mr-4 for left position', () => {
      const result = buildSelectionControlClasses('left')
      
      expect(result['mr-4']).toBe(true)
      expect(result['mb-4']).toBe(false)
      expect(result['mt-4']).toBe(false)
    })

    it('should return d-none for hidden position', () => {
      const result = buildSelectionControlClasses('hidden')
      
      expect(result['d-none']).toBe(true)
    })

    it('should handle undefined position', () => {
      const result = buildSelectionControlClasses(undefined)
      
      // All position-based classes should be false for undefined
      expect(result['mb-4']).toBe(false)
      expect(result['mt-4']).toBe(false)
      expect(result['mr-4']).toBe(false)
    })
  })

  describe('buildSelectionContentContainerClasses', () => {
    it('should include base classes', () => {
      const config = createConfig()
      
      const result = buildSelectionContentContainerClasses(config)
      
      expect(result).toContain('d-flex')
      expect(result).toContain('flex-column')
      expect(result).toContain('gap-2')
      expect(result).toContain('content-container')
    })

    it('should center align for row layout', () => {
      const config = createConfig({ layout: 'row' })
      
      const result = buildSelectionContentContainerClasses(config)
      
      expect(result).toContain('align-center')
      expect(result).toContain('text-center')
    })

    it('should start align for stack layout with left control', () => {
      const config = createConfig({
        layout: 'stack',
        controlPosition: 'left',
      })
      
      const result = buildSelectionContentContainerClasses(config)
      
      expect(result).toContain('align-start')
      expect(result).toContain('text-start')
    })

    it('should center align for stack layout with non-left control', () => {
      const config = createConfig({
        layout: 'stack',
        controlPosition: 'bottom',
      })
      
      const result = buildSelectionContentContainerClasses(config)
      
      expect(result).toContain('align-center')
      expect(result).toContain('text-center')
    })

    it('should center align for stack layout with top control', () => {
      const config = createConfig({
        layout: 'stack',
        controlPosition: 'top',
      })
      
      const result = buildSelectionContentContainerClasses(config)
      
      expect(result).toContain('align-center')
      expect(result).toContain('text-center')
    })

    it('should center align for column layout', () => {
      const config = createConfig({ layout: 'column' })
      
      const result = buildSelectionContentContainerClasses(config)
      
      expect(result).toContain('align-center')
      expect(result).toContain('text-center')
    })
  })
})
