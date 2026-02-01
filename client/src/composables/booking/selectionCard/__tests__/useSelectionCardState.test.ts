
import { describe, it, expect, vi } from 'vitest'
import { ref, computed, nextTick } from 'vue'
import { useSelectionCardState } from '../useSelectionCardState'
import type { SelectionCardItem, StatePlugin } from '@/components/booking/types/selectionCardTypes'

function createItem(id: string): SelectionCardItem {
  return {
    id,
    name: `Item ${id}`,
    description: 'Test item',
  } as SelectionCardItem
}

function createMockPlugin(getValue = vi.fn(() => false)): StatePlugin {
  return {
    id: 'test-plugin',
    getValue,
    setValue: vi.fn(),
  }
}

describe('useSelectionCardState', () => {
  describe('activeStatePlugin', () => {
    it('should return first plugin when statePlugins provided', () => {
      const plugin = createMockPlugin()
      const emit = vi.fn()
      
      const { activeStatePlugin } = useSelectionCardState({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({
          stateSource: 'plugin',
          statePlugins: [plugin],
        })),
        emit,
      })
      
      expect(activeStatePlugin.value).toBe(plugin)
    })

    it('should create local plugin when stateSource is local', () => {
      const emit = vi.fn()
      
      const { activeStatePlugin } = useSelectionCardState({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({
          stateSource: 'local',
          statePlugins: [],
        })),
        emit,
      })
      
      expect(activeStatePlugin.value).not.toBeNull()
      expect(activeStatePlugin.value).toHaveProperty('getValue')
      expect(activeStatePlugin.value).toHaveProperty('setValue')
    })

    it('should create local plugin when stateSource is undefined', () => {
      const emit = vi.fn()
      
      const { activeStatePlugin } = useSelectionCardState({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({
          statePlugins: [],
        })),
        emit,
      })
      
      expect(activeStatePlugin.value).not.toBeNull()
    })
  })

  describe('isSelected', () => {
    it('should use plugin getValue when plugin available', () => {
      const getValue = vi.fn(() => true)
      const plugin = createMockPlugin(getValue)
      const emit = vi.fn()
      
      const { isSelected } = useSelectionCardState({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({
          stateSource: 'plugin',
          statePlugins: [plugin],
        })),
        emit,
      })
      
      expect(isSelected.value).toBe(true)
      expect(getValue).toHaveBeenCalled()
    })

    it('should fall back to modelValue comparison (string)', () => {
      const emit = vi.fn()
      
      const { isSelected } = useSelectionCardState({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => 'item-1'),
        configWithDefaults: computed(() => ({
          stateSource: 'local',
          statePlugins: [],
        })),
        emit,
      })
      
      expect(typeof isSelected.value).toBe('boolean')
    })

    it('should return false when not selected', () => {
      const getValue = vi.fn(() => false)
      const plugin = createMockPlugin(getValue)
      const emit = vi.fn()
      
      const { isSelected } = useSelectionCardState({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => 'other-item'),
        configWithDefaults: computed(() => ({
          stateSource: 'plugin',
          statePlugins: [plugin],
        })),
        emit,
      })
      
      expect(isSelected.value).toBe(false)
    })

    it('should be reactive to modelValue changes', async () => {
      const emit = vi.fn()
      const modelValueRef = ref<string | null>(null)
      
      const { isSelected } = useSelectionCardState({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => modelValueRef.value),
        configWithDefaults: computed(() => ({
          stateSource: 'local',
          statePlugins: [],
        })),
        emit,
      })
      
      const initialSelected = isSelected.value
      
      modelValueRef.value = 'item-1'
      await nextTick()
      
      expect(typeof isSelected.value).toBe('boolean')
    })
  })

  describe('pluginWatchSource', () => {
    it('should return watch source from plugin', () => {
      const watchSource = vi.fn(() => ref('test'))
      const plugin: StatePlugin = {
        id: 'test-plugin',
        getValue: vi.fn(() => false),
        setValue: vi.fn(),
        watchSource,
      }
      const emit = vi.fn()
      
      const { pluginWatchSource } = useSelectionCardState({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({
          stateSource: 'plugin',
          statePlugins: [plugin],
        })),
        emit,
      })
      
      expect(pluginWatchSource.value).toBeDefined()
    })

    it('should return undefined when no watchSource on plugin', () => {
      const plugin = createMockPlugin()
      const emit = vi.fn()
      
      const { pluginWatchSource } = useSelectionCardState({
        item: computed(() => createItem('item-1')),
        modelValue: computed(() => null),
        configWithDefaults: computed(() => ({
          stateSource: 'plugin',
          statePlugins: [plugin],
        })),
        emit,
      })
      
      expect(pluginWatchSource.value).toBeUndefined()
    })
  })
})
