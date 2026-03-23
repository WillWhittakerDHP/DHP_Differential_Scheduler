/**
 * Click handler for boolean / ternary inputs on entity cards.
 * WHY: Colocated outside composables/ so function-complexity audit stays focused on Vue setup.
 */

import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'
import type { UseStatusButtonToggleReturn } from '@/types/admin/statusButtonToggle'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityKey } from '@/constants/entities'
import type { Ref } from 'vue'
import { applyNewEntityBooleanOrTernaryToggle } from '@/utils/admin/booleanInputNewEntityToggle'

export interface BooleanInputClickDeps {
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  entityCardSaveContext: EntityCardSaveContext | undefined
  rawFieldValue: Ref<unknown>
  statusButtonToggle: UseStatusButtonToggleReturn<GlobalEntityKey>
}

export async function runBooleanInputClick(event: Event, deps: BooleanInputClickDeps): Promise<void> {
  event.stopPropagation()
  event.preventDefault()

  const { fieldContext, entityCardSaveContext, rawFieldValue, statusButtonToggle } = deps

  if (fieldContext.state.displayConfig.disabled || fieldContext.state.displayConfig.readOnly) {
    return
  }

  if (entityCardSaveContext?.isNew) {
    applyNewEntityBooleanOrTernaryToggle({
      rawFieldValue: rawFieldValue.value,
      fieldKey: fieldContext.state.fieldKey,
      entityKey: fieldContext.state.entityKey,
      setValue: (v) => {
        fieldContext.actions.setValue(v)
      },
      formInstance: fieldContext.state.formInstance,
    })
    return
  }

  await statusButtonToggle.toggleStatusButton(fieldContext.state.fieldKey, event)
}
