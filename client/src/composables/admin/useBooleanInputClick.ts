/**
 */
import type { Ref } from 'vue'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'
import type { UseStatusButtonToggleReturn } from '@/types/admin/statusButtonToggle'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityKey } from '@/constants/entities'

export interface UseBooleanInputClickParams {
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  entityCardSaveContext: EntityCardSaveContext | undefined
  rawFieldValue: Ref<unknown>
  statusButtonToggle: UseStatusButtonToggleReturn<GlobalEntityKey>
}

export function useBooleanInputClick(params: UseBooleanInputClickParams): (event: Event) => Promise<void> {
  const { fieldContext, entityCardSaveContext, rawFieldValue, statusButtonToggle } = params

  async function handleClick(event: Event): Promise<void> {
    event.stopPropagation()
    event.preventDefault()
    if (fieldContext.state.displayConfig.disabled || fieldContext.state.displayConfig.readOnly) return

    if (entityCardSaveContext?.isNew) {
      const currentRaw = rawFieldValue.value
      const isTernary = currentRaw === 'true' || currentRaw === 'false' || currentRaw === 'override'
      if (isTernary) {
        let newTernary: 'true' | 'false' | 'override'
        if (currentRaw === 'false') newTernary = 'true'
        else if (currentRaw === 'true') newTernary = 'override'
        else newTernary = 'false'
        fieldContext.actions.setValue(newTernary)
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
      fieldContext.actions.setValue(newValue)
      if (fieldContext.state.entityKey === 'blockShape' && newValue === true) {
        const formInstance = fieldContext.state.formInstance
        if (formInstance) {
          if (fieldContext.state.fieldKey === 'isStateControl') {
            formInstance.setFieldValue('canHaveParts', false)
          } else if (fieldContext.state.fieldKey === 'canHaveParts') {
            formInstance.setFieldValue('isStateControl', false)
          }
        }
      }
      return
    }
    await statusButtonToggle.toggleStatusButton(fieldContext.state.fieldKey, event)
  }

  return handleClick
}
