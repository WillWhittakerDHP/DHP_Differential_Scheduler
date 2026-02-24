/**
 * PATTERN: Chip display label resolution for select (dev-mode fallback when title is value).
 * WHY: Keeps SelectInputs.vue under vue-architecture script line limit.
 */
import type { Ref } from 'vue'
import type { SelectOption } from '@/composables/useSelectOptions'
import { isDevModeEnabled } from '@/utils/env/devMode'

export function useSelectChipRender(options: Ref<SelectOption[] | { title: string; value: string | number }[]>) {
  const logChipRender = (item: { title: string; value: string | number }): string => {
    if (isDevModeEnabled()) {
      const optionsArray = options.value as SelectOption[]
      let matchingOption: SelectOption | undefined
      for (const opt of optionsArray) {
        if (opt.children) {
          matchingOption = opt.children.find((c: SelectOption) => String(c.value) === String(item.value))
        } else if (String(opt.value) === String(item.value)) {
          matchingOption = opt
        }
        if (matchingOption) break
      }
      if (item.title === String(item.value) && matchingOption) return matchingOption.title
    }
    return item.title
  }
  return { logChipRender }
}
