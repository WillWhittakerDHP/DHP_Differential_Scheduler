
import { describe, it, expect } from 'vitest'
import { computed, ref, nextTick } from 'vue'
import { useSelectionCardStyles } from '../useSelectionCardStyles'
import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

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

describe('useSelectionCardStyles', () => {
  describe('cardClasses', () => {
    it('should include base classes', () => {
      const { cardClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig()),
        isSelected: computed(() => false),
      })
      
      expect(cardClasses.value).toContain('selection-card')
      expect(cardClasses.value).toContain('rounded')
    })

    it('should include active class when selected', () => {
      const { cardClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig()),
        isSelected: computed(() => true),
      })
      
      expect(cardClasses.value).toContain('active')
    })

    it('should not include active class when not selected', () => {
      const { cardClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig()),
        isSelected: computed(() => false),
      })
      
      expect(cardClasses.value).not.toContain('active')
    })

    it('should include cardPadding class', () => {
      const { cardClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig({
          appearance: {
            showIcon: true,
            showDescription: true,
            showBorder: true,
            cardPadding: 'pa-4',
            minHeight: 'auto',
          },
        })),
        isSelected: computed(() => false),
      })
      
      expect(cardClasses.value).toContain('pa-4')
    })

    it('should be reactive to isSelected changes', async () => {
      const isSelectedRef = ref(false)
      
      const { cardClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig()),
        isSelected: computed(() => isSelectedRef.value),
      })
      
      expect(cardClasses.value).not.toContain('active')
      
      isSelectedRef.value = true
      await nextTick()
      
      expect(cardClasses.value).toContain('active')
    })
  })

  describe('controlClasses', () => {
    it('should return mt-4 for bottom position', () => {
      const { controlClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig({ controlPosition: 'bottom' })),
        isSelected: computed(() => false),
      })
      
      expect(controlClasses.value['mt-4']).toBe(true)
    })

    it('should return mb-4 for top position', () => {
      const { controlClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig({ controlPosition: 'top' })),
        isSelected: computed(() => false),
      })
      
      expect(controlClasses.value['mb-4']).toBe(true)
    })

    it('should return d-none for hidden position', () => {
      const { controlClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig({ controlPosition: 'hidden' })),
        isSelected: computed(() => false),
      })
      
      expect(controlClasses.value['d-none']).toBe(true)
    })
  })

  describe('contentContainerClasses', () => {
    it('should include base classes', () => {
      const { contentContainerClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig()),
        isSelected: computed(() => false),
      })
      
      expect(contentContainerClasses.value).toContain('d-flex')
      expect(contentContainerClasses.value).toContain('flex-column')
    })

    it('should center align for row layout', () => {
      const { contentContainerClasses } = useSelectionCardStyles({
        configWithDefaults: computed(() => createConfig({ layout: 'row' })),
        isSelected: computed(() => false),
      })
      
      expect(contentContainerClasses.value).toContain('align-center')
      expect(contentContainerClasses.value).toContain('text-center')
    })
  })
})
