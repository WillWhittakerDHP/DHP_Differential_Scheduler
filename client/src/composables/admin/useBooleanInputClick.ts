/**
 */
import type { Ref } from 'vue'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'
import type { UseStatusButtonToggleReturn } from '@/types/admin/statusButtonToggle'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityKey } from '@/constants/entities'
import { runBooleanInputClick, type BooleanInputClickDeps } from '@/utils/admin/booleanInputClickHandler'

interface UseBooleanInputClickParams {
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  entityCardSaveContext: EntityCardSaveContext | undefined
  rawFieldValue: Ref<unknown>
  statusButtonToggle: UseStatusButtonToggleReturn<GlobalEntityKey>
}

export function useBooleanInputClick(params: UseBooleanInputClickParams): (event: Event) => Promise<void> {
  const deps: BooleanInputClickDeps = params
  return (event: Event) => runBooleanInputClick(event, deps)
}
