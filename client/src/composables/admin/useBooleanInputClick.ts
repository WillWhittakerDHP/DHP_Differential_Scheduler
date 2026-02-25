/**
 * WHY: Component-logic audit - move async handleClick out of BooleanInput.
 */
import type { Ref } from 'vue'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'
import type { UseStatusButtonToggleReturn } from '@/types/admin/statusButtonToggle'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseBooleanInputClickParams {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  entityCardSaveContext: EntityCardSaveContext | undefined
  rawFieldValue: Ref<unknown>
  statusButtonToggle: UseStatusButtonToggleReturn<GlobalEntityKey>
}

export function useBooleanInputClick(params: UseBooleanInputClickParams): (event: Event) => Promise<void> {
  const { fieldContext, entityCardSaveContext, rawFieldValue, statusButtonToggle } = params

  async function handleClick(event: Event): Promise<void> {
    event.stopPropagation()
    event.preventDefault()
    if (fieldContext.displayConfig.disabled || fieldContext.displayConfig.readOnly) return

    if (entityCardSaveContext?.isNew) {
      const currentRaw = rawFieldValue.value
      const isTernary = currentRaw === 'true' || currentRaw === 'false' || currentRaw === 'override'
      if (isTernary) {
        let newTernary: 'true' | 'false' | 'override'
        if (currentRaw === 'false') newTernary = 'true'
        else if (currentRaw === 'true') newTernary = 'override'
        else newTernary = 'false'
        fieldContext.setValue(newTernary)
        return
      }
      const normalizedRaw = currentRaw === '' ? false : currentRaw
      const isBooleanish =
        normalizedRaw === true ||
        normalizedRaw === false ||
        normalizedRaw === null ||
        normalizedRaw === undefined
      if (!isBooleanish) return
      const currentValue = normalizedRaw === true
      const newValue = !currentValue
      fieldContext.setValue(newValue)
      if (fieldContext.entityKey === 'blockShape' && newValue === true) {
        const formInstance = fieldContext.formInstance
        if (formInstance) {
          if (fieldContext.fieldKey === 'isStateControl') {
            formInstance.setFieldValue('canHaveParts', false)
          } else if (fieldContext.fieldKey === 'canHaveParts') {
            formInstance.setFieldValue('isStateControl', false)
          }
        }
      }
      return
    }
    await statusButtonToggle.toggleStatusButton(fieldContext.fieldKey, event)
  }

  return handleClick
}
