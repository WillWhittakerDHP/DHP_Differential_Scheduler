/**
 * WHY: Tracks which template textarea is active and inserts `{variableName}` at the caret (or appends).
 * PATTERN: Uses `data-event-template-field` on VTextarea with the browser focused element for selection.
 */
import { ref, nextTick, type Ref } from 'vue'
import { getActiveElement } from '@/utils/dom/activeElement'

export type EventInstanceTemplateFieldKey = 'titleTemplate' | 'descriptionTemplate' | 'locationTemplate'

export interface EventInstanceTemplateModel {
  titleTemplate: string
  descriptionTemplate: string
  locationTemplate: string
}

export interface UseEventInstanceBuilderReturn {
  activeTemplateField: Ref<EventInstanceTemplateFieldKey>
  setActiveTemplateField: (key: EventInstanceTemplateFieldKey) => void
  insertVariable: (variableName: string) => void
}

export function useEventInstanceBuilder(model: Ref<EventInstanceTemplateModel>): UseEventInstanceBuilderReturn {
  const activeTemplateField = ref<EventInstanceTemplateFieldKey>('titleTemplate')

  function setActiveTemplateField(key: EventInstanceTemplateFieldKey): void {
    activeTemplateField.value = key
  }

  function insertVariable(variableName: string): void {
    const field = activeTemplateField.value
    const token = `{${variableName}}`
    const activeEl = getActiveElement()
    const current = model.value[field]

    if (
      activeEl instanceof HTMLTextAreaElement &&
      activeEl.getAttribute('data-event-template-field') === field
    ) {
      const start = activeEl.selectionStart
      const end = activeEl.selectionEnd ?? start
      const next = `${current.slice(0, start)}${token}${current.slice(end)}`
      model.value = { ...model.value, [field]: next }
      const caret = start + token.length
      void nextTick(() => {
        activeEl.focus()
        activeEl.setSelectionRange(caret, caret)
      })
      return
    }

    model.value = { ...model.value, [field]: `${current}${token}` }
  }

  return {
    activeTemplateField,
    setActiveTemplateField,
    insertVariable,
  }
}
